import { Server, Socket } from "socket.io";
import { GameColor, RoomPlayer } from "../types";
import { logger } from "../utils/logger";
import { UserRepository } from "../repositories/user.repository";
import { RoomRepository } from "../repositories/room.repository";

interface Room {
  code: string;
  dbId: string;
  hostSocketId: string;
  players: RoomPlayer[];
  sequence: GameColor[];
  currentLevel: number;
  status: "waiting" | "showing" | "input" | "finished";
  currentPlayerIndex: number;
  isPublic: boolean;
  maxPlayers: number;
}

const COLORS: GameColor[] = ["red", "green", "blue", "yellow"];

// In-memory room state (use Redis for multi-instance production)
const activeRooms = new Map<string, Room>();

const userRepo = new UserRepository();
const roomRepo = new RoomRepository();

function getRandomColor(): GameColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function setupSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    emitPublicRooms(io);

    socket.on(
      "create_room",
      async (data: {
        code: string;
        dbId: string;
        userId: string;
        username: string;
        isPublic: boolean;
        maxPlayers: number;
      }) => {
        const room: Room = {
          code: data.code,
          dbId: data.dbId,
          hostSocketId: socket.id,
          players: [
            {
              userId: data.userId,
              username: data.username,
              isAlive: true,
              score: 0,
              socketId: socket.id,
            },
          ],
          sequence: [],
          currentLevel: 0,
          status: "waiting",
          currentPlayerIndex: 0,
          isPublic: data.isPublic,
          maxPlayers: data.maxPlayers,
        };

        activeRooms.set(data.code, room);
        socket.join(data.code);
        socket.emit("room_created", { room: sanitizeRoom(room) });
        emitPublicRooms(io);
        logger.info(`Room created: ${data.code} by ${data.username}`);
      },
    );

    socket.on("join_room", (data) => {
      const room = activeRooms.get(data.code);
      if (!room) {
        logger.warn(
          `Room not found: ${data.code} | userId: ${data.userId} | socket: ${socket.id}`,
        );
        socket.emit("error", {
          message: "Sala não encontrada ou foi encerrada",
          code: "ROOM_NOT_FOUND",
        });
        return;
      }

      const existingIdx = room.players.findIndex(
        (p) => p.userId === data.userId,
      );

      // FIX: reconexão tem prioridade — verificar ANTES de checar sala cheia ou status
      if (existingIdx >= 0) {
        logger.info(
          `Player ${data.username} reconnecting to room ${data.code}`,
        );

        const oldSocketId = room.players[existingIdx].socketId;
        room.players[existingIdx].socketId = socket.id;

        // Se quem reconectou era o host, restaurar hostSocketId
        if (oldSocketId === room.hostSocketId) {
          room.hostSocketId = socket.id;
        }

        socket.join(data.code);
        // Notifica o reconectado com estado atual
        socket.emit("room_updated", { room: sanitizeRoom(room) });
        // Notifica os outros (ex: host ver que o guest voltou)
        socket.to(data.code).emit("room_updated", { room: sanitizeRoom(room) });

        if (room.status === "showing" || room.status === "input") {
          socket.emit("match_started", {
            sequence: room.sequence,
            level: room.currentLevel,
          });
        }
        return;
      }

      // Novo jogador (não é reconexão)
      if (room.status !== "waiting") {
        socket.emit("error", { message: "Partida já em andamento" });
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        socket.emit("error", { message: "Sala cheia" });
        return;
      }

      room.players.push({
        userId: data.userId,
        username: data.username,
        isAlive: true,
        score: 0,
        socketId: socket.id,
      });

      socket.join(data.code);
      io.to(data.code).emit("room_updated", { room: sanitizeRoom(room) });
      emitPublicRooms(io);
      logger.info(`${data.username} joined room ${data.code}`);
    });

    socket.on("leave_room", (data: { code: string }) => {
      handleLeave(io, socket, data.code);
    });

    socket.on("start_match", async (data: { code: string }) => {
      const room = activeRooms.get(data.code);
      if (!room) return;
      if (socket.id !== room.hostSocketId) {
        socket.emit("error", { message: "Apenas o host pode iniciar" });
        return;
      }
      if (room.players.length < 2) {
        socket.emit("error", {
          message: "São necessários pelo menos 2 jogadores",
        });
        return;
      }

      await roomRepo.updateStatus(room.dbId, "IN_PROGRESS");

      room.sequence = [getRandomColor()];
      room.currentLevel = 1;
      room.status = "showing";
      room.players.forEach((p) => {
        p.isAlive = true;
        p.score = 0;
      });

      io.to(data.code).emit("match_started", {
        sequence: room.sequence,
        level: room.currentLevel,
      });
    });

    socket.on("sequence_shown", (data: { code: string }) => {
      const room = activeRooms.get(data.code);
      if (!room) return;
      // Only host signals sequence is done showing
      if (socket.id !== room.hostSocketId) return;
      room.status = "input";
      room.currentPlayerIndex = 0;
      const alivePlayers = room.players.filter((p) => p.isAlive);
      if (alivePlayers.length > 0) {
        io.to(data.code).emit("your_turn", {
          playerId: alivePlayers[0].userId,
          sequence: room.sequence,
        });
      }
    });

    socket.on(
      "player_input",
      (data: { code: string; userId: string; inputSequence: GameColor[] }) => {
        const room = activeRooms.get(data.code);
        if (!room || room.status !== "input") return;

        const isCorrect =
          data.inputSequence.every((color, i) => color === room.sequence[i]) &&
          data.inputSequence.length === room.sequence.length;

        if (!isCorrect) {
          // Mark player as failed
          const player = room.players.find((p) => p.userId === data.userId);
          if (player) player.isAlive = false;

          io.to(data.code).emit("player_failed", {
            userId: data.userId,
            username: player?.username,
            players: sanitizePlayers(room.players),
          });

          checkWinner(io, room);
          return;
        }

        // Correct! Update score
        const player = room.players.find((p) => p.userId === data.userId);
        if (player) player.score += room.currentLevel * 100;

        io.to(data.code).emit("player_correct", {
          userId: data.userId,
          score: player?.score ?? 0,
        });

        // Move to next alive player
        const alivePlayers = room.players.filter((p) => p.isAlive);
        const currentIdx = alivePlayers.findIndex(
          (p) => p.userId === data.userId,
        );
        const nextIdx = currentIdx + 1;

        if (nextIdx < alivePlayers.length) {
          // Next player's turn
          io.to(data.code).emit("your_turn", {
            playerId: alivePlayers[nextIdx].userId,
            sequence: room.sequence,
          });
        } else {
          // All alive players completed this round → next level
          room.currentLevel++;
          room.sequence.push(getRandomColor());
          room.status = "showing";

          io.to(data.code).emit("next_round", {
            sequence: room.sequence,
            level: room.currentLevel,
            players: sanitizePlayers(room.players),
          });
        }
      },
    );

    socket.on("disconnect", () => {
      // Find all rooms where this socket is a player
      for (const [code, room] of activeRooms.entries()) {
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          logger.debug(`${player.username} disconnected from room ${code}`);
          if (room.status === "waiting") {
            handleLeave(io, socket, code);
          }
          // If in-game, mark as failed for now
          if (room.status === "input" || room.status === "showing") {
            player.isAlive = false;
            io.to(code).emit("player_disconnected", {
              userId: player.userId,
              username: player.username,
              players: sanitizePlayers(room.players),
            });
            checkWinner(io, room);
          }
        }
      }
    });
  });
}

function handleLeave(io: Server, socket: Socket, code: string): void {
  const room = activeRooms.get(code);
  if (!room) return;

  room.players = room.players.filter((p) => p.socketId !== socket.id);
  socket.leave(code);

  if (room.players.length === 0) {
    activeRooms.delete(code);
    roomRepo.updateStatus(room.dbId, "FINISHED").catch(() => {});
  } else {
    // Transfer host if needed
    if (room.hostSocketId === socket.id) {
      room.hostSocketId = room.players[0].socketId;
      io.to(code).emit("host_changed", { newHostId: room.players[0].userId });
    }
    io.to(code).emit("room_updated", { room: sanitizeRoom(room) });
  }
  emitPublicRooms(io);
}

async function checkWinner(io: Server, room: Room): Promise<void> {
  const alivePlayers = room.players.filter((p) => p.isAlive);

  if (alivePlayers.length <= 1) {
    room.status = "finished";
    const winner = alivePlayers[0] ?? null;

    if (winner) {
      try {
        await userRepo.incrementWins(winner.userId);
      } catch {}
    }

    io.to(room.code).emit("match_ended", {
      winner: winner
        ? {
            userId: winner.userId,
            username: winner.username,
            score: winner.score,
          }
        : null,
      players: sanitizePlayers(room.players),
    });

    // Reset room after delay
    setTimeout(() => {
      if (activeRooms.has(room.code)) {
        room.status = "waiting";
        room.sequence = [];
        room.currentLevel = 0;
        room.players.forEach((p) => {
          p.isAlive = true;
          p.score = 0;
        });
        io.to(room.code).emit("room_reset", { room: sanitizeRoom(room) });
      }
    }, 5000);
  }
}

function emitPublicRooms(io: Server): void {
  const publicRooms = Array.from(activeRooms.values())
    .filter((r) => r.isPublic && r.status === "waiting")
    .map((r) => ({
      code: r.code,
      host: r.players[0]?.username ?? "Unknown",
      players: r.players.length,
      maxPlayers: r.maxPlayers,
    }));
  io.emit("public_rooms_update", publicRooms);
}

function sanitizeRoom(room: Room) {
  return {
    code: room.code,
    status: room.status,
    isPublic: room.isPublic,
    maxPlayers: room.maxPlayers,
    players: sanitizePlayers(room.players),
    currentLevel: room.currentLevel,
    hostSocketId: room.hostSocketId,
  };
}

function sanitizePlayers(players: RoomPlayer[]) {
  return players.map((p) => ({
    userId: p.userId,
    username: p.username,
    isAlive: p.isAlive,
    score: p.score,
    socketId: p.socketId,
  }));
}

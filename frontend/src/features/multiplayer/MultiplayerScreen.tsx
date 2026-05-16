"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  Copy,
  Crown,
  Lock,
  Globe,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { GeniusBoard } from "@/components/game/GeniusBoard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/contexts/auth.store";
import { useT } from "@/contexts/i18n";
import { roomApi } from "@/services/api";
import { getSocket, roomSession } from "@/services/socket";
import { useSound } from "@/hooks/useSound";
import { GameColor, PublicRoom, Room, RoomPlayer } from "@/types";
import toast from "react-hot-toast";

type Screen = "lobby" | "create" | "room" | "game" | "result";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

export function MultiplayerScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { playColor, playWin, playLose } = useSound();
  const t = useT();

  const [screen, setScreen] = useState<Screen>("lobby");
  const [direction, setDirection] = useState(1);
  const [joinCode, setJoinCode] = useState(searchParams.get("join") || "");
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Create room form
  const [createIsPublic, setCreateIsPublic] = useState(false);
  const [createMaxPlayers, setCreateMaxPlayers] = useState(2);

  // Game state
  const [sequence, setSequence] = useState<GameColor[]>([]);
  const [activeColor, setActiveColor] = useState<GameColor | null>(null);
  const [playerInput, setPlayerInput] = useState<GameColor[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameLevel, setGameLevel] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: RoomPlayer | null;
    players: RoomPlayer[];
  } | null>(null);

  const socketRef = useRef(getSocket());
  const socket = socketRef.current;
  const showTimeouts = useRef<NodeJS.Timeout[]>([]);
  const reconnectAttempts = useRef(0);

  const goTo = (s: Screen, dir = 1) => {
    setDirection(dir);
    setScreen(s);
  };

  // Reconexão pós-F5
  useEffect(() => {
    if (!user) return;
    const session = roomSession.get();
    if (session) {
      const { roomCode, userId, username } = session;
      const tid = setTimeout(() => {
        socket.emit("join_room", { code: roomCode, userId, username });
        reconnectAttempts.current++;
      }, 100);
      return () => clearTimeout(tid);
    }
  }, [user, socket]);

  useEffect(() => {
    socket.on("public_rooms_update", (rooms: PublicRoom[]) =>
      setPublicRooms(rooms),
    );

    socket.on("room_created", ({ room: r }: { room: Room }) => {
      setRoom(r);
      goTo("room");
    });

    socket.on("room_updated", ({ room: r }: { room: Room }) => {
      setRoom(r);
      setScreen((prev) =>
        prev === "lobby" || prev === "create" ? "room" : prev,
      );
    });

    socket.on("error", ({ message }: { message: string }) =>
      toast.error(message),
    );
    socket.on("host_changed", () => toast(t("host")));

    socket.on(
      "match_started",
      ({ sequence: seq, level }: { sequence: GameColor[]; level: number }) => {
        setSequence(seq);
        setGameLevel(level);
        goTo("game");
        setPlayerInput([]);
        setIsMyTurn(false);
        setRoom((cur) => {
          if (cur)
            showSequenceAnimation(
              seq,
              cur.code,
              socket.id === cur.hostSocketId,
            );
          return cur;
        });
      },
    );

    socket.on("next_round", ({ sequence: seq, level, players }: any) => {
      setGameLevel(level);
      setSequence(seq);
      setRoom((r) => {
        if (r) {
          showSequenceAnimation(seq, r.code, socket.id === r.hostSocketId);
          return { ...r, players };
        }
        return r;
      });
      setPlayerInput([]);
      setIsMyTurn(false);
      setActiveColor(null);
    });

    socket.on(
      "your_turn",
      ({ playerId }: { playerId: string; sequence: GameColor[] }) => {
        setIsMyTurn(playerId === user?.id);
      },
    );

    socket.on("player_failed", ({ userId, players }: any) => {
      if (userId === user?.id) {
        playLose();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      setRoom((r) => (r ? { ...r, players } : r));
    });

    socket.on("player_correct", ({ userId, score }: any) => {
      if (userId === user?.id) playWin();
      setRoom((r) =>
        r
          ? {
              ...r,
              players: r.players.map((p) =>
                p.userId === userId ? { ...p, score } : p,
              ),
            }
          : r,
      );
    });

    socket.on("match_ended", ({ winner, players }: any) => {
      setGameResult({ winner, players });
      goTo("result");
      if (winner?.userId === user?.id) playWin();
      else playLose();
    });

    socket.on("room_reset", ({ room: r }: { room: Room }) => {
      setRoom(r);
      goTo("room");
      setGameResult(null);
      setSequence([]);
      setPlayerInput([]);
      setIsMyTurn(false);
    });

    socket.on("player_disconnected", ({ username, players }: any) => {
      toast(`${username} desconectou`);
      setRoom((r) => (r ? { ...r, players } : r));
    });

    return () => {
      [
        "public_rooms_update",
        "room_created",
        "room_updated",
        "error",
        "host_changed",
        "match_started",
        "your_turn",
        "next_round",
        "player_failed",
        "player_correct",
        "match_ended",
        "room_reset",
        "player_disconnected",
      ].forEach((e) => socket.off(e));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function showSequenceAnimation(
    seq: GameColor[],
    roomCode: string,
    isHostPlayer: boolean,
  ) {
    showTimeouts.current.forEach(clearTimeout);
    showTimeouts.current = [];
    setShowingSequence(true);
    setActiveColor(null);
    seq.forEach((color, i) => {
      const t1 = setTimeout(
        () => {
          setActiveColor(color);
          playColor(color);
        },
        i * 700 + 400,
      );
      const t2 = setTimeout(() => setActiveColor(null), i * 700 + 900);
      showTimeouts.current.push(t1, t2);
    });
    const done = setTimeout(
      () => {
        setShowingSequence(false);
        if (isHostPlayer) socket.emit("sequence_shown", { code: roomCode });
      },
      seq.length * 700 + 1100,
    );
    showTimeouts.current.push(done);
  }

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error(t("loginFirst"));
      return;
    }
    setIsCreating(true);
    try {
      const { data } = await roomApi.create(createIsPublic, createMaxPlayers);
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.off("room_created", handler);
          reject(new Error("Timeout"));
        }, 5000);
        const handler = ({ room: r }: { room: Room }) => {
          clearTimeout(timeout);
          socket.off("room_created", handler);
          setRoom(r);
          goTo("room");
          resolve();
        };
        socket.once("room_created", handler);
        socket.emit("create_room", {
          code: data.code,
          dbId: data.id,
          userId: user.id,
          username: user.username,
          isPublic: createIsPublic,
          maxPlayers: createMaxPlayers,
        });
        roomSession.save(data.code, user.id, user.username);
      });
    } catch {
      toast.error("Erro ao criar sala");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = useCallback(
    async (code?: string) => {
      const c = (code ?? joinCode).toUpperCase().trim();
      if (!c) {
        toast.error(t("enterCode"));
        return;
      }
      if (!user) {
        toast.error(t("loginFirst"));
        return;
      }
      setIsJoining(true);
      try {
        await roomApi.getByCode(c);
        socket.emit("join_room", {
          code: c,
          userId: user.id,
          username: user.username,
        });
        roomSession.save(c, user.id, user.username);
      } catch {
        toast.error(t("roomNotFound"));
      } finally {
        setIsJoining(false);
      }
    },
    [joinCode, user, socket, t],
  );

  const handleLeave = () => {
    if (room) socket.emit("leave_room", { code: room.code });
    roomSession.clear();
    setRoom(null);
    goTo("lobby", -1);
    setSequence([]);
    setGameResult(null);
  };

  const handleStartMatch = () => {
    if (room) socket.emit("start_match", { code: room.code });
  };

  const handleColorPress = (color: GameColor) => {
    if (!isMyTurn || showingSequence || !room) return;
    playColor(color, 0.25);
    const newInput = [...playerInput, color];
    setPlayerInput(newInput);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);
    if (newInput.length === sequence.length) {
      socket.emit("player_input", {
        code: room.code,
        userId: user?.id,
        inputSequence: newInput,
      });
      setPlayerInput([]);
      setIsMyTurn(false);
    }
  };

  const copyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      toast.success(t("copy"));
    }
  };

  const isHost = room && socket.id === room.hostSocketId;

  // ── SCREENS ────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-inner">
        <AnimatePresence mode="wait" custom={direction}>
          {/* LOBBY */}
          {screen === "lobby" && (
            <motion.div
              key="lobby"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push("/home")}
                  className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-xl text-text-primary">
                  {t("multiplayer")}
                </h1>
              </div>

              {/* Create room */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => goTo("create")}
                icon={<Plus className="w-4 h-4" />}
              >
                {t("createRoom")}
              </Button>

              <Divider label="ou entre com código" />

              {/* Join by code */}
              <Card variant="flat" padding="md">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                  {t("roomCode")}
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="font-mono tracking-widest text-center text-lg uppercase"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  <Button
                    variant="primary"
                    size="md"
                    loading={isJoining}
                    onClick={() => handleJoinRoom()}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    {t("joinRoom")}
                  </Button>
                </div>
              </Card>

              {/* Public rooms */}
              {publicRooms.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                    {t("publicRooms")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {publicRooms.map((r) => (
                      <Card key={r.code} variant="default" padding="sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary font-mono">
                              {r.code}
                            </p>
                            <p className="text-xs text-text-muted">
                              Host: {r.host} · {r.players}/{r.maxPlayers}{" "}
                              {t("players")}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleJoinRoom(r.code)}
                          >
                            {t("joinRoom")}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {publicRooms.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-text-muted text-sm">
                    {t("noPublicRooms")}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* CREATE ROOM */}
          {screen === "create" && (
            <motion.div
              key="create"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col gap-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => goTo("lobby", -1)}
                  className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-xl text-text-primary">
                  {t("createRoom")}
                </h1>
              </div>

              {/* Visibility */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  Visibilidade
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: t("privateRoom"),
                      value: false,
                      icon: Lock,
                      desc: "Apenas com código",
                    },
                    {
                      label: t("publicRoom"),
                      value: true,
                      icon: Globe,
                      desc: "Aparece na lista",
                    },
                  ].map(({ label, value, icon: Icon, desc }) => (
                    <button
                      key={String(value)}
                      onClick={() => setCreateIsPublic(value)}
                      className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border transition-all ${
                        createIsPublic === value
                          ? "bg-accent/8 border-accent/40 text-text-primary"
                          : "bg-surface-2 border-[rgb(var(--border)/0.07)] text-text-secondary hover:border-[rgb(var(--border)/0.14)]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${createIsPublic === value ? "text-accent" : "text-text-muted"}`}
                      />
                      <span className="text-sm font-medium text-left">
                        {label}
                      </span>
                      <span className="text-xs text-text-muted text-left">
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max players */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  Jogadores
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t("twoPlayers"), value: 2 },
                    { label: t("fourPlayers"), value: 4 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setCreateMaxPlayers(value)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all ${
                        createMaxPlayers === value
                          ? "bg-accent/8 border-accent/40 text-text-primary"
                          : "bg-surface-2 border-[rgb(var(--border)/0.07)] text-text-secondary hover:border-[rgb(var(--border)/0.14)]"
                      }`}
                    >
                      {createMaxPlayers === value ? (
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted shrink-0" />
                      )}
                      <span className="text-sm font-medium text-left">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={isCreating}
                onClick={handleCreateRoom}
              >
                {t("createNewRoom")}
              </Button>
            </motion.div>
          )}

          {/* ROOM LOBBY */}
          {screen === "room" && room && (
            <motion.div
              key="room"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleLeave}
                  className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-xl text-text-primary">
                  {t("roomCodeLabel")}
                </h1>
                <Badge
                  variant={room.isPublic ? "accent" : "default"}
                  className="ml-auto"
                >
                  {room.isPublic ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {room.isPublic ? t("publicRoom") : t("privateRoom")}
                </Badge>
              </div>

              {/* Code display */}
              <Card variant="flat" padding="md">
                <p className="text-xs text-text-muted mb-2">{t("shareCode")}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-3xl text-text-primary tracking-widest">
                    {room.code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-xs bg-surface-3 px-3 py-2 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                </div>
              </Card>

              {/* Players */}
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  {t("roomPlayers")} {room.players.length}/{room.maxPlayers}
                </p>
                <div className="flex flex-col gap-2">
                  {room.players.map((p) => (
                    <Card key={p.userId} variant="default" padding="sm">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.username} size="sm" />
                        <span className="flex-1 text-sm font-medium text-text-primary">
                          {p.username}
                        </span>
                        {p.socketId === room.hostSocketId && (
                          <Badge variant="warning">
                            <Crown className="w-3 h-3" />
                            {t("host")}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                  {Array.from({
                    length: room.maxPlayers - room.players.length,
                  }).map((_, i) => (
                    <Card key={i} variant="flat" padding="sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-3 border border-dashed border-[rgb(var(--border)/0.14)] shrink-0" />
                        <span className="text-sm text-text-muted">
                          {t("waiting")}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {isHost ? (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleStartMatch}
                  disabled={room.players.length < 2}
                  className="mt-2"
                >
                  {room.players.length < 2
                    ? t("waitingPlayers")
                    : t("startMatch")}
                </Button>
              ) : (
                <div className="text-center py-3">
                  <p className="text-text-muted text-sm animate-pulse-soft">
                    {t("waitingHost")}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* GAME */}
          {screen === "game" && room && (
            <motion.div
              key="game"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col items-center gap-5 pt-2"
            >
              {/* Players */}
              <div className="w-full flex gap-2 flex-wrap justify-center">
                {room.players.map((p) => (
                  <div
                    key={p.userId}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${p.isAlive ? "bg-surface-2 border-[rgb(var(--border)/0.07)]" : "bg-surface-2/40 border-[rgb(var(--border)/0.04)] opacity-40"}`}
                  >
                    <Avatar name={p.username} size="sm" />
                    <div>
                      <p
                        className={`text-xs font-medium ${p.isAlive ? "text-text-primary" : "text-text-muted line-through"}`}
                      >
                        {p.username}
                      </p>
                      <p className="text-xs text-warning font-medium">
                        {p.score} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Level */}
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {t("level")}
                </p>
                <p className="text-4xl font-bold font-mono text-text-primary">
                  {gameLevel}
                </p>
              </div>

              <GeniusBoard
                activeColor={activeColor}
                onPress={handleColorPress}
                disabled={!isMyTurn || showingSequence}
                shaking={isShaking}
                size="md"
              />

              <div className="text-center h-6">
                {showingSequence && (
                  <p className="text-text-muted text-sm animate-pulse-soft">
                    {t("watchSequence")}
                  </p>
                )}
                {isMyTurn && !showingSequence && (
                  <p className="text-accent font-semibold animate-pulse-soft">
                    {t("yourTurn")}
                  </p>
                )}
                {!isMyTurn && !showingSequence && (
                  <p className="text-text-muted text-sm">
                    {t("waitingOthers")}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                {t("leave")}
              </Button>
            </motion.div>
          )}

          {/* RESULT */}
          {screen === "result" && gameResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-5 pt-4"
            >
              <Logo size="sm" animate={false} />

              <div className="text-center">
                {gameResult.winner?.userId === user?.id ? (
                  <>
                    <div className="text-5xl mb-2">🏆</div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      {t("victory")}
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-2">😞</div>
                    <h2 className="text-2xl font-bold text-text-secondary">
                      {t("defeat")}
                    </h2>
                  </>
                )}
                {gameResult.winner && (
                  <p className="text-text-muted text-sm mt-1">
                    {t("winner")}:{" "}
                    <span className="text-text-primary font-medium">
                      {gameResult.winner.username}
                    </span>
                  </p>
                )}
              </div>

              <Card variant="default" padding="md" className="w-full">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                  {t("finalScore")}
                </p>
                <div className="flex flex-col gap-2">
                  {gameResult.players
                    .sort((a, b) => b.score - a.score)
                    .map((p, i) => (
                      <div key={p.userId} className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-5 text-right">
                          {i + 1}°
                        </span>
                        <Avatar name={p.username} size="sm" />
                        <span
                          className={`flex-1 text-sm ${p.isAlive ? "text-text-primary" : "text-text-muted line-through"}`}
                        >
                          {p.username}
                        </span>
                        <span className="text-sm font-semibold text-warning">
                          {p.score}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>

              <div className="flex gap-2 w-full">
                <Button variant="ghost" fullWidth onClick={handleLeave}>
                  {t("leave")}
                </Button>
                {room && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => goTo("room")}
                  >
                    {t("playAgain")}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

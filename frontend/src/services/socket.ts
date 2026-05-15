import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3100";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = Cookies.get("accessToken");
  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Persistência de sala para reconexão após F5
export const roomSession = {
  save: (roomCode: string, userId: string, username: string) => {
    sessionStorage.setItem(
      "genius_room",
      JSON.stringify({ roomCode, userId, username }),
    );
  },
  get: (): { roomCode: string; userId: string; username: string } | null => {
    try {
      const raw = sessionStorage.getItem("genius_room");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear: () => sessionStorage.removeItem("genius_room"),
};

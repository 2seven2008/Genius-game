export interface JwtPayload {
  userId: string;
  username: string;
  isGuest: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface CreateUserDto {
  username: string;
  email?: string;
  password?: string;
  isGuest?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateScoreDto {
  score: number;
  level: number;
}

export interface CreateRoomDto {
  isPublic?: boolean;
  maxPlayers?: number;
}

export type GameColor = "red" | "green" | "blue" | "yellow";

export interface GameState {
  sequence: GameColor[];
  currentLevel: number;
  isShowingSequence: boolean;
  playerTurn: boolean;
  players: RoomPlayer[];
  status: "waiting" | "showing" | "input" | "finished";
}

export interface RoomPlayer {
  userId: string;
  username: string;
  isAlive: boolean;
  score: number;
  socketId: string;
}

export interface SocketData {
  userId: string;
  username: string;
  roomCode?: string;
}

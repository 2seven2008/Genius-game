export type GameColor = 'red' | 'green' | 'blue' | 'yellow';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  wins: number;
  matches: number;
  highScore: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  isAlive: boolean;
  score: number;
  socketId: string;
}

export interface Room {
  code: string;
  status: 'waiting' | 'showing' | 'input' | 'finished';
  isPublic: boolean;
  maxPlayers: number;
  players: RoomPlayer[];
  currentLevel: number;
  hostSocketId: string;
}

export interface PublicRoom {
  code: string;
  host: string;
  players: number;
  maxPlayers: number;
}

export type GamePhase = 'idle' | 'showing' | 'input' | 'correct' | 'wrong' | 'gameover';

export interface SingleplayerState {
  sequence: GameColor[];
  playerInput: GameColor[];
  level: number;
  score: number;
  phase: GamePhase;
  activeColor: GameColor | null;
  highScore: number;
}

export interface RankingEntry {
  id: string;
  username: string;
  wins?: number;
  highScore?: number;
  matches?: number;
}

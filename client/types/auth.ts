export interface User {
  id: number;
  email: string;
  username: string;
  highScore: number;
  gameHistories: GameHistory[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

export interface ApiError {
  error: string;
}

export interface GameHistory {
  id: string;
  userId: number;
  score: number;
  clicks: number;
  cps: number;
  isValid: boolean;
  createdAt: string;
}

import { createContext } from 'react';
import type { UserProfile, LoginData } from '../services/auth';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  loginWithToken: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

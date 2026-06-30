import { createContext } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  points: number;
  level: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (username: string, email: string, password: string, fullName: string) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, profilePicture?: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

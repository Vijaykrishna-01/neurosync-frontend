// src/types/auth.ts

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
}

export interface AuthResponse {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user: User;
  menu?: MenuItem[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  menu: MenuItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
}


export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  path: string | null;
  icon: string | null;
  target: 'SELF' | 'BLANK';
  sortOrder: number;
  children: MenuItem[];
}

// extend AuthState / AuthContextValue with: menu: MenuItem[]

export interface AuthContextValue extends AuthState {
  menu: MenuItem[];
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}
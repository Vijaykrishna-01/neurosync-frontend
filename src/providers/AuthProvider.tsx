// src/providers/AuthProvider.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth.service';
import { AUTH_TOKEN_KEY, LOGIN_ROUTE, ROLE_DASHBOARD_MAP } from '@/constants';
import { AuthContextValue, AuthState, LoginRequest, SignupRequest, User, MenuItem } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  token: null,
  menu: [],
  isAuthenticated: false,
  isLoading: true,
};

type Action =
  | { type: 'SET_USER'; payload: { user: User; token: string; menu: MenuItem[] } }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }          
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        menu: action.payload.menu,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SESSION_EXPIRED':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Sync access token to the cookie that Next.js middleware reads.
// The refresh token is httpOnly — the backend owns it, we never touch it.
function setAccessTokenCookie(token: string) {
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; SameSite=Strict; max-age=${60 * 60 * 24}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

function clearAccessTokenCookie() {
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Always verify with server — never trust localStorage alone.
        // authService.getCurrentUser() calls GET /auth/me with Bearer header.
        // If the access token is expired, the Axios interceptor in client.ts
        // will POST /auth/refresh (cookie sent automatically), get a new
        // access token, retry /auth/me, and return the user transparently.
        const response = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: { user: response.user, token, menu: response.menu ?? [] } });
      } catch {
        // Both access token refresh and /auth/me failed — clear everything
        localStorage.removeItem(AUTH_TOKEN_KEY);
        clearAccessTokenCookie();
        dispatch({ type: 'SET_LOADING', payload: false });

        const { pathname } = window.location;
        if (pathname !== '/login' && pathname !== '/signup') {
          router.replace(LOGIN_ROUTE);
        }
      }
    };

    initAuth();
  }, [router]);

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      const { accessToken, user, menu = [] } = response;

      if (!accessToken) {
        throw new Error('No access token returned from server');
      }

      // ✅ Only store the access token — backend owns the refresh token cookie.
      // Never store neurosync_refresh_token in localStorage: it's httpOnly.
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      setAccessTokenCookie(accessToken); // sync for Next.js middleware

      dispatch({ type: 'SET_USER', payload: { user, token: accessToken, menu } });
      router.replace(ROLE_DASHBOARD_MAP[user.role] ?? '/');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, [router]);

  const signup = useCallback(async (data: SignupRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.signup(data);
      const { accessToken, user, menu = [] } = response;

      if (!accessToken) {
        throw new Error('No access token returned from server');
      }

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      setAccessTokenCookie(accessToken);

      dispatch({ type: 'SET_USER', payload: { user, token: accessToken, menu } });
      router.replace(ROLE_DASHBOARD_MAP[user.role] ?? '/');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Backend clears the httpOnly refresh cookie via Set-Cookie: max-age=0
      await authService.logout();
    } catch {
      // ignore — always clean up locally regardless
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      clearAccessTokenCookie();
      dispatch({ type: 'LOGOUT' });
      router.replace(LOGIN_ROUTE);
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, signup }),
    [state, login, logout, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
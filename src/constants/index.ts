// src/constants/index.ts

export const AUTH_TOKEN_KEY = 'neurosync_access_token';
export const AUTH_REFRESH_TOKEN_KEY = 'neurosync_refresh_token';
export const AUTH_USER_KEY = 'neurosync_user';
export const LOGIN_ROUTE = '/login';
export const SIGNUP_ROUTE = '/signup';

// Public routes that don't require authentication
export const PUBLIC_ROUTES = ['/login', '/signup', '/'];

// Role to dashboard mapping
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  ADMIN: '/admin',
  SUPERADMIN: '/admin',
};

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  ME: '/auth/me',
};
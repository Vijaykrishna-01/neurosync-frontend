// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode
import { AUTH_TOKEN_KEY, LOGIN_ROUTE, PUBLIC_ROUTES, ROLE_DASHBOARD_MAP } from '@/constants';
import { ROLE_ROUTE_PREFIXES } from '@/lib/rbac/nav-config';
import { UserRole } from '@/types/auth';

interface TokenPayload {
  id: number;
  role: UserRole;
  tokenVersion: number;
  iat: number;
  exp: number;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const payload = token ? decodeToken(token) : null;

  // Public routes: bounce logged-in users to their dashboard
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (payload) {
      const destination = ROLE_DASHBOARD_MAP[payload.role] ?? '/';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: no valid token → login
  if (!payload) {
    const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    response.cookies.delete(AUTH_TOKEN_KEY);
    return response;
  }

  // Role-based route guard (cheap, local, no fetch)
  const allowedPrefixes = ROLE_ROUTE_PREFIXES[payload.role] ?? [];
  const isAllowed = allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );

  if (!isAllowed) {
    const destination = ROLE_DASHBOARD_MAP[payload.role] ?? LOGIN_ROUTE;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
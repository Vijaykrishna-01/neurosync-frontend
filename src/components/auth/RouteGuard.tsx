'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types/auth';
import { LOGIN_ROUTE, ROLE_DASHBOARD_MAP } from '@/constants';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Client-side route guard.
 * Used as a secondary layer inside layouts for role-level protection.
 * The primary protection happens in Next.js middleware.
 */
export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const destination = ROLE_DASHBOARD_MAP[user.role] ?? LOGIN_ROUTE;
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
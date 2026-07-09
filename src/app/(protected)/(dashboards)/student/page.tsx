// src/app/(protected)/student/page.tsx

'use client';

import { useAuth } from '@/providers/AuthProvider';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-100">
        Welcome back, {user?.name}
      </h1>
      <p className="mt-2 text-slate-400">
        Here&apos;s what&apos;s happening in your courses
      </p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Dashboard cards here */}
      </div>
    </div>
  );
}
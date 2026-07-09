// src/app/(public)/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroSync - Authentication',
  description: 'Sign in or create an account',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
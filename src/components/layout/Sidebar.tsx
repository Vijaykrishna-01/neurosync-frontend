// src/components/layout/Sidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2, Calendar,
  MessageSquare, Users, BookCheck, Settings, ScrollText,
  Folder, FolderOpen, Circle, ChevronDown, LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { MenuItem } from '@/types/auth';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2, Calendar,
  MessageSquare, Users, BookCheck, Settings, ScrollText,
};

function isPathActive(pathname: string, path: string | null): boolean {
  if (!path) return false;
  return pathname === path || pathname.startsWith(path + '/');
}

function containsActivePath(pathname: string, item: MenuItem): boolean {
  if (isPathActive(pathname, item.path)) return true;
  return item.children.some((child) => containsActivePath(pathname, child));
}

function MenuNode({ item, depth }: { item: MenuItem; depth: number }) {
  const pathname = usePathname();
  const hasChildren = item.children.length > 0;
  const [open, setOpen] = useState(() => containsActivePath(pathname, item));
  const isActive = isPathActive(pathname, item.path) && !hasChildren;

  useEffect(() => {
    if (hasChildren && containsActivePath(pathname, item)) {
      setOpen(true);
    }
  }, [pathname, hasChildren, item]);

  // Icon resolution: explicit icon name > folder fallback (groups) > dot fallback (leaf)
  const ResolvedIcon: LucideIcon = item.icon
    ? ICON_MAP[item.icon] ?? (hasChildren ? (open ? FolderOpen : Folder) : Circle)
    : hasChildren
      ? (open ? FolderOpen : Folder)
      : Circle;

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
          )}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <ResolvedIcon size={18} />
          <span className="flex-1 text-left">{item.name}</span>
          <ChevronDown
            size={14}
            className={cn('transition-transform', open ? 'rotate-180' : '')}
          />
        </button>
        {open && (
          <ul className="mt-0.5 space-y-0.5">
            {[...item.children]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((child) => (
                <MenuNode key={child.id} item={child} depth={depth + 1} />
              ))}
          </ul>
        )}
      </li>
    );
  }

  if (!item.path) return null; // no path, no children — nothing to link to

  return (
    <li>
      <Link
        href={item.path}
        target={item.target === 'BLANK' ? '_blank' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-violet-600/20 text-violet-300'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        )}
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        <span className={isActive ? 'text-violet-400' : ''}>
          <ResolvedIcon size={18} />
        </span>
        {item.name}
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />}
      </Link>
    </li>
  );
}

export function Sidebar() {
  const { user, menu } = useAuth();
  if (!user) return null;

  const sortedMenu = [...menu].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
          <span className="text-xs font-bold text-white">N</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">NeuroSync</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {sortedMenu.map((item) => (
            <MenuNode key={item.id} item={item} depth={0} />
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-800 px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
          {user.role}
        </span>
      </div>
    </aside>
  );
}
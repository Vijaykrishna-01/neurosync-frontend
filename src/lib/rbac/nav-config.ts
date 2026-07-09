// src/lib/rbac/nav-config.ts

import { UserRole } from '@/types/auth';
import { NavItem } from '@/types/navigation';

// Define all possible navigation items
export const NAV_ITEMS: Record<string, NavItem> = {
  DASHBOARD: {
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
  },
  COURSES: {
    href: '/courses',
    label: 'Courses',
    icon: 'BookOpen',
  },
  ASSIGNMENTS: {
    href: '/assignments',
    label: 'Assignments',
    icon: 'ClipboardList',
  },
  GRADES: {
    href: '/grades',
    label: 'Grades',
    icon: 'BarChart2',
  },
  SCHEDULE: {
    href: '/schedule',
    label: 'Schedule',
    icon: 'Calendar',
  },
  MESSAGES: {
    href: '/messages',
    label: 'Messages',
    icon: 'MessageSquare',
  },
  STUDENTS: {
    href: '/students',
    label: 'Students',
    icon: 'Users',
  },
  TEACHERS: {
    href: '/teachers',
    label: 'Teachers',
    icon: 'Users',
  },
  SUBJECTS: {
    href: '/subjects',
    label: 'Subjects',
    icon: 'BookCheck',
  },
  ADMIN: {
    href: '/admin',
    label: 'Admin',
    icon: 'Settings',
  },
  REPORTS: {
    href: '/reports',
    label: 'Reports',
    icon: 'ScrollText',
  },
};

// Role-based navigation configuration
export const ROLE_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  STUDENT: [
    NAV_ITEMS.DASHBOARD,
    NAV_ITEMS.COURSES,
    NAV_ITEMS.ASSIGNMENTS,
    NAV_ITEMS.GRADES,
    NAV_ITEMS.SCHEDULE,
    NAV_ITEMS.MESSAGES,
  ],
  TEACHER: [
    NAV_ITEMS.DASHBOARD,
    NAV_ITEMS.COURSES,
    NAV_ITEMS.ASSIGNMENTS,
    NAV_ITEMS.STUDENTS,
    NAV_ITEMS.GRADES,
    NAV_ITEMS.SCHEDULE,
    NAV_ITEMS.MESSAGES,
  ],
  ADMIN: [
    NAV_ITEMS.DASHBOARD,
    NAV_ITEMS.STUDENTS,
    NAV_ITEMS.TEACHERS,
    NAV_ITEMS.SUBJECTS,
    NAV_ITEMS.ADMIN,
    NAV_ITEMS.REPORTS,
  ],
  SUPERADMIN: [
    NAV_ITEMS.DASHBOARD,
    NAV_ITEMS.STUDENTS,
    NAV_ITEMS.TEACHERS,
    NAV_ITEMS.SUBJECTS,
    NAV_ITEMS.ADMIN,
    NAV_ITEMS.REPORTS,
  ],
};

// Route prefixes for middleware
export const ROLE_ROUTE_PREFIXES: Record<UserRole, string[]> = {
  STUDENT: ['/student', '/dashboard', '/courses', '/assignments', '/grades', '/schedule', '/messages'],
  TEACHER: ['/teacher', '/dashboard', '/courses', '/assignments', '/students', '/grades', '/schedule', '/messages'],
  ADMIN: ['/admin', '/students', '/teachers', '/subjects', '/reports'],
  SUPERADMIN: ['/admin', '/users', '/roles', '/permissions', '/user-role-assignment', '/academic-years', '/semesters', '/departments', '/programs', '/subjects', '/batches', '/class-timetable', '/academic-calendar', '/teachers', '/students', '/courses', '/classes', '/assignments', '/study-materials', '/announcements', '/exams', '/marks-entry', '/gradebook', '/results', '/reports', '/settings'],
};

// Helper to get navigation items for a role
export function getNavItemsForRole(role: UserRole): NavItem[] {
  return ROLE_NAV_CONFIG[role] || [];
}
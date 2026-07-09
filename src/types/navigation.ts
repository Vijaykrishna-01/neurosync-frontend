// src/types/navigation.ts

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavigationConfig {
  [key: string]: NavItem[];
}
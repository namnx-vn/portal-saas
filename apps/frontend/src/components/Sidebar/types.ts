import type { ElementType } from "react";

export type NavBadge =
  | { type: "new" }
  | { type: "count"; value: number }
  | { type: "outlined"; label: string };

export interface NavItem {
  id: string;
  label: string;
  icon: ElementType;
  path?: string;
  disabled?: boolean;
  badge?: NavBadge;
  hasChevron?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatarUrl?: string;
}
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import type { NavSection } from "./types";

// Real portal sections, wired to actual routes.
// Add more items/sections here as new screens ship (e.g. Departments, Roles).
export const sidebarSections: NavSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [{ id: "dashboard", label: "Dashboard", icon: DashboardOutlined, path: "/dashboard" }],
  },
  {
    id: "admin",
    title: "Admin",
    items: [
      { id: "admin-users", label: "Users", icon: GroupOutlined, path: "/admin/users" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      { id: "change-password", label: "Change Password", icon: LockOutlined, path: "/change-password" },
    ],
  },
];
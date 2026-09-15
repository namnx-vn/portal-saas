import { useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { SidebarNavItem } from "./Sidebarnavitem";
import type { NavSection, SidebarUser } from "./types";
import "./Sidebar.scss";

interface SidebarProps {
  sections: NavSection[];
  activeId: string;
  onSelect: (id: string) => void;
  user?: SidebarUser;
  variant?: "dark" | "light";
  defaultCollapsed?: boolean;
  onLogout?: () => void;
}

export function Sidebar({
  sections,
  activeId,
  onSelect,
  user,
  variant = "dark",
  defaultCollapsed = false,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={`sidebar sidebar--${variant} ${collapsed ? "sidebar--collapsed" : ""}`}
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon" aria-hidden="true">
            S
          </span>
          {!collapsed && (
            <span className="sidebar__brand-name">SimpleFlow</span>
          )}
        </div>

        <IconButton
          size="small"
          className="sidebar__collapse-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightRounded fontSize="small" />
          ) : (
            <ChevronLeftRounded fontSize="small" />
          )}
        </IconButton>
      </div>

      <nav className="sidebar__nav">
        {sections.map((section, index) => (
          <div className="sidebar__section" key={section.id}>
            {!collapsed && (
              <p className="sidebar__section-title">{section.title}</p>
            )}
            {collapsed && index > 0 && (
              <span className="sidebar__divider" aria-hidden="true">
                •••
              </span>
            )}

            {section.items.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={item.id === activeId}
                collapsed={collapsed}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar__footer">
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            className="sidebar__footer-avatar"
          >
            Admin
          </Avatar>

          {!collapsed && (
            <>
              <div className="sidebar__footer-text">
                <p className="sidebar__footer-name">Admin</p>
                <p className="sidebar__footer-role">{user.role}</p>
              </div>
              <IconButton
                size="small"
                className="sidebar__footer-action"
                aria-label="Account settings"
              >
                <SettingsOutlined fontSize="small" />
              </IconButton>
            </>
          )}
        </div>
      )}

      {onLogout && (
        <button
          type="button"
          className={`sidebar-logout ${collapsed ? "sidebar-logout--collapsed" : ""}`}
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogoutRounded fontSize="small" />
          {!collapsed && <span>Logout</span>}
        </button>
      )}
    </aside>
  );
}

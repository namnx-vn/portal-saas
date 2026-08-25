import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import type { NavItem } from "./types";

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: (id: string) => void;
}

export function SidebarNavItem({ item, active, collapsed, onSelect }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={[
        "sidebar-nav-item",
        active && "sidebar-nav-item--active",
        item.disabled && "sidebar-nav-item--disabled",
        collapsed && "sidebar-nav-item--collapsed",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={item.disabled}
      onClick={() => onSelect(item.id)}
      title={collapsed ? item.label : undefined}
    >
      <Icon fontSize="small" className="sidebar-nav-item__icon" />

      {!collapsed && (
        <>
          <span className="sidebar-nav-item__label">{item.label}</span>

          {item.badge?.type === "new" && (
            <span className="sidebar-nav-item__badge sidebar-nav-item__badge--new">New</span>
          )}
          {item.badge?.type === "count" && (
            <span className="sidebar-nav-item__badge sidebar-nav-item__badge--count">
              {item.badge.value}
            </span>
          )}
          {item.badge?.type === "outlined" && (
            <span className="sidebar-nav-item__badge sidebar-nav-item__badge--outlined">
              {item.badge.label}
            </span>
          )}
          {item.hasChevron && (
            <ExpandMoreRounded fontSize="small" className="sidebar-nav-item__chevron" />
          )}
        </>
      )}
    </button>
  );
}
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, sidebarSections } from "../../components/Sidebar";
import { useAuthStore, useUserStore } from "../../stores";
import apiClient from "../../lib/axios";
import "./styles.scss";

function findActiveId(pathname: string): string {
  for (const section of sidebarSections) {
    for (const item of section.items) {
      if (item.path && pathname.startsWith(item.path)) return item.id;
    }
  }
  return "";
}

function findPath(id: string): string | undefined {
  for (const section of sidebarSections) {
    const item = section.items.find((navItem) => navItem.id === id);
    if (item) return item.path;
  }
  return undefined;
}

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const handleSelect = (id: string) => {
    const path = findPath(id);
    if (path) navigate(path);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        sections={sidebarSections}
        activeId={findActiveId(location.pathname)}
        onSelect={handleSelect}
        user={user ? { name: user.name, role: user.role || "Member" } : undefined}
        onLogout={handleLogout}
      />
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
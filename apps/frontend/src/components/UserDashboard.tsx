import { useEffect } from "react";
import { useAuthStore, useUIStore, useUserStore } from "../stores";
import { useApiQuery } from "../hooks/useApi";

interface User {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

/**
 * Example component demonstrating:
 * - Zustand stores (auth, user, UI)
 * - React Query (data fetching)
 * - Axios interceptor integration (auto-inject token)
 */
export function UserDashboard() {
  // Zustand: Get auth and UI state
  const { isAuthenticated, token, clearAuth } = useAuthStore();
  const { user: localUser, setUser, setError } = useUserStore();
  const { showNotification } = useUIStore();

  // React Query: Fetch user data
  const { data: apiUser, isLoading, error } = useApiQuery<User>(
    "/api/users/me",
    {
      enabled: isAuthenticated && !!token, // Only fetch if authenticated
    }
  );

  useEffect(() => {
    if (!apiUser) return;

    setUser(apiUser);
    showNotification(`Welcome back, ${apiUser.email}!`, "success");
  }, [apiUser, setUser, showNotification]);

  useEffect(() => {
    if (!error) return;

    setError(error.message);
    showNotification("Failed to load user data", "error");
  }, [error, setError, showNotification]);

  const handleLogout = () => {
    clearAuth();
    showNotification("Logged out successfully", "success");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  if (!isAuthenticated) {
    return <div>Please log in first</div>;
  }

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error loading user: {error.message}</div>;
  }

  const displayUser = apiUser || localUser;

  return (
    <div className="dashboard">
      <h1>Welcome, {displayUser?.email}!</h1>
      <p>Email: {displayUser?.email}</p>
      <p>Role: {displayUser?.role}</p>

      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
}

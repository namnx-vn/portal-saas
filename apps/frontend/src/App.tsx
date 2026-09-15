import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthRedirectHandler } from "./hooks/useAuthRedirectHandler";
import { LoginScreen } from "./features/Login";
import { MainLayout } from "./layouts";
import { RequireAuth } from "./components/RequireAuth";

// TODO: these three imports are a best guess based on the feature-first pattern
// used by features/Login. Update the paths to wherever these screens actually live.
import { DashboardScreen } from "./features/Dashboard/DashboardScreen";
import { AdminUsersScreen } from "./features/AdminUsers/AdminUsersScreen";
import { ChangePasswordScreen } from "./features/ChangePassword/ChangePasswordScreen";

function App() {
  useAuthRedirectHandler();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/admin/users" element={<AdminUsersScreen />} />
            <Route path="/change-password" element={<ChangePasswordScreen />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

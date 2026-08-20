import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthRedirectHandler } from "./hooks/useAuthRedirectHandler";
import { useHydrateSession } from "./hooks/useHydrateSession";
import { LoginScreen } from "./features/Login";
import { ChangePasswordScreen } from "./features/ChangePassword";
import { AdminUsersScreen } from "./features/AdminUsers";

function App() {
  // useAuthRedirectHandler({});
  useHydrateSession();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/auth/change-pass" element={<ChangePasswordScreen />} />
        <Route path="/admin/users" element={<AdminUsersScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
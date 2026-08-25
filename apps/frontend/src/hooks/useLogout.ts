import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/axios";
import { useUserStore } from "../stores";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post("/logout");
    } finally {
      clearUser();
      setIsLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  return { logout, isLoggingOut };
}
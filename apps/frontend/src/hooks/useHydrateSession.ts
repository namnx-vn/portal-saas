import { useEffect } from "react";
import apiClient from "../lib/axios";
import { useUserStore } from "../stores";

export function useHydrateSession() {
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiClient
      .get("/me")
      .then((res) => {
        if (cancelled) return;
        const { user, role, permissions } = res.data;
        setUser({ ...user, role, permissions });
      })
      .catch(() => {
        // Chưa đăng nhập hoặc session hết hạn — không phải lỗi cần báo người dùng
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);
}
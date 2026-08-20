import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";
import { useAuthStore, useUserStore } from "../stores";

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle session errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isSessionCheck = error.config?.url === "/me";

    if (error.response?.status === 401 && !isSessionCheck) {
      useUserStore.getState().clearUser();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default apiClient;

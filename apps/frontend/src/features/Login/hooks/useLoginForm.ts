import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useApiMutation } from "../../../hooks/useApi";
import { useAuthStore } from "../../../stores";
import { useUIStore } from "../../../stores";
import { validationRules } from "../../../hooks/useFormHandler";
import type { SubmitHandler } from "react-hook-form";

export interface LoginFormValues {
  email: string;
  password: string;
  name?: string;
}

interface LoginApiResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function useLoginForm() {
  const form = useForm<LoginFormValues>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const email = form.watch("email");
  const password = form.watch("password");

  const { setAuth } = useAuthStore();
  const { showNotification } = useUIStore();

  // Login mutation
  const loginMutation = useApiMutation<LoginApiResponse, LoginFormValues>({
    mutationFn: async (data) => {
      // Replace with your actual login API endpoint
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: "mock-token-" + Date.now(),
            refreshToken: "mock-refresh-token",
            user: {
              id: "user-123",
              email: data.email,
              name: data.name || data.email.split("@")[0],
            },
          });
        }, 1000);
      });
    },
    onSuccess: (data) => {
      setAuth(data.token, data.refreshToken, 3600);
      showNotification("Login successful!", "success");
      form.reset();
    },
    onError: (error: any) => {
      showNotification(
        error?.message || "Login failed. Please try again.",
        "error"
      );
    },
  });

  const passwordRules = useMemo(
    () => [
      { id: "strength", label: "Password Strength : Weak", met: password.length >= 12 },
      {
        id: "identity",
        label: "Cannot contain your name or email address",
        met: !email || !password.toLowerCase().includes(email.split("@")[0].toLowerCase()),
      },
      { id: "length", label: "At least 8 characters", met: password.length >= 8 },
      { id: "complexity", label: "Contains a number or symbol", met: /[\d\W_]/.test(password) },
    ],
    [email, password],
  );

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    loginMutation.mutate(data);
  };

  return {
    form,
    passwordRules,
    loginMutation,
    onSubmit,
  };
}

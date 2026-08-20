import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useApiMutation } from "../../../hooks/useApi";
import { useUserStore } from "../../../stores";
import apiClient from "../../../lib/axios";

interface ChangePasswordValues {
  password: string;
}

interface AcceptInviteResponse {
  user: { id: string; email: string; tenantId: string };
  role: string;
  permissions: string[];
}

export function useChangePasswordForm(token: string | null) {
  const form = useForm<ChangePasswordValues>({ mode: "onBlur", defaultValues: { password: "" } });
  const setUser = useUserStore((state) => state.setUser);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

  const acceptMutation = useApiMutation<AcceptInviteResponse, ChangePasswordValues>({
    mutationFn: async (data) => {
      const response = await apiClient.post<AcceptInviteResponse>("/auth/invite/accept", {
        token,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: (data) => setUser({ ...data.user, role: data.role, permissions: data.permissions }),
  });

  const resendMutation = useApiMutation<{ status: string }, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ status: string }>("/auth/invite/resend", { token });
      return response.data;
    },
    onSuccess: () => setResendStatus("sent"),
    onError: () => setResendStatus("error"),
  });

  const isExpired = (acceptMutation.error as any)?.response?.status === 410;

  const onSubmit: SubmitHandler<ChangePasswordValues> = (data) => acceptMutation.mutate(data);
  const onResend = () => resendMutation.mutate();

  return { form, acceptMutation, isExpired, resendMutation, resendStatus, onSubmit, onResend };
}
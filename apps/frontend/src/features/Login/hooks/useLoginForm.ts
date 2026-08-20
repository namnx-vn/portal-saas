import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useApiMutation } from "../../../hooks/useApi";
import { useUserStore, useUIStore } from "../../../stores";
import apiClient from "../../../lib/axios";

const TENANT_SUBDOMAIN = "acme"; // demo — khớp cách hardcode hiện có ở useAuthRedirectHandler.ts

export interface LoginFormValues {
  email: string;
  password: string;
  name?: string;
}

interface LoginApiResponse {
  user: { id: string; email: string; tenantId: string };
  role: string;
  permissions: string[];
}

interface MfaRequiredResponse {
  mfaRequired: true;
  preAuthToken: string;
}

export function useLoginForm() {
  const form = useForm<LoginFormValues>({
    mode: "onBlur",
    defaultValues: { email: "", password: "", name: "" },
  });

  const email = form.watch("email");
  const password = form.watch("password");

  const setUser = useUserStore((state) => state.setUser);
  const { showNotification } = useUIStore();

  const [mfaStage, setMfaStage] = useState<{ preAuthToken: string } | null>(null);

  const applySession = (data: LoginApiResponse) => {
    setUser({ ...data.user, role: data.role, permissions: data.permissions });
    showNotification("Đăng nhập thành công!", "success");
    form.reset();
    setMfaStage(null);
  };

  const loginMutation = useApiMutation<LoginApiResponse | MfaRequiredResponse, LoginFormValues>({
    mutationFn: async (data) => {
      const response = await apiClient.post<LoginApiResponse | MfaRequiredResponse>(
        "/auth/login",
        { email: data.email, password: data.password },
        { headers: { "x-tenant-subdomain": TENANT_SUBDOMAIN } },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if ("mfaRequired" in data) {
        setMfaStage({ preAuthToken: data.preAuthToken });
        return;
      }
      applySession(data);
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.error || "Đăng nhập thất bại. Vui lòng thử lại.", "error");
    },
  });

  const verifyOtpMutation = useApiMutation<LoginApiResponse, { otp: string }>({
    mutationFn: async ({ otp }) => {
      if (!mfaStage) throw new Error("Missing MFA session");
      const response = await apiClient.post<LoginApiResponse>("/auth/mfa/verify", {
        preAuthToken: mfaStage.preAuthToken,
        otp,
      });
      return response.data;
    },
    onSuccess: applySession,
    onError: (error: any) => {
      showNotification(error?.response?.data?.error || "Xác thực OTP thất bại.", "error");
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

  const onVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate({ otp });
  };

  return { form, passwordRules, loginMutation, verifyOtpMutation, mfaStage, onSubmit, onVerifyOtp };
}
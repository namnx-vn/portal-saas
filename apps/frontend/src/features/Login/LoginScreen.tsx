import { Box, CircularProgress, Container, Paper } from "@mui/material";
import { useTenantConfig } from "../../hooks/useTenantConfig";
import { useUserStore } from "../../stores";
import { BrandMark } from "./components/BrandMark";
import { LoginForm } from "./components/LoginForm";
import { LoginHero } from "./components/LoginHero";
import { MfaOtpForm } from "./components/MfaOtpForm";
import { useLoginForm } from "./hooks/useLoginForm";
import "./LoginScreen.scss";

const TENANT_SUBDOMAIN = "native";

export function LoginScreen() {
  const { config, loading: configLoading } = useTenantConfig(TENANT_SUBDOMAIN);
  const {
    form,
    loginMutation,
    mfaStage,
    verifyOtpMutation,
    onSubmit,
    onVerifyOtp,
  } = useLoginForm();
  const user = useUserStore((state) => state.user);

  if (user) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <p>Đã đăng nhập với vai trò {user.role}.</p>
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen">
      <Box className="h-[calc(100vh-4rem)] hidden lg:flex lg:w-1/2 lg:flex-col m-8">
        <LoginHero />
      </Box>

      <Box className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-11">
        <Container maxWidth="sm">
          <Paper elevation={0} className="p-8 sm:p-10">
            <Box className="mb-8 flex justify-center">
              <BrandMark />
            </Box>

            {configLoading && (
              <Box className="flex justify-center py-8">
                <CircularProgress />
              </Box>
            )}

            {!configLoading && mfaStage && (
              <MfaOtpForm
                onSubmit={onVerifyOtp}
                isSubmitting={verifyOtpMutation.isPending}
                error={
                  verifyOtpMutation.isError
                    ? "Mã OTP không đúng hoặc đã hết hạn."
                    : null
                }
              />
            )}

            {!configLoading && !mfaStage && (
              <LoginForm
                form={form}
                idpAlias={config?.idp_alias}
                onSubmit={onSubmit}
                isSubmitting={loginMutation.isPending}
                error={
                  loginMutation.isError
                    ? "Email hoặc mật khẩu không đúng."
                    : null
                }
              />
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

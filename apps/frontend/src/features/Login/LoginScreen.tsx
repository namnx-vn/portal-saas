import { Box, Container, Paper } from "@mui/material";
import { BrandMark } from "./components/BrandMark";
import { LoginForm } from "./components/LoginForm";
import { LoginHero } from "./components/LoginHero";
import { useLoginForm } from "./hooks/useLoginForm";
import { useAuthUiStore } from "./stores/authUiStore";
import { useAuthStore } from "../../stores";
import "./LoginScreen.scss";

export function LoginScreen() {
  const { form, passwordRules, loginMutation, onSubmit } = useLoginForm();
  const mode = useAuthUiStore((state) => state.mode);
  const setMode = useAuthUiStore((state) => state.setMode);
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <p>Redirecting...</p>
      </Box>
    );
  }

  return (
    <Box className="flex min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
      {/* Left Side - Hero Section */}
      <Box className="hidden lg:flex lg:w-1/2 lg:flex-col">
        <LoginHero />
      </Box>

      {/* Right Side - Login Panel */}
      <Box className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-11">
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            className="p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm"
          >
            {/* Brand Mark */}
            <Box className="mb-8 flex justify-center">
              <BrandMark />
            </Box>

            {/* Login Form */}
            <LoginForm
              form={form}
              mode={mode}
              passwordRules={passwordRules}
              onModeChange={setMode}
              onSubmit={onSubmit}
              isSubmitting={loginMutation.isPending}
              error={
                loginMutation.error?.message ||
                (loginMutation.isError
                  ? "An error occurred. Please try again."
                  : null)
              }
            />
          </Paper>

          {/* Footer */}
          <Box className="mt-8 text-center text-xs text-gray-600">
            <p>
              By signing up I accept Company's
              <br />
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Use
              </a>{" "}
              &amp;{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

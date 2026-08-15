import { FormProvider } from "react-hook-form";
import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import {
  Box,
  Button,
  Stack,
  Link,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ControlledTextField } from "../../../components/ControlledForm";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { SocialLoginButton } from "../../../components/SocialLoginButton";
import type { LoginFormValues } from "../hooks/useLoginForm";
import type { LoginMode } from "../stores/authUiStore";

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  mode: LoginMode;
  onModeChange: (value: LoginMode) => void;
  passwordRules: Array<{ id: string; label: string; met: boolean }>;
  onSubmit: SubmitHandler<LoginFormValues>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function LoginForm({
  form,
  mode,
  onModeChange,
  passwordRules,
  onSubmit,
  isSubmitting = false,
  error,
}: LoginFormProps) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        {/* Mode Toggle */}
        <SegmentedControl
          ariaLabel="Authentication mode"
          options={[
            { label: "Sign Up", value: "sign-up" },
            { label: "Sign In", value: "sign-in" },
          ]}
          value={mode}
          onChange={onModeChange}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="text-sm">
            {error}
          </Alert>
        )}

        {/* Form Fields */}
        <Stack spacing={3}>
          {/* Name field - only for sign up */}
          {mode === "sign-up" && (
            <ControlledTextField
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              fullWidth
              disabled={isSubmitting}
            />
          )}

          {/* Email field */}
          <ControlledTextField
            control={form.control}
            name="email"
            label="Email Id"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            fullWidth
            disabled={isSubmitting}
          />

          {/* Password field */}
          <Box>
            <ControlledTextField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              fullWidth
              disabled={isSubmitting}
            />

            {/* Forgot Password Link - only for sign in */}
            {mode === "sign-in" && (
              <Link
                href="/forgot-password"
                className="mt-2 text-xs inline-block"
                underline="hover"
              >
                Forgot Password?
              </Link>
            )}
          </Box>

          {/* Password Rules - only for sign up */}
          {mode === "sign-up" && (
            <Box className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Password Requirements:
              </p>
              <ul className="space-y-1">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={`text-xs flex items-center gap-2 ${
                      rule.met ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className={rule.met ? "text-green-500" : "text-gray-300"}>
                      ✓
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Stack>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          size="large"
          variant="contained"
          disabled={!form.formState.isValid || isSubmitting}
          className="mt-6"
        >
          {isSubmitting ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={20} />
              Processing...
            </Box>
          ) : mode === "sign-up" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Divider */}
        <Divider className="my-6">or</Divider>

        {/* Social Login Buttons */}
        <Box className="grid grid-cols-3 gap-3">
          <SocialLoginButton provider="google" />
          <SocialLoginButton provider="apple" />
          <SocialLoginButton provider="microsoft" />
        </Box>

        {/* Terms Link */}
        <p className="text-xs text-center text-gray-600 mt-4">
          By signing up I accept{" "}
          <Link href="/terms" underline="hover" className="text-xs">
            Terms of Use
          </Link>{" "}
          &amp;{" "}
          <Link href="/privacy" underline="hover" className="text-xs">
            Privacy Policy
          </Link>
        </p>
      </form>
    </FormProvider>
  );
}

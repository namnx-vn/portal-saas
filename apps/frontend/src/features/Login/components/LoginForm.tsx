import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Controller, FormProvider } from "react-hook-form";
import { SocialLoginButton } from "../../../components/SocialLoginButton";
import { TextField } from "../../../components/atoms/TextField";
import type { LoginFormValues } from "../hooks/useLoginForm";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  passwordRules?: Array<{ id: string; label: string; met: boolean }>;
  onSubmit: SubmitHandler<LoginFormValues>;
  isSubmitting?: boolean;
  error?: string | null;
  idpAlias?: string | null;
  ssoEnabled?: boolean;
  onSsoLogin?: () => void;
}

export function LoginForm({
  form,
  onSubmit,
  isSubmitting = false,
  error,
  ssoEnabled = false,
  onSsoLogin,
}: LoginFormProps) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="login-form">
        {error && (
          <p className="login-panel__status login-panel__status--error">
            {error}
          </p>
        )}

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email Id"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              placeholder="Enter Password"
              autoComplete={"current-password"}
              disabled={isSubmitting}
              error={fieldState.error?.message}
            />
          )}
        />

        <a href="/forgot-password">Forgot Password?</a>

        <button
          type="submit"
          className="login-form__submit"
          disabled={!form.formState.isValid || isSubmitting}
        >
          Sign In
        </button>

        {/* <div className="login-form__divider">OR</div> */}

        {ssoEnabled && (
          <>
            <Divider className="my-6">or</Divider>
            <Box className="grid grid-cols-3 gap-3">
              <SocialLoginButton provider="google" disabled />
              <SocialLoginButton provider="apple" disabled />
              <SocialLoginButton provider="microsoft" onClick={onSsoLogin} />
            </Box>
          </>
        )}

        <p className="login-panel__terms">
          By signing up to create an account I accept Company's{" "}
          <a href="/terms">Terms of use</a> &amp;{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </form>
    </FormProvider>
  );
}

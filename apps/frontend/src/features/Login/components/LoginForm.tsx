import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Controller, FormProvider } from "react-hook-form";
import { SocialLoginButton } from "../../../components/SocialLoginButton";
import { TextField } from "../../../components/TextField";
import type { LoginFormValues } from "../hooks/useLoginForm";

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  passwordRules?: Array<{ id: string; label: string; met: boolean }>;
  onSubmit: SubmitHandler<LoginFormValues>;
  isSubmitting?: boolean;
  error?: string | null;
  idpAlias?: string | null;
}

export function LoginForm({
  form,
  onSubmit,
  isSubmitting = false,
  error,
  idpAlias,
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

        <div className="login-form__divider">OR</div>

        <div className="login-form__socials">
          <SocialLoginButton provider="google" disabled />
          <SocialLoginButton provider="apple" disabled />
          <SocialLoginButton provider="microsoft" idpAlias={idpAlias} />
        </div>

        <p className="login-panel__terms">
          By signing up to create an account I accept Company's{" "}
          <a href="/terms">Terms of use</a> &amp;{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </form>
    </FormProvider>
  );
}

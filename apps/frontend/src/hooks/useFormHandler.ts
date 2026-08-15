import { useForm } from "react-hook-form";
import type { SubmitHandler, FieldValues, UseFormProps } from "react-hook-form";

/**
 * Custom hook for form handling with react-hook-form
 * Provides common form utilities and error handling
 */
export function useFormHandler<T extends FieldValues>(
  defaultValues?: UseFormProps<T>["defaultValues"],
  onSubmit?: SubmitHandler<T>,
  options?: UseFormProps<T>
) {
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
    reset,
    getValues,
    setValue,
    trigger,
  } = useForm<T>({
    mode: "onBlur",
    defaultValues,
    ...options,
  });

  return {
    control,
    watch,
    errors,
    isSubmitting,
    isValid,
    touchedFields,
    reset,
    getValues,
    setValue,
    trigger,
    handleSubmit: handleSubmit(onSubmit || (() => {})),
  };
}

/**
 * Get field error message
 */
export function getFieldError(errors: Record<string, any>, fieldName: string): string | null {
  const error = errors[fieldName];
  return error?.message ? String(error.message) : null;
}

/**
 * Check if field has error
 */
export function hasFieldError(errors: Record<string, any>, fieldName: string): boolean {
  return !!errors[fieldName];
}

/**
 * Validation rules
 */
export const validationRules = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  },
  confirmPassword: (getValues: any) => ({
    required: "Confirm password is required",
    validate: (value: string) =>
      value === getValues("password") || "Passwords do not match",
  }),
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
  },
};

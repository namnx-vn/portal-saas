import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  action?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, action, id, ...inputProps }, ref) => {
    const inputId = id ?? inputProps.name;

    return (
      <div className="text-field">
        <div className="text-field__header">
          <label htmlFor={inputId}>{label}</label>
          {action && <span className="text-field__action">{action}</span>}
        </div>
        <input id={inputId} ref={ref} className="text-field__input" {...inputProps} />
        {error && (
          <span className="text-field__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";
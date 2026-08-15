import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { TextField as MuiTextField } from "@mui/material";
import type { TextFieldProps as MuiTextFieldProps } from "@mui/material";

interface ControlledTextFieldProps<T extends FieldValues>
  extends Omit<MuiTextFieldProps, "name"> {
  control: Control<T>;
  name: Path<T>;
}

/**
 * Controlled TextField component integrated with react-hook-form
 */
export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: ControlledTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <MuiTextField
          {...props}
          {...field}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
}

interface ControlledCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

/**
 * Controlled Checkbox component integrated with react-hook-form
 */
export function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  label,
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label>
          <input type="checkbox" {...field} checked={field.value} />
          {label}
        </label>
      )}
    />
  );
}

interface ControlledSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: Array<{ label: string; value: string | number }>;
  error?: string;
}

/**
 * Controlled Select component integrated with react-hook-form
 */
export function ControlledSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  error,
}: ControlledSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <label>{label}</label>
          <select {...field}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <span style={{ color: "red" }}>{error}</span>}
        </div>
      )}
    />
  );
}

import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, "name" | "variant"> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          className="form-text-field"
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          variant="outlined"
        />
      )}
    />
  );
}

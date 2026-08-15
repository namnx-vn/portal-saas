# React Hook Form Setup Guide

This guide covers using react-hook-form for form handling in your project.

## Installation

```bash
npm install react-hook-form
```

## Quick Start

### 1. Basic Form with useFormHandler Hook

```typescript
import { useFormHandler, validationRules } from "../hooks/useFormHandler";
import { SubmitHandler } from "react-hook-form";

interface LoginInputs {
  email: string;
  password: string;
}

export function LoginForm() {
  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
  } = useFormHandler<LoginInputs>(
    { email: "", password: "" },
    async (data) => {
      // Handle form submission
      console.log(data);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        {...control.register("email", validationRules.email)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...control.register("password", validationRules.password)}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
```

### 2. Using Controlled Components with MUI

```typescript
import { useForm, FormProvider } from "react-hook-form";
import { ControlledTextField } from "../components/ControlledForm";

interface UserFormInputs {
  name: string;
  email: string;
}

export function UserForm() {
  const methods = useForm<UserFormInputs>({
    defaultValues: { name: "", email: "" },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
        <ControlledTextField
          control={methods.control}
          name="name"
          label="Name"
        />

        <ControlledTextField
          control={methods.control}
          name="email"
          label="Email"
          type="email"
        />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

### 3. Form with Validation Rules

```typescript
import { validationRules } from "../hooks/useFormHandler";

export function SignUpForm() {
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
        <ControlledTextField
          control={methods.control}
          name="email"
          label="Email"
          rules={validationRules.email}
        />

        <ControlledTextField
          control={methods.control}
          name="password"
          label="Password"
          type="password"
          rules={validationRules.password}
        />

        <ControlledTextField
          control={methods.control}
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          rules={validationRules.confirmPassword(methods.getValues)}
        />

        <button type="submit">Sign Up</button>
      </form>
    </FormProvider>
  );
}
```

### 4. Dynamic Form Fields

```typescript
import { useFieldArray } from "react-hook-form";

export function DynamicForm() {
  const methods = useForm({
    defaultValues: {
      users: [{ name: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "users",
  });

  return (
    <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <ControlledTextField
            control={methods.control}
            name={`users.${index}.name`}
            label="Name"
          />

          <ControlledTextField
            control={methods.control}
            name={`users.${index}.email`}
            label="Email"
            type="email"
          />

          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: "", email: "" })}>
        Add User
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## API Reference

### `useFormHandler<T>`

Custom hook wrapping react-hook-form with common defaults.

```typescript
const {
  control,           // Form control object
  watch,             // Watch form values
  errors,            // Form errors
  isSubmitting,      // Is form submitting
  isValid,           // Is form valid
  touchedFields,     // Touched fields
  reset,             // Reset form
  getValues,         // Get current values
  setValue,          // Set field value
  trigger,           // Trigger validation
  handleSubmit,      // Handle form submission
} = useFormHandler(defaultValues, onSubmit, options);
```

### Validation Rules

Pre-defined validation rules for common fields:

```typescript
validationRules.email         // Email validation
validationRules.password      // Password validation (min 8 chars)
validationRules.confirmPassword(getValues)  // Password confirmation
validationRules.name          // Name validation (min 2 chars)
```

### `ControlledTextField`

MUI TextField integrated with react-hook-form:

```typescript
<ControlledTextField
  control={control}
  name="email"
  label="Email"
  type="email"
  placeholder="Enter email"
  rules={validationRules.email}
  disabled={isSubmitting}
  fullWidth
/>
```

### `ControlledCheckbox`

Checkbox integrated with react-hook-form:

```typescript
<ControlledCheckbox
  control={control}
  name="agreeToTerms"
  label="I agree to the terms"
/>
```

### `ControlledSelect`

Select dropdown integrated with react-hook-form:

```typescript
<ControlledSelect
  control={control}
  name="country"
  label="Country"
  options={[
    { label: "USA", value: "us" },
    { label: "UK", value: "uk" },
  ]}
  error={errors.country?.message}
/>
```

## Common Patterns

### Form with API Mutation

```typescript
import { useApiMutation } from "../hooks/useApi";
import { useUIStore } from "../stores";

export function CreateUserForm() {
  const methods = useForm<CreateUserInputs>();
  const mutation = useApiMutation<User, CreateUserInputs>({
    mutationFn: (data) =>
      apiClient.post("/users", data).then((res) => res.data),
    onSuccess: () => {
      useUIStore.getState().showNotification("User created!", "success");
      methods.reset();
    },
    onError: (error) => {
      useUIStore.getState().showNotification(error.message, "error");
    },
  });

  return (
    <form onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}>
      {/* form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Watch Form Values

```typescript
export function SearchForm() {
  const methods = useForm();
  const searchQuery = methods.watch("query");

  // Trigger search as user types
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        // Perform search
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <form>
      <input {...methods.register("query")} placeholder="Search..." />
    </form>
  );
}
```

### Conditional Fields

```typescript
export function ConditionalForm() {
  const methods = useForm();
  const userType = methods.watch("userType");

  return (
    <form>
      <select {...methods.register("userType")}>
        <option value="individual">Individual</option>
        <option value="company">Company</option>
      </select>

      {userType === "company" && (
        <ControlledTextField
          control={methods.control}
          name="companyName"
          label="Company Name"
          rules={{ required: "Company name is required" }}
        />
      )}
    </form>
  );
}
```

### Custom Validation

```typescript
export function CustomValidationForm() {
  const methods = useForm();

  return (
    <form>
      <ControlledTextField
        control={methods.control}
        name="age"
        label="Age"
        rules={{
          required: "Age is required",
          validate: {
            isNumber: (value) =>
              !isNaN(value) || "Age must be a number",
            isAdult: (value) =>
              value >= 18 || "You must be 18 or older",
          },
        }}
      />
    </form>
  );
}
```

## Form State Management

### Reset Form

```typescript
const handleReset = () => {
  methods.reset();  // Reset to default values
  methods.reset({ email: "default@example.com" });  // Reset with new defaults
};
```

### Get Form Values

```typescript
const values = methods.getValues();           // Get all values
const email = methods.getValues("email");     // Get single field
```

### Set Form Values

```typescript
methods.setValue("email", "new@example.com");
methods.setValue("email", "new@example.com", { shouldValidate: true });
```

### Trigger Validation

```typescript
const isValid = await methods.trigger();              // Validate all
const isEmailValid = await methods.trigger("email");  // Validate single field
```

## Error Handling

### Display Field Errors

```typescript
{errors.email && (
  <span style={{ color: "red" }}>
    {errors.email.message}
  </span>
)}
```

### Display Form-Level Errors

```typescript
import { useFormContext } from "react-hook-form";

export function FormErrorMessage() {
  const { formState } = useFormContext();

  if (Object.keys(formState.errors).length > 0) {
    return <div>Please fix the errors below</div>;
  }

  return null;
}
```

## Performance Tips

1. **Use Controller sparingly** - Uncontrolled components are faster
2. **Debounce validation** - Use `onBlur` mode for large forms
3. **Isolate re-renders** - Use separate components for form sections
4. **Lazy validate** - Use `mode: "onBlur"` or `mode: "onChange"`

## Testing

```typescript
import { render, screen, userEvent } from "@testing-library/react";

test("submit form with valid data", async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.type(screen.getByLabelText(/password/i), "password123");

  await userEvent.click(screen.getByRole("button", { name: /login/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password123",
  });
});
```

## Browser DevTools

Enable form debugging in Redux DevTools by wrapping with `devtools` middleware (optional):

```typescript
import { devtools } from "zustand/middleware";

// Form state can be inspected in Redux DevTools console
```

## Best Practices

1. ✅ Use validation rules from `validationRules` constant
2. ✅ Always provide error messages to users
3. ✅ Disable submit button while loading
4. ✅ Use `FormProvider` for complex nested forms
5. ✅ Leverage MUI integration with `ControlledTextField`
6. ✅ Reset form after successful submission
7. ✅ Show loading state during submission
8. ✅ Handle errors gracefully with notifications

## Resources

- [react-hook-form Docs](https://react-hook-form.com/)
- [API Reference](https://react-hook-form.com/api)
- [Examples](https://react-hook-form.com/form-builder)

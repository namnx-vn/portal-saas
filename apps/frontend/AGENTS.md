# Frontend SaaS Portal — AI Agent Guidelines

This document provides project-specific context to help AI coding agents be productive in this React + TypeScript frontend codebase.

## Project Overview

**Frontend**: React 19 + TypeScript 6 + Vite SaaS login portal with Azure AD (MSAL) authentication and MUI/Tailwind styling.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2 | UI library with concurrent rendering |
| **Language** | TypeScript | ~6.0 | Type safety across the codebase |
| **Build** | Vite | 5.4 | Fast dev server & production builds |
| **Styling** | Tailwind CSS | 4.3 + SCSS | Utility-first CSS + component styles |
| **UI Components** | Material-UI (MUI) | 9.3 | Polished component library + icons |
| **Routing** | React Router | 7.18 | Client-side navigation |
| **Auth** | Azure MSAL | 5.x | Microsoft Entra ID (Azure AD) authentication |
| **Data Fetching** | Axios + TanStack Query | 1.19 + 5.101 | HTTP requests & caching |
| **Form Handling** | React Hook Form | Latest | Performant, flexible form state |
| **Code Quality** | ESLint + TypeScript-ESLint | 10.x + 8.x | Linting & type checking |
| **Styling** | @emotion/react | 11.14 | CSS-in-JS for component styles |

---

## Project Structure

```
src/
├── main.tsx                    # Entry point: MSAL + React Query + MUI setup
├── App.tsx                     # Root component with auth guard
├── authConfig.ts               # Azure MSAL configuration
├── components/                 # Reusable UI components
│   ├── LoginButton.tsx         # Authenticated login trigger
│   ├── SegmentedControl.tsx    # Form UI control
│   ├── SocialLoginButton.tsx   # SSO/social login button
│   └── TextField.tsx           # Input field component
├── features/                   # Feature-scoped modules (feature-first architecture)
│   └── Login/
│       ├── LoginScreen.tsx     # Main login page component
│       ├── LoginScreen.scss    # Feature-specific styles
│       ├── components/         # Feature-private components
│       │   ├── BrandMark.tsx
│       │   ├── LoginForm.tsx
│       │   └── LoginHero.tsx
│       └── hooks/              # Feature-specific hooks
│           └── useLoginForm.ts
├── hooks/                      # Global/shared hooks
│   ├── useAuthRedirectHandler.ts  # Handle auth redirect flow
│   ├── useTenantConfig.ts         # Load tenant configuration
│   └── useApi.ts                  # React Query + Axios hooks
├── lib/                        # Utility libraries
│   ├── queryClient.ts          # React Query client config
│   └── axios.ts                # Axios instance with interceptors
├── stores/                     # Zustand state stores
│   ├── index.ts               # Store exports
│   ├── authStore.ts           # Auth state (token, isAuthenticated)
│   ├── userStore.ts           # User profile state
│   └── uiStore.ts             # UI state (sidebar, theme, notifications)
├── theme/                      # MUI theme configuration
│   ├── index.ts               # Theme export
│   ├── palette.ts             # Color definitions
│   ├── shadows.ts             # Shadow definitions
│   ├── typography.ts          # Font/typography rules
│   └── components/            # MUI component overrides
├── styles/                     # Global styles
│   └── main.css               # Global CSS & Tailwind imports
└── assets/                     # Images, icons, static files
```

**Architecture Pattern**: Feature-based organization with co-located components, hooks, and styles. Global hooks and reusable components in `hooks/` and `components/` directories.

---

## Key Architectural Decisions

1. **Azure MSAL for Auth**: Configured in `authConfig.ts` with environment variables for client ID, tenant, and redirect URI. Uses `sessionStorage` for token safety.

2. **Feature-First Structure**: Each feature (e.g., `Login/`) owns its components, hooks, and styles. Shared components live in `src/components/`.

3. **MUI + Tailwind Combo**: MUI provides component library + theme system; Tailwind for utility-first styling. Vite plugin handles both.

4. **Modern React Patterns**:
   - Functional components with hooks
   - No class components or legacy patterns
   - Server-side rendering (SSR) not used; CSR only

5. **SCSS for Component Styles**: Feature components use `.scss` files (e.g., `LoginScreen.scss`). Vite configured with `sass-embedded` modern compiler.

6. **Type Safety**: TypeScript strict mode implied by version 6.0. All components properly typed.

---

## Development Workflow

### Build & Run Commands

```bash
# Development server (HMR enabled)
npm run dev

# Production build + TypeScript check
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

**Node.js**: Ensure Node 18+ installed for Vite 5 compatibility.

### Environment Variables

Create `.env` file (or `.env.local` for overrides):
```
VITE_ENTRA_CLIENT_ID=<Azure AD app client ID>
VITE_ENTRA_TENANT_NAME=<Azure AD tenant subdomain>
VITE_ENTRA_TENANT_ID=<Azure AD tenant GUID>
VITE_REDIRECT_URI=http://localhost:5173/auth/redirect
```

Variables prefixed with `VITE_` are exposed to client-side code.

### TypeScript Configuration

- **`tsconfig.json`**: References both `tsconfig.app.json` and `tsconfig.node.json`
- **`tsconfig.app.json`**: App source code (strict mode, DOM lib)
- **`tsconfig.node.json`**: Build tooling (Vite config, etc.)

### ESLint Configuration

Configured in `eslint.config.js`:
- ESLint v10 flat config format
- TypeScript-ESLint recommended rules
- React Hooks rules enforced
- React Refresh HMR rules
- Browser globals enabled

---

## Code Patterns & Conventions

### Component Structure

```typescript
// components/MyComponent.tsx
interface MyComponentProps {
  label: string;
  onClick?: () => void;
}

export function MyComponent({ label, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

**Rules**:
- Export named functional components
- Define props interface above component
- Use React 19 features (concurrent rendering, use directive where applicable)

### Custom Hooks

```typescript
// hooks/useMyHook.ts
export function useMyHook() {
  const [state, setState] = React.useState(null);
  return { state, setState };
}
```

**Rules**:
- File name matches `use*` convention
- Export named hook function
- No default exports

### Styling Strategy

**For component-scoped styles**:
```typescript
// features/Login/LoginScreen.tsx
import "./LoginScreen.scss";

export function LoginScreen() {
  return <main className="login-screen"> {/* styles defined in .scss */}
}
```

**For utility-first classes**:
```typescript
// Use Tailwind classes directly in JSX
<div className="flex gap-4 rounded-lg bg-white p-4">
```

**For MUI integration**:
```typescript
import { Button, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function MyComponent() {
  const theme = useTheme();
  return <Button variant="contained">Click me</Button>;
}
```

### Authentication Flow

- MSAL provider wraps entire app in `main.tsx`
- Components use `useMsal()` hook to access auth instance
- Auth status tracked via `useAuthRedirectHandler()` custom hook
- `LoginButton` component handles login redirect with optional SSO domain hint

---

## State Management

### Zustand Stores

Three stores manage application state with persistence and devtools support:

**Auth Store** (`useAuthStore`):
```typescript
// src/stores/authStore.ts
const { token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```
- Persisted to localStorage via `auth-storage` key
- Holds: token, refreshToken, expiresIn, isAuthenticated

**User Store** (`useUserStore`):
```typescript
// src/stores/userStore.ts
const { user, loading, error, setUser } = useUserStore();
```
- Non-persisted (cleared on refresh)
- Holds: user profile, loading state, errors

**UI Store** (`useUIStore`):
```typescript
// src/stores/uiStore.ts
const { sidebarOpen, theme, showNotification } = useUIStore();
```
- Holds: sidebar state, theme, notification state
- Methods for UI interactions (toggleSidebar, setTheme, showNotification)

**Store Features**:
- Zustand middleware: `devtools` (Redux DevTools support) + `persist` (localStorage)
- All stores exported from `src/stores/index.ts`
- Type-safe with full TypeScript interfaces

### React Query (TanStack Query)

Handles data fetching, caching, and server state management.

**Configuration** (`src/lib/queryClient.ts`):
```typescript
// Default options:
// - staleTime: 5 minutes
// - gcTime: 10 minutes (cache lifetime)
// - retry: 1 attempt on failure
// - refetchOnWindowFocus: false (prevents noise)
```

**API Client** (`src/lib/axios.ts`):
- Axios instance with request/response interceptors
- Auto-injects Bearer token from `useAuthStore`
- Handles 401 errors (redirects to login)

**Custom Hooks** (`src/hooks/useApi.ts`):
```typescript
// GET request with automatic error handling
const { data, isLoading, error } = useApiQuery<User>("/api/users/me");

// Mutation for POST/PUT/DELETE
const mutation = useApiMutation<User, CreateUserPayload>({
  mutationFn: (data) => apiClient.post("/users", data).then(res => res.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});
```

**Provider Setup** (`src/main.tsx`):
- `QueryClientProvider` wraps entire app
- Integrated with MUI ThemeProvider and MSAL auth

---

## Form Handling with React Hook Form

Handles complex form validation, submission, and state management with minimal boilerplate.

### Key Files

- `src/hooks/useFormHandler.ts` — Custom hook with validation rules and utilities
- `src/components/ControlledForm.tsx` — Controlled form components (TextField, Checkbox, Select)
- `src/components/ModernLoginForm.tsx` — Example modern login form
- `src/components/SignUpForm.tsx` — Example sign-up form

### Validation Rules

Pre-built validation rules available:

```typescript
import { validationRules } from "../hooks/useFormHandler";

validationRules.email              // Email validation
validationRules.password           // Min 8 chars
validationRules.confirmPassword    // Password match
validationRules.name               // Min 2 chars
```

### Basic Form with useFormHandler

```typescript
import { useFormHandler, validationRules } from "../hooks/useFormHandler";

interface LoginInputs {
  email: string;
  password: string;
}

export function LoginForm() {
  const { control, handleSubmit, errors, isSubmitting, isValid } =
    useFormHandler<LoginInputs>(
      { email: "", password: "" },
      async (data) => {
        // Handle submission
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

### Controlled Components with MUI

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
          rules={validationRules.name}
        />

        <ControlledTextField
          control={methods.control}
          name="email"
          label="Email"
          type="email"
          rules={validationRules.email}
        />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

### Form with React Query Integration

```typescript
import { useApiMutation } from "../hooks/useApi";
import { useUIStore } from "../stores";

interface CreateUserInputs {
  name: string;
  email: string;
}

export function CreateUserForm() {
  const methods = useForm<CreateUserInputs>();
  const { showNotification } = useUIStore();

  const mutation = useApiMutation<User, CreateUserInputs>({
    mutationFn: (data) =>
      apiClient.post("/users", data).then((res) => res.data),
    onSuccess: () => {
      showNotification("User created!", "success");
      methods.reset();
    },
    onError: (error) => {
      showNotification(error.message, "error");
    },
  });

  return (
    <form onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}>
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
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Dynamic Form Fields

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

### Best Practices

- Use `useFormHandler` hook for simple forms
- Use `FormProvider + useForm` for complex nested forms
- Leverage `ControlledTextField` for MUI integration
- Always display validation errors to users
- Disable submit button during submission
- Reset form after successful submission
- Show loading state with `mutation.isPending`
- Handle errors with notifications via `useUIStore`

See [FORM_HANDLING.md](FORM_HANDLING.md) for complete API reference and additional examples.

---

## Common Development Tasks

### Adding a New Feature

1. Create folder under `src/features/<FeatureName>/`
2. Add `index.ts` exporting public exports
3. Add feature components in `src/features/<FeatureName>/components/`
4. Add feature hooks in `src/features/<FeatureName>/hooks/`
5. Add feature styles in `.scss` files alongside components
6. Export main component from `index.ts`

### Adding a Reusable Component

1. Create `src/components/<ComponentName>.tsx`
2. Define props interface
3. Export named component
4. Consider styling approach (Tailwind classes, MUI integration, or SCSS)

### Adding a Global Hook

1. Create `src/hooks/use<HookName>.ts`
2. Implement hook logic
3. Export named hook

### Updating Theme

1. Edit `src/theme/` files (palette, typography, shadows, component overrides)
2. MUI theme creation in `theme/index.ts`
3. Applied via `<ThemeProvider>` in `main.tsx`

### Using Zustand Stores in Components

```typescript
import { useAuthStore, useUIStore } from "../stores";

export function MyComponent() {
  const { token, isAuthenticated, clearAuth } = useAuthStore();
  const { showNotification } = useUIStore();

  const handleLogout = () => {
    clearAuth();
    showNotification("Logged out successfully", "success");
  };

  return isAuthenticated ? <button onClick={handleLogout}>Logout</button> : null;
}
```

### Fetching Data with React Query

```typescript
import { useApiQuery } from "../hooks/useApi";

export function UserProfile() {
  const { data: user, isLoading, error } = useApiQuery<User>("/api/users/me");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

### Mutations with React Query

```typescript
import { useApiMutation } from "../hooks/useApi";
import { queryClient } from "../lib/queryClient";
import apiClient from "../lib/axios";

export function LoginForm() {
  const mutation = useApiMutation<{ token: string }, LoginPayload>({
    mutationFn: (credentials) =>
      apiClient.post<{ token: string }>("/auth/login", credentials)
        .then(res => res.data),
    onSuccess: (data) => {
      useAuthStore.getState().setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
  });

  const handleSubmit = (credentials: LoginPayload) => {
    mutation.mutate(credentials);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit({...}); }}>
      {/* form fields */}
    </form>
  );
}
```

---

## Debugging & Troubleshooting

- **Auth redirect loops**: Check `VITE_REDIRECT_URI` environment variable matches Azure AD app registration
- **Vite HMR issues**: On WSL/remote: set `VITE_HMR_HOST` environment variable
- **ESLint errors on build**: Run `npm run lint` to check for violations before building
- **TypeScript errors**: Run `tsc --noEmit` to check without building

---

## Import Path Conventions

No path aliases configured; use relative paths:
```typescript
// ✓ Correct
import { LoginButton } from "../components/LoginButton";
import { useAuthRedirectHandler } from "../hooks/useAuthRedirectHandler";

// ✗ Avoid (not configured)
import { LoginButton } from "@/components/LoginButton";
```

---

## Quality Standards

- **Type Coverage**: All components and hooks must have full TypeScript types
- **Linting**: Code must pass `npm run lint` without warnings
- **Naming**: Use PascalCase for components, camelCase for functions/hooks
- **Props**: Always define props as TypeScript interfaces
- **Comments**: JSDoc for complex hooks/utilities; inline comments for non-obvious logic

---

## Related Files

- [README.md](README.md) — Setup instructions and framework docs
- [vite.config.ts](vite.config.ts) — Build tool configuration
- [tsconfig.app.json](tsconfig.app.json) — TypeScript app settings
- [eslint.config.js](eslint.config.js) — Linting rules

---

## Next Steps for AI Agents

When working in this codebase:

1. **Respect the feature structure**: Keep feature-scoped code within feature folders
2. **Use TypeScript strictly**: Avoid `any` types; add interfaces for all props
3. **Follow styling patterns**: Use SCSS for component styles, Tailwind for utilities, MUI for pre-built components
4. **Check environment variables**: Ensure required `VITE_*` vars are set before running
5. **Run quality checks**: Always lint and build before submitting changes (`npm run lint && npm run build`)
6. **Preserve MSAL setup**: Auth configuration in `authConfig.ts` and `main.tsx` is critical—modify carefully


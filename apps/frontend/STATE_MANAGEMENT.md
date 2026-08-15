# State Management Setup Guide

This document provides a quick reference for using Zustand and React Query in your project.

## Installation

Before using the stores, install Zustand:

```bash
npm install zustand
```

React Query is already included in your `package.json`.

## Quick Start

### 1. Using Zustand Stores

#### Auth Store
```typescript
import { useAuthStore } from "../stores";

export function LoginComponent() {
  const { isAuthenticated, token, setAuth, clearAuth } = useAuthStore();

  const handleLogin = (token: string, refreshToken: string) => {
    setAuth(token, refreshToken, 3600); // 1 hour expiry
  };

  return (
    <>
      {isAuthenticated ? (
        <button onClick={clearAuth}>Logout</button>
      ) : (
        <button onClick={() => handleLogin("token", "refresh")}>Login</button>
      )}
    </>
  );
}
```

#### User Store
```typescript
import { useUserStore } from "../stores";

export function UserProfile() {
  const { user, loading, error, setUser, clearUser } = useUserStore();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {user && <p>Name: {user.name}</p>}
    </div>
  );
}
```

#### UI Store
```typescript
import { useUIStore } from "../stores";

export function NotificationDemo() {
  const { showNotification } = useUIStore();

  return (
    <button
      onClick={() =>
        showNotification("Action completed!", "success")
      }
    >
      Show Notification
    </button>
  );
}
```

### 2. Using React Query

#### Fetching Data
```typescript
import { useApiQuery } from "../hooks/useApi";

export function UsersList() {
  const { data: users, isLoading, error } = useApiQuery<User[]>("/api/users");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### Mutating Data
```typescript
import { useApiMutation } from "../hooks/useApi";
import { queryClient } from "../lib/queryClient";

interface CreateUserPayload {
  name: string;
  email: string;
}

export function CreateUserForm() {
  const mutation = useApiMutation<User, CreateUserPayload>({
    mutationFn: (data) =>
      apiClient.post<User>("/api/users", data).then((res) => res.data),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      console.log("User created:", newUser);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" type="email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create User"}
      </button>
      {mutation.error && <p style={{ color: "red" }}>{mutation.error.message}</p>}
    </form>
  );
}
```

### 3. Combining Stores and React Query

```typescript
import { useAuthStore } from "../stores";
import { useApiQuery } from "../hooks/useApi";
import { queryClient } from "../lib/queryClient";

export function Dashboard() {
  const { token, clearAuth } = useAuthStore();
  
  // Query is enabled only when authenticated
  const { data: profile } = useApiQuery("/api/profile", {
    enabled: !!token,
  });

  const handleLogout = () => {
    clearAuth();
    // Clear all cached data
    queryClient.clear();
  };

  return (
    <div>
      {profile && <h1>Welcome, {profile.name}</h1>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Store Persistence

- **Auth Store**: Persisted to localStorage with key `auth-storage`
- **User Store**: Not persisted (cleared on page refresh)
- **UI Store**: Not persisted (resets on page refresh)

To modify persistence:

```typescript
// In authStore.ts
persist(
  (set) => ({ ... }),
  {
    name: "auth-storage", // Change this to change localStorage key
  }
)
```

## React Query Configuration

Default options in `src/lib/queryClient.ts`:

```typescript
{
  staleTime: 1000 * 60 * 5,        // Data is fresh for 5 minutes
  gcTime: 1000 * 60 * 10,          // Cache kept for 10 minutes
  retry: 1,                         // Retry failed requests once
  refetchOnWindowFocus: false,      // Don't refetch when window regains focus
}
```

To override defaults for a specific query:

```typescript
const { data } = useApiQuery("/api/users", {
  staleTime: 1000 * 60 * 30, // Custom: 30 minutes
  retry: 3,                  // Custom: 3 retries
});
```

## Redux DevTools Integration

Zustand stores integrate with Redux DevTools:

1. Install Redux DevTools browser extension (if not already installed)
2. Open Redux DevTools in your browser
3. You'll see all store actions and state changes

## Common Patterns

### Auto-populate User Store from React Query

```typescript
const { data: apiUser } = useApiQuery<User>("/api/users/me", {
  onSuccess: (data) => {
    useUserStore.getState().setUser(data);
  },
});
```

### Conditional Queries Based on Store State

```typescript
const { isAuthenticated } = useAuthStore();
const { data } = useApiQuery("/api/protected", {
  enabled: isAuthenticated,
});
```

### Clear All Cache on Logout

```typescript
const handleLogout = () => {
  clearAuth();
  queryClient.clear(); // Clears all React Query cache
};
```

### Handle API Errors with Notifications

```typescript
const mutation = useApiMutation({
  mutationFn: async (data) => {
    // your API call
  },
  onError: (error) => {
    useUIStore.getState().showNotification(
      error.message || "Something went wrong",
      "error"
    );
  },
});
```

## Environment Variables

Create `.env` file in your project root:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENTRA_CLIENT_ID=<your-client-id>
VITE_ENTRA_TENANT_NAME=<your-tenant>
VITE_ENTRA_TENANT_ID=<your-tenant-id>
VITE_REDIRECT_URI=http://localhost:5173/auth/redirect
```

The API base URL is used in `src/lib/axios.ts` and defaults to `http://localhost:3000/api` if not set.

## Debugging

### Redux DevTools for Zustand
Open Redux DevTools browser extension to see all store state changes and actions.

### React Query DevTools
To add React Query DevTools (optional):

```bash
npm install @tanstack/react-query-devtools
```

Then in your root component:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

## Best Practices

1. **Use stores for client state** (auth, UI, user preferences)
2. **Use React Query for server state** (API data, remote resources)
3. **Keep stores simple** - complex logic belongs in hooks or components
4. **Always type your stores** - full TypeScript support
5. **Use `onSuccess` callbacks** to sync server data to Zustand stores
6. **Enable queries conditionally** - use the `enabled` option when data depends on state
7. **Invalidate queries** after mutations to keep data in sync
8. **Handle errors gracefully** - show notifications via UI store


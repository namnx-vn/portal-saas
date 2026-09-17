import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "../lib/axios";

/**
 * Hook for GET requests with automatic error handling and loading states
 */
export function useApiQuery<T>(
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError>, "queryKey" | "queryFn">
) {
  return useQuery<T, AxiosError>({
    queryKey: [url],
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook for POST/PUT/DELETE mutations with automatic error handling
 */
export function useApiMutation<TData, TVariables>(
  options?: UseMutationOptions<TData, AxiosError, TVariables>
) {
  return useMutation<TData, AxiosError, TVariables>({
    ...options,
  });
}

/**
 * Example: POST mutation
 * const createUserMutation = useApiMutation<User, CreateUserPayload>({
 *   mutationFn: (data) => apiClient.post("/users", data).then(res => res.data),
 *   onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); }
 * });
 */

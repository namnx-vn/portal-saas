import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useApiQuery, useApiMutation } from "../../../hooks/useApi";
import { queryClient } from "../../../lib/queryClient";
import apiClient from "../../../lib/axios";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
  createdAt: string;
  lastLoginAt: string | null;
  departmentRole: { id: string; name: string } | null;
}

interface CreateUserValues {
  email: string;
  role: "admin" | "member";
}

const ADMIN_USERS_URL = "/admin/users";

export function useAdminUsersList() {
  return useApiQuery<AdminUser[]>(ADMIN_USERS_URL);
}

export function useCreateUserForm() {
  const form = useForm<CreateUserValues>({
    defaultValues: { email: "", role: "member" },
  });

  const createMutation = useApiMutation<{ id: string }, CreateUserValues>({
    mutationFn: async (data) => {
      const response = await apiClient.post(ADMIN_USERS_URL, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_URL] });
      form.reset();
    },
  });

  const onSubmit: SubmitHandler<CreateUserValues> = (data) =>
    createMutation.mutate(data);

  return { form, createMutation, onSubmit };
}

export function useAssignDepartmentRole() {
  return useApiMutation<
    AdminUser,
    { id: string; departmentRoleId: string | null }
  >({
    mutationFn: async ({ id, departmentRoleId }) =>
      (await apiClient.patch(`${ADMIN_USERS_URL}/${id}`, { departmentRoleId }))
        .data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_URL] }),
  });
}

export function useChangeUserRole() {
  return useApiMutation<
    { id: string; role: string },
    { id: string; role: "admin" | "member" }
  >({
    mutationFn: async ({ id, role }) => {
      const response = await apiClient.patch(`${ADMIN_USERS_URL}/${id}`, {
        role,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_URL] });
    },
  });
}

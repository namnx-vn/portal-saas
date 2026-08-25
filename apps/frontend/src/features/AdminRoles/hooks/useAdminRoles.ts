import { useApiQuery, useApiMutation } from "../../../hooks/useApi";
import { queryClient } from "../../../lib/queryClient";
import apiClient from "../../../lib/axios";

export interface Department {
  id: string;
  name: string;
}

export interface DepartmentRole {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  permissions: string[];
}

export function useDepartmentsList() {
  return useApiQuery<Department[]>("/admin/departments");
}

export function useCreateDepartment() {
  return useApiMutation<Department, { name: string }>({
    mutationFn: async (data) => (await apiClient.post("/admin/departments", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/departments"] }),
  });
}

export function useRolesList() {
  return useApiQuery<DepartmentRole[]>("/admin/roles");
}

export function useCreateRole() {
  return useApiMutation<DepartmentRole, { name: string; departmentId: string; permissions: string[] }>({
    mutationFn: async (data) => (await apiClient.post("/admin/roles", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/roles"] }),
  });
}
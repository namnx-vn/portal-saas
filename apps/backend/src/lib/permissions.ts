import type { User, DepartmentRole } from "@prisma/client";

// Quyền hệ thống gắn cứng với role admin/member — gate Admin Portal, KHÔNG đổi
const SYSTEM_ADMIN_PERMISSIONS = ["manage_users", "manage_roles", "manage_tenant_settings"];

type UserWithDepartmentRole = Pick<User, "role"> & {
  departmentRole?: Pick<DepartmentRole, "permissions"> | null;
};

export function resolvePermissions(user: UserWithDepartmentRole): string[] {
  const base = user.role === "admin" ? SYSTEM_ADMIN_PERMISSIONS : [];
  const custom = user.departmentRole?.permissions ?? [];
  return Array.from(new Set([...base, ...custom]));
}
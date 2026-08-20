export function getPermissionsForRole(role: string): string[] {
  if (role === "admin") {
    return ["manage_users", "manage_tenant_settings"];
  }
  return [];
}
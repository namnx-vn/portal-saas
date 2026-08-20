export function resolveTenantSubdomain(): string {
  const hostParts = window.location.hostname.split(".");
  if (hostParts.length >= 3) {
    return hostParts[0];
  }
  return import.meta.env.VITE_DEFAULT_TENANT_SUBDOMAIN ?? "acme";
}
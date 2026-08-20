import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/axios";

interface TenantConfig {
  sso_enabled: boolean;
  local_login_enabled: boolean;
  mfa_required: boolean;
  idp_alias: string | null;
  auth_mode: "entra" | "native"
}

export function useTenantConfig(subdomain: string) {
  const tenantConfigQuery = useQuery({
    queryKey: ["tenant-config", subdomain],
    queryFn: async () => {
      const response = await apiClient.get<TenantConfig>("/tenant-config", {
        params: { subdomain },
      });

      return response.data;
    },
    enabled: Boolean(subdomain),
  });

  return {
    config: tenantConfigQuery.data ?? null,
    error: tenantConfigQuery.error,
    loading: tenantConfigQuery.isLoading,
    
  };
}

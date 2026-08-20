import { prisma } from "../lib/prisma.js";

export async function getTenantConfig(subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { idpConfig: true },
  });

  if (!tenant || !tenant.idpConfig) return null;

  return {
    sso_enabled: tenant.idpConfig.ssoEnabled,
    local_login_enabled: tenant.idpConfig.localLoginEnabled,
    mfa_required: tenant.idpConfig.mfaRequired,
    idp_alias: tenant.idpConfig.idpAlias,
    auth_mode: tenant.idpConfig.authMode,
  };
}
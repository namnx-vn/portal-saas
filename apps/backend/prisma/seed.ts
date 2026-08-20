import { prisma } from "../src/lib/prisma";

async function main() {
  const acmeTenant = await prisma.tenant.upsert({
    where: { subdomain: "acme" },
    update: {},
    create: {
      name: "Acme Corp",
      subdomain: "acme",
    },
  });

  await prisma.tenantIdpConfig.upsert({
    where: { tenantId: acmeTenant.id },
    update: {
      ssoEnabled: true,
      idpAlias: "namlabs-partner.onmicrosoft.com",
    },
    create: {
      tenantId: acmeTenant.id,
      ssoEnabled: true,
      idpAlias: "namlabs-partner.onmicrosoft.com",
      localLoginEnabled: true,
      mfaRequired: true,
    },
  });

  // Ensure a tenant with subdomain `native` exists. This tenant uses native auth.
  const nativeTenant = await prisma.tenant.upsert({
    where: { subdomain: "native" },
    update: {},
    create: {
      name: "Native Tenant",
      subdomain: "native",
      idpConfig: {
        create: {
          ssoEnabled: false,
          localLoginEnabled: true,
          mfaRequired: false,
          authMode: "native",
        },
      },
    },
  });

  console.log("Seeded tenants:", { acme: acmeTenant.subdomain, native: nativeTenant.subdomain });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

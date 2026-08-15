import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.tenantIdpConfig.upsert({
    where: { tenantId: acmeTenant.id },
    update: {
      ssoEnabled: true,
      idpAlias: "namlabs-partner.onmicrosoft.com", // domain của tenant thứ 2, dùng cho domain_hint
    },
    create: {
      tenantId: acmeTenant.id,
      ssoEnabled: true,
      idpAlias: "namlabs-partner.onmicrosoft.com",
      localLoginEnabled: true,
      mfaRequired: true, // xem ghi chú bên dưới — hiện KHÔNG điều khiển thực tế
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: "Acme Corp",
      subdomain: "acme",
      idpConfig: {
        create: {
          ssoEnabled: false,
          localLoginEnabled: true,
          mfaRequired: false,
        },
      },
    },
  });

  console.log("Seeded tenant:", tenant);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

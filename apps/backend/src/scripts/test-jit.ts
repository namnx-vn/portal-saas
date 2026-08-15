import { provisionUser } from "../services/auth.service";
import { prisma } from "../lib/prisma";

async function main() {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { subdomain: "acme" } });

  const fakeDecoded = { oid: "fake-object-id-001", email: "user1@acme.test" };

  const user1 = await provisionUser({
    tenantId: tenant.id,
    externalObjectId: fakeDecoded.oid,
    email: fakeDecoded.email,
    ipAddress: "127.0.0.1",
  });
  console.log("Lần 1 (tạo mới):", user1);

  const user2 = await provisionUser({
    tenantId: tenant.id,
    externalObjectId: fakeDecoded.oid,
    email: fakeDecoded.email,
    ipAddress: "127.0.0.1",
  });
  console.log("Lần 2 (cập nhật last_login_at):", user2);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
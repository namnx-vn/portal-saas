import { prisma } from "../lib/prisma";

export async function provisionUser(params: {
  tenantId: string;
  externalObjectId: string;
  email: string;
  ipAddress?: string;
}) {
  const { tenantId, externalObjectId, email, ipAddress } = params;

  const user = await prisma.user.upsert({
    where: { tenantId_externalObjectId: { tenantId, externalObjectId } },
    update: { lastLoginAt: new Date() },
    create: { tenantId, externalObjectId, email, lastLoginAt: new Date() },
  });

  await prisma.loginAuditLog.create({
    data: { userId: user.id, tenantId, eventType: "login_success", ipAddress },
  });

  return user;
}
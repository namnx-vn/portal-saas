import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const BASE_URL = process.env.DEV_BASE_URL ?? "http://localhost:4000";

const TENANT_SUBDOMAIN = process.env.DEV_TENANT_SUBDOMAIN ?? "devnative";
const TENANT_NAME = process.env.DEV_TENANT_NAME ?? "Dev Native Tenant";
const ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL ?? "admin@devnative.test";
const ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? "DevAdmin123!";
const INVITE_EMAIL = process.env.DEV_INVITE_EMAIL ?? "member@devnative.test";
const SSO_ENABLED = process.env.DEV_TENANT_SSO_ENABLED === "true";
const IDP_ALIAS = process.env.DEV_TENANT_IDP_ALIAS ?? null;

async function cleanupTenant(subdomain: string) {
  const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (!tenant) return;
  await prisma.loginAuditLog.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenantIdpConfig.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenant.delete({ where: { id: tenant.id } });
}

async function main() {
  console.log(`\n1. Tạo tenant native "${TENANT_SUBDOMAIN}"...`);
  await cleanupTenant(TENANT_SUBDOMAIN); // idempotent — chạy lại nhiều lần an toàn

  const tenant = await prisma.tenant.create({
    data: {
      name: TENANT_NAME,
      subdomain: TENANT_SUBDOMAIN,
      idpConfig: {
        create: {
          authMode: "native",
          localLoginEnabled: true,
          ssoEnabled: SSO_ENABLED,
          idpAlias: IDP_ALIAS,
          mfaRequired: false, // đổi true nếu muốn test luôn nhánh MFA
        },
      },
    },
  });
  console.log(`   ✓ Tenant "${tenant.subdomain}" (id: ${tenant.id})`);

  console.log(`\n2. Tạo tài khoản admin đầu tiên...`);
  // ⚠️ Bootstrap thẳng qua Prisma vì hệ thống hiện CHƯA có API tạo admin đầu tiên
  // cho tenant native (gap đã flag ở Phase 6) — mọi user khác đều phải qua /admin/users.
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: ADMIN_EMAIL,
      role: "admin",
      passwordHash,
    },
  });
  console.log(`   ✓ Admin: ${admin.email} / ${ADMIN_PASSWORD}`);

  console.log(`\n3. Đăng nhập admin qua API thật (POST /auth/login)...`);
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-subdomain": TENANT_SUBDOMAIN,
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0];
  if (!loginRes.ok || !cookie) {
    throw new Error(
      `Login admin thất bại (status ${loginRes.status}). Backend đã chạy ở ${BASE_URL} chưa?`,
    );
  }
  console.log(`   ✓ Login thành công`);

  console.log(
    `\n4. Admin gửi lời mời cho ${INVITE_EMAIL} (POST /admin/users)...`,
  );
  const inviteRes = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ email: INVITE_EMAIL, role: "member" }),
  });
  const inviteBody = await inviteRes.json();
  if (!inviteRes.ok) {
    throw new Error(`Tạo invite thất bại: ${JSON.stringify(inviteBody)}`);
  }
  console.log(`   ✓ Đã mời ${INVITE_EMAIL} (status: ${inviteBody.status})`);

  console.log(`\n=== Sẵn sàng test trên trình duyệt ===`);
  if (SSO_ENABLED) {
    console.log(
      `   Icon SSO (Microsoft) sẽ hiện trên form login — nhưng bấm vào vẫn cần federation Entra thật`,
    );
    console.log(
      `   đã cấu hình cho domain đó (xem vướng mắc chưa xử lý ở Sprint 2), nếu chưa sẽ lỗi phía Entra.`,
    );
  }
  console.log(
    `- apps/frontend/.env.local: VITE_TENANT_SUBDOMAIN=${TENANT_SUBDOMAIN} (restart lại vite dev sau khi đổi)`,
  );
  console.log(
    `- Login admin tại http://localhost:5173 bằng: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
  );
  console.log(`- Link kích hoạt cho ${INVITE_EMAIL}:`);
  console.log(
    `  Nếu backend chạy với NODE_ENV=test → xem log "[TEST] Invite email skipped..." ở terminal backend.`,
  );
  console.log(
    `  Nếu không → kiểm tra hộp thư ${INVITE_EMAIL} hoặc Resend dashboard > Logs.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

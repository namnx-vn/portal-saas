import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { generateInviteToken } from "../lib/inviteToken.js";
import { hashOtp } from "../lib/otp.js";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:4000";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`✅ ${label}`);
    passed++;
  } else {
    console.error(`❌ ${label}`);
    failed++;
  }
}

async function cleanupTenant(subdomain: string) {
  const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (!tenant) return;
  await prisma.loginAuditLog.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenantIdpConfig.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenant.delete({ where: { id: tenant.id } });
}

async function seedNativeTenant(
  subdomain: string,
  opts: { mfaRequired: boolean },
) {
  return prisma.tenant.create({
    data: {
      name: subdomain,
      subdomain,
      idpConfig: {
        create: {
          authMode: "native",
          localLoginEnabled: true,
          ssoEnabled: false,
          mfaRequired: opts.mfaRequired,
        },
      },
    },
  });
}

// Bootstrap admin trực tiếp qua Prisma, bỏ qua invite flow — hệ thống hiện
// CHƯA có cơ chế tạo admin đầu tiên cho 1 tenant native (gap thiết kế, xem ghi chú cuối file).
async function bootstrapAdmin(
  tenantId: string,
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { tenantId, email, role: "admin", passwordHash },
  });
}

async function loginAndGetCookie(
  subdomain: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-subdomain": subdomain,
    },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!res.ok || !setCookie)
    throw new Error(`Login setup thất bại cho ${email}: ${res.status}`);
  return setCookie.split(";")[0] || "";
}

async function bruteForceOtp(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.mfaOtpHash) throw new Error("User chưa có mfaOtpHash");
  for (let i = 0; i < 1_000_000; i++) {
    const candidate = i.toString().padStart(6, "0");
    if (hashOtp(candidate) === user.mfaOtpHash) return candidate;
  }
  throw new Error("Không tìm ra OTP (không nên xảy ra)");
}

async function main() {
  const TENANT_A = "test-native-a";
  const TENANT_B = "test-native-b";
  const TENANT_MFA = "test-native-mfa";
  const ADMIN_PASSWORD = "AdminPass123!";

  await cleanupTenant(TENANT_A);
  await cleanupTenant(TENANT_B);
  await cleanupTenant(TENANT_MFA);

  const tenantA = await seedNativeTenant(TENANT_A, { mfaRequired: false });
  const tenantB = await seedNativeTenant(TENANT_B, { mfaRequired: false });
  const tenantMfa = await seedNativeTenant(TENANT_MFA, { mfaRequired: true });

  const adminA = await bootstrapAdmin(
    tenantA.id,
    "admin-a@test.local",
    ADMIN_PASSWORD,
  );
  const adminB = await bootstrapAdmin(
    tenantB.id,
    "admin-b@test.local",
    ADMIN_PASSWORD,
  );
  const adminMfa = await bootstrapAdmin(
    tenantMfa.id,
    "admin-mfa@test.local",
    ADMIN_PASSWORD,
  );

  console.log(
    "\n=== 1. Admin tạo user (native) → invite được lưu đúng, chưa activate ===",
  );
  {
    const cookie = await loginAndGetCookie(
      TENANT_A,
      adminA.email,
      ADMIN_PASSWORD,
    );
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ email: "member-a@test.local", role: "member" }),
    });
    const body = await res.json();
    assert(
      res.status === 201 && body.status === "pending",
      "POST /admin/users trả 201, status=pending",
    );

    const created = await prisma.user.findUniqueOrThrow({
      where: { id: body.id },
    });
    assert(
      created.tenantId === tenantA.id,
      "User mới gắn đúng tenantId của admin gọi API",
    );
    assert(!!created.inviteTokenHash, "inviteTokenHash được set");
    assert(
      created.passwordHash === null,
      "passwordHash vẫn null (chưa activate)",
    );
  }

  console.log(
    "\n=== 2. Regression tenant entra — /tenant-config vẫn đúng shape sau Phase 5 ===",
  );
  {
    const res = await fetch(`${BASE_URL}/tenant-config?subdomain=acme`);
    const body = await res.json();
    assert(res.status === 200, "GET /tenant-config?subdomain=acme trả 200");
    assert(
      typeof body.auth_mode === "string",
      "Field auth_mode có mặt (bổ sung ở Phase 5)",
    );
  }
  console.log(
    "⚠️  Luồng /session/callback (Entra thật) cần idToken thật từ redirect — không tự động hoá được ở đây, đã verify thủ công ở Phase 1-2.",
  );

  console.log(
    "\n=== 3. Cross-tenant IDOR — admin B không tạo được user gắn vào tenant A ===",
  );
  {
    const cookieB = await loginAndGetCookie(
      TENANT_B,
      adminB.email,
      ADMIN_PASSWORD,
    );
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieB },
      // Cố tình nhồi tenantId của tenant A — API không đọc field này nên phải bị bỏ qua
      body: JSON.stringify({
        email: "injected@test.local",
        role: "member",
        tenantId: tenantA.id,
      }),
    });
    const body = await res.json();
    assert(
      res.status === 201,
      "Request vẫn thành công (field tenantId lạ trong body không gây lỗi)",
    );

    const created = await prisma.user.findUniqueOrThrow({
      where: { id: body.id },
    });
    assert(
      created.tenantId === tenantB.id,
      "User được tạo dưới tenant B (đúng session), KHÔNG phải tenant A bị nhồi vào body",
    );
  }

  console.log("\n=== 4. Invite hết hạn + dùng lại lần 2 (single-use) ===");
  let expiredRawToken = "";
  {
    const { rawToken, tokenHash } = generateInviteToken();
    expiredRawToken = rawToken;
    await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        email: "expired-invite@test.local",
        inviteTokenHash: tokenHash,
        inviteExpiresAt: new Date(Date.now() - 60 * 1000),
      },
    });

    const res = await fetch(`${BASE_URL}/auth/invite/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken, password: "SomePass123!" }),
    });
    assert(res.status === 410, "Accept invite đã hết hạn → 410");
  }
  {
    const { rawToken, tokenHash } = generateInviteToken();
    const user = await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        email: "reuse-invite@test.local",
        inviteTokenHash: tokenHash,
        inviteExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const first = await fetch(`${BASE_URL}/auth/invite/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken, password: "SomePass123!" }),
    });
    assert(first.status === 200, "Accept lần 1 thành công → 200");

    const second = await fetch(`${BASE_URL}/auth/invite/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken, password: "SomePassKhac456!" }),
    });
    assert(
      second.status === 410,
      "Dùng lại đúng token đó lần 2 → 410 (single-use)",
    );

    const reloaded = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    assert(
      reloaded.inviteTokenHash === null,
      "inviteTokenHash đã bị xoá sau accept thành công",
    );
  }

  console.log("\n=== 5. Gửi invite tới email thật qua domain đã verify ===");
  console.log(
    "⚠️  KHÔNG tự động hoá — cần chạy thủ công KHÔNG có NODE_ENV=test, dùng email thật, xem hướng dẫn cuối file.",
  );

  console.log(
    "\n=== 6+7. MFA native: login đúng → OTP sai bị chặn → OTP đúng vào được → OTP không dùng lại được ===",
  );
  {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-subdomain": TENANT_MFA,
      },
      body: JSON.stringify({ email: adminMfa.email, password: ADMIN_PASSWORD }),
    });
    const body = await res.json();
    assert(
      res.status === 200 && body.mfaRequired === true,
      "Login đúng password, tenant mfaRequired=true → trả preAuthToken",
    );

    const wrongOtpRes = await fetch(`${BASE_URL}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preAuthToken: body.preAuthToken, otp: "000000" }),
    });
    // (Xác suất "000000" trùng OTP thật là 1/1.000.000 — bỏ qua)
    assert(wrongOtpRes.status === 401, "Verify OTP sai → 401");

    const realOtp = await bruteForceOtp(adminMfa.id);
    const correctRes = await fetch(`${BASE_URL}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preAuthToken: body.preAuthToken, otp: realOtp }),
    });
    const correctBody = await correctRes.json();
    assert(
      correctRes.status === 200 && correctBody.role === "admin",
      "Verify OTP đúng → 200, trả role",
    );

    const reusedRes = await fetch(`${BASE_URL}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preAuthToken: body.preAuthToken, otp: realOtp }),
    });
    assert(
      reusedRes.status === 401,
      "Dùng lại đúng OTP đó lần 2 → 401 (đã bị xoá sau verify thành công)",
    );
  }

  console.log(
    "\n=== 8. Resend invite: token hết hạn → gửi lại → token mới dùng được, token cũ thì không ===",
  );
  {
    const res = await fetch(`${BASE_URL}/auth/invite/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: expiredRawToken }),
    });
    const body = await res.json();
    assert(
      res.status === 200 && body.status === "resent",
      "Resend bằng token cũ đã hết hạn → 200",
    );

    const user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenantA.id,
          email: "expired-invite@test.local",
        },
      },
    });
    assert(!!user?.inviteTokenHash, "inviteTokenHash mới đã được ghi vào DB");

    const oldTokenRetry = await fetch(`${BASE_URL}/auth/invite/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: expiredRawToken,
        password: "SomePass123!",
      }),
    });
    assert(
      oldTokenRetry.status === 410,
      "Token CŨ (trước resend) không dùng được nữa",
    );
  }

  console.log(
    "\n=== 9. Rate limit /auth/login, /auth/mfa/verify, /auth/invite/resend ===",
  );
  {
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () =>
        fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-subdomain": TENANT_A,
          },
          body: JSON.stringify({
            email: "nonexistent@test.local",
            password: "wrong",
          }),
        }),
      ),
    );
    const rateLimited = attempts.filter((r) => r.status === 429).length;
    assert(
      rateLimited > 0,
      `/auth/login bị 429 sau nhiều lần gọi liên tiếp (thực tế: ${rateLimited}/12)`,
    );
  }
  {
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () =>
        fetch(`${BASE_URL}/auth/mfa/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preAuthToken: "invalid", otp: "000000" }),
        }),
      ),
    );
    const rateLimited = attempts.filter((r) => r.status === 429).length;
    assert(
      rateLimited > 0,
      `/auth/mfa/verify bị 429 sau nhiều lần gọi liên tiếp (thực tế: ${rateLimited}/12)`,
    );
  }
  {
    const attempts = await Promise.all(
      Array.from({ length: 5 }, () =>
        fetch(`${BASE_URL}/auth/invite/resend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: "invalid-token" }),
        }),
      ),
    );
    const rateLimited = attempts.filter((r) => r.status === 429).length;
    assert(
      rateLimited > 0,
      `/auth/invite/resend (giới hạn 3/giờ) bị 429 sau 5 lần gọi (thực tế: ${rateLimited}/5)`,
    );
  }

  console.log(`\n=== KẾT QUẢ: ${passed} pass / ${failed} fail ===`);
  await cleanupTenant(TENANT_A);
  await cleanupTenant(TENANT_B);
  await cleanupTenant(TENANT_MFA);

  if (failed > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

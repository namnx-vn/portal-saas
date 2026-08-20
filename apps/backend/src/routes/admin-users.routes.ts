import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../lib/requireSession.js";
import { requireAdmin } from "../lib/requireAdmin.js";
import { generateInviteToken } from "../lib/inviteToken.js";
import { sendInviteEmail } from "../lib/mailer.js";

const router = Router();

const INVITE_TOKEN_TTL_HOURS = Number(process.env.INVITE_TOKEN_TTL_HOURS ?? 24);
const ALLOWED_ROLES = ["admin", "member"] as const;

router.post("/admin/users", requireSession, requireAdmin, async (req, res) => {
  const { email, role } = req.body ?? {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing email" });
  }
  if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // 🔒 tenantId lấy từ session admin đang gọi, không nhận từ body/param client
  const tenantId = req.adminUser!.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { idpConfig: true },
  });
  if (tenant?.idpConfig?.authMode !== "native") {
    return res.status(400).json({ error: "Tenant is not in native auth mode" });
  }

  const { rawToken, tokenHash } = generateInviteToken();
  const inviteExpiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        tenantId,
        email,
        role: role ?? "member",
        passwordHash: null,
        inviteTokenHash: tokenHash,
        inviteExpiresAt,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "User already exists for this tenant" });
    }
    throw err;
  }

  await sendInviteEmail({ to: email, rawToken });

  res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
    status: "pending",
  });
});

router.get("/admin/users", requireSession, requireAdmin, async (req, res) => {
  const tenantId = req.adminUser!.tenantId;

  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.passwordHash ? "active" : "pending",
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    })),
  );
});

export default router;
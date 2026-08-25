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
  const inviteExpiresAt = new Date(
    Date.now() + INVITE_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  );

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
      return res
        .status(409)
        .json({ error: "User already exists for this tenant" });
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
    include: { departmentRole: true },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.passwordHash ? "active" : "pending",
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      departmentRole: u.departmentRole
        ? { id: u.departmentRole.id, name: u.departmentRole.name }
        : null,
    })),
  );
});

router.patch(
  "/admin/users/:id",
  requireSession,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { role, departmentRoleId } = req.body ?? {};

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const caller = req.adminUser!;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.tenantId !== caller.tenantId) {
      return res.status(404).json({ error: "User not found" });
    }

    if (role === "member" && target.id === caller.id) {
      const adminCount = await prisma.user.count({
        where: { tenantId: caller.tenantId, role: "admin" },
      });
      if (adminCount <= 1) {
        return res
          .status(409)
          .json({ error: "Cannot demote the last admin of this tenant" });
      }
    }

    if (departmentRoleId !== undefined && departmentRoleId !== null) {
      // 🔒 role phải cùng tenant — không nhận departmentRoleId của tenant khác
      const roleRecord = await prisma.departmentRole.findUnique({
        where: { id: departmentRoleId },
      });
      if (!roleRecord || roleRecord.tenantId !== caller.tenantId) {
        return res.status(400).json({ error: "Invalid departmentRoleId" });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(departmentRoleId !== undefined && { departmentRoleId }),
      },
      include: { departmentRole: true },
    });

    await prisma.loginAuditLog.create({
      data: {
        userId: updated.id,
        tenantId: updated.tenantId,
        eventType: "role_changed",
        ipAddress: req.ip,
      },
    });

    res.json({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      departmentRole: updated.departmentRole
        ? { id: updated.departmentRole.id, name: updated.departmentRole.name }
        : null,
    });
  },
);

export default router;

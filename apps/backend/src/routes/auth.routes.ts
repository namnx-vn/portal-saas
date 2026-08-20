import { Router } from "express";
import type { Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { resolveSubdomain } from "../lib/tenant.js";
import { generateInviteToken } from "../lib/inviteToken.js";
import { generateOtp, hashOtp } from "../lib/otp.js";
import { sendInviteEmail, sendOtpEmail } from "../lib/mailer.js";
import {
  signPortalSession,
  signPreAuthToken,
  verifyPreAuthToken,
} from "../lib/session.js";
import { toSafeUser } from "../lib/user.js";
import { getPermissionsForRole } from "../lib/permissions.js";
import {
  loginRateLimiter,
  mfaRateLimiter,
  inviteResendRateLimiter,
} from "../lib/rateLimiters.js";

const router = Router();

const INVITE_TOKEN_TTL_HOURS = Number(process.env.INVITE_TOKEN_TTL_HOURS ?? 24);
const OTP_TTL_MINUTES = 5;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setSessionCookie(res: Response, token: string) {
  res.cookie("portal_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

router.post("/auth/invite/accept", async (req, res) => {
  const { token, password } = req.body ?? {};

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Missing token" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const tokenHash = hashToken(token);
  const user = await prisma.user.findUnique({
    where: { inviteTokenHash: tokenHash },
  });

  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) {
    return res.status(410).json({ error: "Invite link is invalid or expired" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, inviteTokenHash: null, inviteExpiresAt: null },
  });

  await prisma.loginAuditLog.create({
    data: {
      userId: updated.id,
      tenantId: updated.tenantId,
      eventType: "account_activated",
      ipAddress: req.ip,
    },
  });

  const sessionToken = signPortalSession({
    userId: updated.id,
    tenantId: updated.tenantId,
  });
  setSessionCookie(res, sessionToken);

  res.json({
    user: toSafeUser(updated),
    role: updated.role,
    permissions: getPermissionsForRole(updated.role),
  });
});

router.post(
  "/auth/invite/resend",
  inviteResendRateLimiter,
  async (req, res) => {
    const { token } = req.body ?? {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Missing token" });
    }

    const tokenHash = hashToken(token);
    // Tìm theo token cũ, kể cả đã hết hạn — không lộ email trực tiếp
    const user = await prisma.user.findUnique({
      where: { inviteTokenHash: tokenHash },
    });

    if (!user) {
      return res.status(404).json({ error: "Invite not found" });
    }

    const { rawToken, tokenHash: newTokenHash } = generateInviteToken();
    const inviteExpiresAt = new Date(
      Date.now() + INVITE_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { inviteTokenHash: newTokenHash, inviteExpiresAt },
    });

    await sendInviteEmail({ to: user.email, rawToken });

    res.json({ status: "resent" });
  },
);

router.post("/auth/login", loginRateLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const subdomain = resolveSubdomain(req);
  if (!subdomain)
    return res.status(400).json({ error: "Cannot resolve tenant" });

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { idpConfig: true },
  });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  if (tenant.idpConfig?.authMode !== "native") {
    return res.status(400).json({ error: "Tenant is not in native auth mode" });
  }

  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
  });

  const genericError = () =>
    res.status(401).json({ error: "Invalid email or password" });

  if (!user) return genericError();
  if (!user.passwordHash) {
    return res.status(400).json({ error: "Account not activated" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return genericError();

  if (!tenant.idpConfig?.mfaRequired) {
    await prisma.loginAuditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        eventType: "login_success",
        ipAddress: req.ip,
      },
    });

    const sessionToken = signPortalSession({
      userId: user.id,
      tenantId: user.tenantId,
    });
    setSessionCookie(res, sessionToken);

    return res.json({
      user: toSafeUser(user),
      role: user.role,
      permissions: getPermissionsForRole(user.role),
    });
  }

  const { code, hash } = generateOtp();
  const mfaOtpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaOtpHash: hash, mfaOtpExpiresAt },
  });

  await sendOtpEmail({ to: user.email, otp: code });

  const preAuthToken = signPreAuthToken({
    userId: user.id,
    tenantId: user.tenantId,
  });
  res.json({ mfaRequired: true, preAuthToken });
});

router.post("/auth/mfa/verify", mfaRateLimiter, async (req, res) => {
  const { preAuthToken, otp } = req.body ?? {};
  if (
    !preAuthToken ||
    typeof preAuthToken !== "string" ||
    !otp ||
    typeof otp !== "string"
  ) {
    return res.status(400).json({ error: "Missing preAuthToken or otp" });
  }

  let session;
  try {
    session = verifyPreAuthToken(preAuthToken);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.tenantId !== session.tenantId) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const otpHash = hashOtp(otp);
  const otpValid =
    user.mfaOtpHash &&
    user.mfaOtpExpiresAt &&
    user.mfaOtpExpiresAt >= new Date() &&
    user.mfaOtpHash === otpHash;

  if (!otpValid) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { mfaOtpHash: null, mfaOtpExpiresAt: null },
  });

  await prisma.loginAuditLog.create({
    data: {
      userId: updated.id,
      tenantId: updated.tenantId,
      eventType: "login_success",
      ipAddress: req.ip,
    },
  });

  const sessionToken = signPortalSession({
    userId: updated.id,
    tenantId: updated.tenantId,
  });
  setSessionCookie(res, sessionToken);

  res.json({
    user: toSafeUser(updated),
    role: updated.role,
    permissions: getPermissionsForRole(updated.role),
  });
});

export default router;

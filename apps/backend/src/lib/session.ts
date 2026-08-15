import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET!;

export function signPortalSession(payload: { userId: string; tenantId: string }): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: "1h" });
}
import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET!;

export interface PortalSessionPayload {
  userId: string;
  tenantId: string;
}

export interface PreAuthTokenPayload {
  userId: string;
  tenantId: string;
  purpose: "mfa";
}

export function signPortalSession(payload: PortalSessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: "1h" });
}

export function verifyPortalSession(token: string): PortalSessionPayload {
  return jwt.verify(token, SESSION_SECRET) as PortalSessionPayload;
}

export function signPreAuthToken(payload: { userId: string; tenantId: string }): string {
  return jwt.sign({ ...payload, purpose: "mfa" }, SESSION_SECRET, { expiresIn: "10m" });
}

export function verifyPreAuthToken(token: string): PreAuthTokenPayload {
  const decoded = jwt.verify(token, SESSION_SECRET) as PreAuthTokenPayload;
  if (decoded.purpose !== "mfa") throw new Error("Invalid token purpose");
  return decoded;
}
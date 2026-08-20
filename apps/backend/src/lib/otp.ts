import crypto from "node:crypto";

export function generateOtp(): { code: string; hash: string } {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  return { code, hash: hashOtp(code) };
}

export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
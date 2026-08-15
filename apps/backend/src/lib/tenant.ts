import type { Request } from "express";

export function resolveSubdomain(req: Request): string | undefined | null {
  // Chỉ dùng cho local dev, vì localhost không có subdomain thật
  if (process.env.NODE_ENV !== "production") {
    const override = req.header("x-tenant-subdomain");
    if (override) return override;
  }

  const parts = req.hostname.split(".");
  return parts.length >= 3 ? parts[0] : null;
}
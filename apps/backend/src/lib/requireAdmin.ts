import type { Request, Response, NextFunction } from "express";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      adminUser?: User;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.portalSession;
  if (!session) {
    return res.status(401).json({ error: "No session" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.tenantId !== session.tenantId) {
    return res.status(401).json({ error: "Session invalid" });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  req.adminUser = user;
  next();
}
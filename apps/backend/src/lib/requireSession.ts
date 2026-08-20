import type { Request, Response, NextFunction } from "express";
import { verifyPortalSession } from "./session";
import type { PortalSessionPayload } from "./session";

declare global {
  namespace Express {
    interface Request {
      portalSession?: PortalSessionPayload;
    }
  }
}

export function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.portal_session;
  if (!token) {
    return res.status(401).json({ error: "No session" });
  }

  try {
    req.portalSession = verifyPortalSession(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
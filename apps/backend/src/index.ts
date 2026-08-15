import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { verifyIdToken } from "./lib/jwt";
import { signPortalSession } from "./lib/session";
import { resolveSubdomain } from "./lib/tenant";
import { provisionUser } from "./services/auth.service";
import tenantConfigRouter from "./routes/tenant-config.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(tenantConfigRouter);

app.post("/session/callback", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "Missing idToken" });

  const subdomain = resolveSubdomain(req);
  if (!subdomain) return res.status(400).json({ error: "Cannot resolve tenant" });

  const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    console.error("Token verify failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await provisionUser({
    tenantId: tenant.id,
    externalObjectId: decoded.oid,
    email: decoded.email,
    ipAddress: req.ip,
  });

  const sessionToken = signPortalSession({ userId: user.id, tenantId: tenant.id });
  res.cookie("portal_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

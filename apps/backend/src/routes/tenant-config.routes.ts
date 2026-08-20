import { Router } from "express";
import { getTenantConfig } from "../services/tenant.service.js";

const router = Router();

router.get("/tenant-config", async (req, res) => {
  const { subdomain } = req.query;

  if (!subdomain || typeof subdomain !== "string") {
    return res.status(400).json({ error: "Missing subdomain query param" });
  }

  const config = await getTenantConfig(subdomain);

  if (!config) {
    return res.status(404).json({ error: "Tenant not found" });
  }

  res.json(config);
});

export default router;
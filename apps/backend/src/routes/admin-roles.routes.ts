import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireSession } from "../lib/requireSession";
import { requireAdmin } from "../lib/requireAdmin";

const router = Router();

router.post("/admin/departments", requireSession, requireAdmin, async (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing name" });
  }

  const tenantId = req.adminUser!.tenantId;
  try {
    const department = await prisma.department.create({ data: { tenantId, name } });
    res.status(201).json({ id: department.id, name: department.name });
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ error: "Department already exists" });
    throw err;
  }
});

router.get("/admin/departments", requireSession, requireAdmin, async (req, res) => {
  const tenantId = req.adminUser!.tenantId;
  const departments = await prisma.department.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  res.json(departments.map((d) => ({ id: d.id, name: d.name })));
});

router.post("/admin/roles", requireSession, requireAdmin, async (req, res) => {
  const { name, departmentId, permissions } = req.body ?? {};

  if (!name || typeof name !== "string") return res.status(400).json({ error: "Missing name" });
  if (!departmentId || typeof departmentId !== "string") return res.status(400).json({ error: "Missing departmentId" });
  if (permissions !== undefined && !Array.isArray(permissions)) {
    return res.status(400).json({ error: "permissions must be an array of strings" });
  }

  const tenantId = req.adminUser!.tenantId;

  // 🔒 department phải cùng tenant — không nhận departmentId của tenant khác
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department || department.tenantId !== tenantId) {
    return res.status(400).json({ error: "Invalid departmentId" });
  }

  try {
    const role = await prisma.departmentRole.create({
      data: { tenantId, departmentId, name, permissions: permissions ?? [] },
    });
    res.status(201).json({ id: role.id, name: role.name, departmentId: role.departmentId, permissions: role.permissions });
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ error: "Role already exists in this department" });
    throw err;
  }
});

router.get("/admin/roles", requireSession, requireAdmin, async (req, res) => {
  const tenantId = req.adminUser!.tenantId;
  const roles = await prisma.departmentRole.findMany({
    where: { tenantId },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  res.json(
    roles.map((r) => ({
      id: r.id,
      name: r.name,
      departmentId: r.departmentId,
      departmentName: r.department.name,
      permissions: r.permissions,
    })),
  );
});

export default router;
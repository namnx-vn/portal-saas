import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../lib/requireSession.js";
import {
  getPersonalDashboard,
  savePersonalDailyMetric,
  type DashboardPeriod,
} from "../services/personal-dashboard.service.js";

const router: Router = Router();

const METRIC_FIELDS = [
  "focusMinutes",
  "meetingMinutes",
  "learningMinutes",
  "personalMinutes",
  "tasksPlanned",
  "tasksCompleted",
  "learningSessions",
] as const;

function parsePeriod(value: unknown): DashboardPeriod | null {
  return value === "week" || value === "month" ? value : null;
}

function parseRecordedOn(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function parseMetricInput(body: unknown) {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Record<string, unknown>;
  const recordedOn = parseRecordedOn(candidate.recordedOn);
  if (!recordedOn) return null;

  const values = Object.fromEntries(
    METRIC_FIELDS.map((field) => [field, candidate[field]]),
  ) as Record<(typeof METRIC_FIELDS)[number], unknown>;

  if (
    METRIC_FIELDS.some(
      (field) =>
        typeof values[field] !== "number" ||
        !Number.isInteger(values[field]) ||
        values[field] < 0,
    )
  ) {
    return null;
  }

  const focusMinutes = values.focusMinutes as number;
  const meetingMinutes = values.meetingMinutes as number;
  const learningMinutes = values.learningMinutes as number;
  const personalMinutes = values.personalMinutes as number;
  const tasksPlanned = values.tasksPlanned as number;
  const tasksCompleted = values.tasksCompleted as number;
  const learningSessions = values.learningSessions as number;
  const trackedMinutes = focusMinutes + meetingMinutes + learningMinutes + personalMinutes;

  if (trackedMinutes > 24 * 60 || tasksPlanned > 1000 || tasksCompleted > 1000 || learningSessions > 100) {
    return null;
  }

  return {
    recordedOn,
    focusMinutes,
    meetingMinutes,
    learningMinutes,
    personalMinutes,
    tasksPlanned,
    tasksCompleted,
    learningSessions,
  };
}

async function getSessionUser(userId: string, tenantId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });

  return user?.tenantId === tenantId;
}

router.get("/dashboard/personal", requireSession, async (req, res) => {
  const period = parsePeriod(req.query.period);
  if (!period) return res.status(400).json({ error: "period must be week or month" });

  const session = req.portalSession!;
  if (!(await getSessionUser(session.userId, session.tenantId))) {
    return res.status(401).json({ error: "Session invalid" });
  }
  const dashboard = await getPersonalDashboard(session.userId, session.tenantId, period);

  res.json(dashboard);
});

router.put("/dashboard/personal/daily", requireSession, async (req, res) => {
  const input = parseMetricInput(req.body);
  if (!input) return res.status(400).json({ error: "Invalid daily metric input" });

  const session = req.portalSession!;
  if (!(await getSessionUser(session.userId, session.tenantId))) {
    return res.status(401).json({ error: "Session invalid" });
  }
  const metric = await savePersonalDailyMetric(session.userId, session.tenantId, input);

  res.json({
    recordedOn: metric.recordedOn.toISOString().slice(0, 10),
    focusMinutes: metric.focusMinutes,
    meetingMinutes: metric.meetingMinutes,
    learningMinutes: metric.learningMinutes,
    personalMinutes: metric.personalMinutes,
    tasksPlanned: metric.tasksPlanned,
    tasksCompleted: metric.tasksCompleted,
    learningSessions: metric.learningSessions,
  });
});

export default router;

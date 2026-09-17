import { prisma } from "../lib/prisma.js";

export type DashboardPeriod = "week" | "month";

type DashboardMetricInput = {
  recordedOn: Date;
  focusMinutes: number;
  meetingMinutes: number;
  learningMinutes: number;
  personalMinutes: number;
  tasksPlanned: number;
  tasksCompleted: number;
  learningSessions: number;
};

type DashboardMetric = DashboardMetricInput;

const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  week: 7,
  month: 28,
};

const GOAL_TARGETS: Record<DashboardPeriod, { focusMinutes: number; learningSessions: number }> = {
  week: { focusMinutes: 22 * 60, learningSessions: 5 },
  month: { focusMinutes: 88 * 60, learningSessions: 16 },
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function percent(value: number, total: number): number {
  if (total === 0) return 0;

  return Math.min(100, Math.round((value / total) * 100));
}

function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;

  return Math.round(((current - previous) / previous) * 100);
}

function sumMetrics<T extends { focusMinutes: number; meetingMinutes: number; learningMinutes: number; personalMinutes: number; tasksPlanned: number; tasksCompleted: number; learningSessions: number }>(metrics: T[]) {
  return metrics.reduce(
    (total, metric) => ({
      focusMinutes: total.focusMinutes + metric.focusMinutes,
      meetingMinutes: total.meetingMinutes + metric.meetingMinutes,
      learningMinutes: total.learningMinutes + metric.learningMinutes,
      personalMinutes: total.personalMinutes + metric.personalMinutes,
      tasksPlanned: total.tasksPlanned + metric.tasksPlanned,
      tasksCompleted: total.tasksCompleted + metric.tasksCompleted,
      learningSessions: total.learningSessions + metric.learningSessions,
    }),
    {
      focusMinutes: 0,
      meetingMinutes: 0,
      learningMinutes: 0,
      personalMinutes: 0,
      tasksPlanned: 0,
      tasksCompleted: 0,
      learningSessions: 0,
    },
  );
}

function metricHasActivity(metric: { focusMinutes: number; meetingMinutes: number; learningMinutes: number; personalMinutes: number; tasksCompleted: number; learningSessions: number }): boolean {
  return (
    metric.focusMinutes > 0 ||
    metric.meetingMinutes > 0 ||
    metric.learningMinutes > 0 ||
    metric.personalMinutes > 0 ||
    metric.tasksCompleted > 0 ||
    metric.learningSessions > 0
  );
}

function calculateStreak(metrics: Array<{ recordedOn: Date }>, today: Date): number {
  const activeDates = new Set(metrics.map((metric) => toDateKey(metric.recordedOn)));
  let cursor = startOfUtcDay(today);

  if (!activeDates.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (activeDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function buildChart(
  period: DashboardPeriod,
  start: Date,
  metrics: Array<{ recordedOn: Date; focusMinutes: number }>,
) {
  const focusByDate = new Map(metrics.map((metric) => [toDateKey(metric.recordedOn), metric.focusMinutes]));
  const days = PERIOD_DAYS[period];

  if (period === "week") {
    return Array.from({ length: days }, (_, index) => {
      const date = addDays(start, index);
      return { date: toDateKey(date), focusMinutes: focusByDate.get(toDateKey(date)) ?? 0 };
    });
  }

  return Array.from({ length: 4 }, (_, index) => {
    const weekStart = addDays(start, index * 7);
    const weekEnd = addDays(weekStart, 7);
    const focusMinutes = metrics
      .filter((metric) => metric.recordedOn >= weekStart && metric.recordedOn < weekEnd)
      .reduce((total, metric) => total + metric.focusMinutes, 0);

    return { label: `Tuần ${index + 1}`, focusMinutes };
  });
}

export async function getPersonalDashboard(
  userId: string,
  tenantId: string,
  period: DashboardPeriod,
) {
  const now = new Date();
  const end = addDays(startOfUtcDay(now), 1);
  const start = addDays(end, -PERIOD_DAYS[period]);
  const previousStart = addDays(start, -PERIOD_DAYS[period]);

  const [metrics, previousMetrics, activeMetrics] = await Promise.all([
    prisma.personalDailyMetric.findMany({
      where: { userId, tenantId, recordedOn: { gte: start, lt: end } },
      orderBy: { recordedOn: "asc" },
    }),
    prisma.personalDailyMetric.findMany({
      where: { userId, tenantId, recordedOn: { gte: previousStart, lt: start } },
    }),
    prisma.personalDailyMetric.findMany({
      where: {
        userId,
        tenantId,
        recordedOn: { lte: startOfUtcDay(now), gte: addDays(startOfUtcDay(now), -365) },
        OR: [
          { focusMinutes: { gt: 0 } },
          { meetingMinutes: { gt: 0 } },
          { learningMinutes: { gt: 0 } },
          { personalMinutes: { gt: 0 } },
          { tasksCompleted: { gt: 0 } },
          { learningSessions: { gt: 0 } },
        ],
      },
      select: { recordedOn: true },
    }),
  ]);

  return buildPersonalDashboardData(period, now, metrics, previousMetrics, activeMetrics);
}

export function buildPersonalDashboardData(
  period: DashboardPeriod,
  now: Date,
  metrics: DashboardMetric[],
  previousMetrics: DashboardMetric[],
  activeMetrics: Array<{ recordedOn: Date }>,
) {
  const end = addDays(startOfUtcDay(now), 1);
  const start = addDays(end, -PERIOD_DAYS[period]);
  const totals = sumMetrics(metrics);
  const previousTotals = sumMetrics(previousMetrics);
  const focusTotal =
    totals.focusMinutes +
    totals.meetingMinutes +
    totals.learningMinutes +
    totals.personalMinutes;
  const goalTargets = GOAL_TARGETS[period];
  const taskTarget = totals.tasksPlanned;
  const goals = [
    {
      title: "Hoàn thành công việc",
      current: totals.tasksCompleted,
      target: taskTarget,
      unit: "nhiệm vụ",
      progress: percent(totals.tasksCompleted, taskTarget),
    },
    {
      title: "Thời gian tập trung",
      current: totals.focusMinutes,
      target: goalTargets.focusMinutes,
      unit: "phút",
      progress: percent(totals.focusMinutes, goalTargets.focusMinutes),
    },
    {
      title: "Học tập & phát triển",
      current: totals.learningSessions,
      target: goalTargets.learningSessions,
      unit: "buổi",
      progress: percent(totals.learningSessions, goalTargets.learningSessions),
    },
  ];
  const measurableGoals = goals.filter((goal) => goal.target > 0);

  return {
    period,
    summary: {
      focusMinutes: totals.focusMinutes,
      tasksCompleted: totals.tasksCompleted,
      tasksPlanned: totals.tasksPlanned,
      completionRate: percent(totals.tasksCompleted, totals.tasksPlanned),
      streak: calculateStreak(activeMetrics, now),
      focusChangePercent: changePercent(totals.focusMinutes, previousTotals.focusMinutes),
    },
    chart: buildChart(period, start, metrics),
    goals,
    goalProgress: measurableGoals.length
      ? Math.round(measurableGoals.reduce((total, goal) => total + goal.progress, 0) / measurableGoals.length)
      : 0,
    focusDistribution: [
      { label: "Dự án chính", minutes: totals.focusMinutes, percent: percent(totals.focusMinutes, focusTotal) },
      { label: "Học tập", minutes: totals.learningMinutes, percent: percent(totals.learningMinutes, focusTotal) },
      { label: "Họp & trao đổi", minutes: totals.meetingMinutes, percent: percent(totals.meetingMinutes, focusTotal) },
      { label: "Cá nhân", minutes: totals.personalMinutes, percent: percent(totals.personalMinutes, focusTotal) },
    ],
    recentActivity: metrics
      .filter(metricHasActivity)
      .slice(-3)
      .reverse()
      .map((metric) => ({
        recordedOn: toDateKey(metric.recordedOn),
        focusMinutes: metric.focusMinutes,
        tasksCompleted: metric.tasksCompleted,
        learningSessions: metric.learningSessions,
      })),
  };
}

export async function savePersonalDailyMetric(
  userId: string,
  tenantId: string,
  input: DashboardMetricInput,
) {
  return prisma.personalDailyMetric.upsert({
    where: { userId_recordedOn: { userId, recordedOn: input.recordedOn } },
    create: { userId, tenantId, ...input },
    update: input,
  });
}

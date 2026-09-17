import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPersonalDashboardData } from "./personal-dashboard.service.js";

function metric(recordedOn: string, overrides: Partial<Parameters<typeof buildPersonalDashboardData>[2][number]> = {}) {
  return {
    recordedOn: new Date(`${recordedOn}T00:00:00.000Z`),
    focusMinutes: 0,
    meetingMinutes: 0,
    learningMinutes: 0,
    personalMinutes: 0,
    tasksPlanned: 0,
    tasksCompleted: 0,
    learningSessions: 0,
    ...overrides,
  };
}

describe("personal dashboard metrics", () => {
  it("builds a week dashboard from only the requested period", () => {
    const dashboard = buildPersonalDashboardData(
      "week",
      new Date("2026-09-17T08:00:00.000Z"),
      [
        metric("2026-09-15", {
          focusMinutes: 180,
          meetingMinutes: 60,
          learningMinutes: 30,
          tasksPlanned: 5,
          tasksCompleted: 4,
          learningSessions: 1,
        }),
        metric("2026-09-17", {
          focusMinutes: 120,
          personalMinutes: 30,
          tasksPlanned: 3,
          tasksCompleted: 3,
        }),
      ],
      [metric("2026-09-08", { focusMinutes: 200 })],
      [{ recordedOn: new Date("2026-09-17T00:00:00.000Z") }],
    );

    assert.equal(dashboard.summary.focusMinutes, 300);
    assert.equal(dashboard.summary.tasksCompleted, 7);
    assert.equal(dashboard.summary.tasksPlanned, 8);
    assert.equal(dashboard.summary.completionRate, 88);
    assert.equal(dashboard.summary.focusChangePercent, 50);
    assert.equal(dashboard.chart.length, 7);
    assert.deepEqual(
      dashboard.chart.map((point) => "date" in point ? point.date : undefined),
      [
        "2026-09-11",
        "2026-09-12",
        "2026-09-13",
        "2026-09-14",
        "2026-09-15",
        "2026-09-16",
        "2026-09-17",
      ],
    );
    assert.equal(dashboard.chart[4]?.focusMinutes, 180);
    assert.equal(dashboard.focusDistribution[0]?.percent, 71);
    assert.equal(dashboard.focusDistribution[1]?.percent, 7);
    assert.equal(dashboard.focusDistribution[2]?.percent, 14);
    assert.equal(dashboard.focusDistribution[3]?.percent, 7);
  });

  it("continues a streak from yesterday when today has no activity", () => {
    const dashboard = buildPersonalDashboardData(
      "week",
      new Date("2026-09-17T08:00:00.000Z"),
      [],
      [],
      [
        { recordedOn: new Date("2026-09-16T00:00:00.000Z") },
        { recordedOn: new Date("2026-09-15T00:00:00.000Z") },
      ],
    );

    assert.equal(dashboard.summary.streak, 2);
    assert.equal(dashboard.summary.focusChangePercent, 0);
    assert.equal(dashboard.goalProgress, 0);
  });

  it("groups month charts into four weekly buckets", () => {
    const dashboard = buildPersonalDashboardData(
      "month",
      new Date("2026-09-17T08:00:00.000Z"),
      [
        metric("2026-08-22", { focusMinutes: 60 }),
        metric("2026-08-30", { focusMinutes: 90 }),
        metric("2026-09-06", { focusMinutes: 120 }),
        metric("2026-09-17", { focusMinutes: 150 }),
      ],
      [],
      [],
    );

    assert.deepEqual(
      dashboard.chart.map((point) => point.focusMinutes),
      [60, 90, 120, 150],
    );
  });
});

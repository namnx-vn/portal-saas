import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  BoltRounded,
  CalendarTodayRounded,
  CheckCircleRounded,
  FileDownloadOutlined,
  LocalFireDepartmentRounded,
  TaskAltRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Alert, Avatar, Button, CircularProgress, LinearProgress } from "@mui/material";
import { useApiQuery } from "../../hooks/useApi";
import { useUserStore } from "../../stores";
import "./DashboardScreen.scss";

type Period = "week" | "month";

interface PersonalDashboard {
  summary: {
    focusMinutes: number;
    tasksCompleted: number;
    tasksPlanned: number;
    completionRate: number;
    streak: number;
    focusChangePercent: number | null;
  };
  chart: Array<{ date?: string; label?: string; focusMinutes: number }>;
  goals: Array<{
    title: string;
    current: number;
    target: number;
    unit: string;
    progress: number;
  }>;
  goalProgress: number;
  focusDistribution: Array<{ label: string; minutes: number; percent: number }>;
  recentActivity: Array<{
    recordedOn: string;
    focusMinutes: number;
    tasksCompleted: number;
    learningSessions: number;
  }>;
}

const focusColors = ["#4c7c68", "#d49a5b", "#7589b3", "#c2bdb3"];

function getDisplayName(email: string) {
  const localPart = email.split("@")[0] || "bạn";
  const words = localPart.split(/[._-]+/).filter(Boolean);

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDecimalHours(minutes: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(minutes / 60);
}

function formatDuration(minutes: number) {
  if (minutes === 0) return "0 phút";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} phút`;
  if (remainingMinutes === 0) return `${hours} giờ`;

  return `${hours} giờ ${remainingMinutes} phút`;
}

function chartLabel(point: PersonalDashboard["chart"][number]) {
  if (point.label) return point.label;
  if (!point.date) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${point.date}T00:00:00.000Z`))
    .replace("Th ", "T");
}

function createEmptyDashboard(period: Period): PersonalDashboard {
  const today = new Date();
  const chart = period === "week"
    ? Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - 6 + index);
        return { date: date.toISOString().slice(0, 10), focusMinutes: 0 };
      })
    : Array.from({ length: 4 }, (_, index) => ({ label: `Tuần ${index + 1}`, focusMinutes: 0 }));

  return {
    summary: {
      focusMinutes: 0,
      tasksCompleted: 0,
      tasksPlanned: 0,
      completionRate: 0,
      streak: 0,
      focusChangePercent: 0,
    },
    chart,
    goals: [
      { title: "Hoàn thành công việc", current: 0, target: 0, unit: "nhiệm vụ", progress: 0 },
      { title: "Thời gian tập trung", current: 0, target: period === "week" ? 1320 : 5280, unit: "phút", progress: 0 },
      { title: "Học tập & phát triển", current: 0, target: period === "week" ? 5 : 16, unit: "buổi", progress: 0 },
    ],
    goalProgress: 0,
    focusDistribution: [
      { label: "Dự án chính", minutes: 0, percent: 0 },
      { label: "Học tập", minutes: 0, percent: 0 },
      { label: "Họp & trao đổi", minutes: 0, percent: 0 },
      { label: "Cá nhân", minutes: 0, percent: 0 },
    ],
    recentActivity: [],
  };
}

function formatGoalValue(value: number, unit: string) {
  return unit === "phút" ? formatDuration(value) : `${value} ${unit}`;
}

export function DashboardScreen() {
  const user = useUserStore((state) => state.user);
  const [period, setPeriod] = useState<Period>("week");
  const { data: dashboard, isError, isLoading } = useApiQuery<PersonalDashboard>(
    `/dashboard/personal?period=${period}`,
    { enabled: Boolean(user) },
  );

  const formattedDate = useMemo(
    () => new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    [],
  );

  if (!user) return null;

  const data = dashboard ?? createEmptyDashboard(period);
  const displayName = getDisplayName(user.email);
  const periodLabel = period === "week" ? "7 ngày qua" : "4 tuần qua";
  const periodDays = period === "week" ? 7 : 28;
  const chartMax = Math.max(60, ...data.chart.map((item) => item.focusMinutes));
  const chartScale = [formatDuration(chartMax), formatDuration(Math.round(chartMax / 2)), "0 phút"];
  const mostProductive = data.chart.reduce(
    (best, item) => item.focusMinutes > best.focusMinutes ? item : best,
    data.chart[0]!,
  );
  const focusAreas = data.focusDistribution.map((area, index) => ({
    ...area,
    color: focusColors[index] ?? "#c2bdb3",
  }));
  const focusDonut = focusAreas.some((area) => area.percent > 0)
    ? `conic-gradient(${focusAreas.reduce<string[]>((segments, area, index) => {
        const previous = focusAreas.slice(0, index).reduce((total, item) => total + item.percent, 0);
        segments.push(`${area.color} ${previous}% ${previous + area.percent}%`);
        return segments;
      }, []).join(", ")})`
    : "#edf0eb";
  const focusChange = data.summary.focusChangePercent;
  const focusChangeLabel = focusChange === null
    ? "Chưa có dữ liệu kỳ trước"
    : focusChange > 0
      ? `Tăng ${focusChange}% so với kỳ trước`
      : focusChange < 0
        ? `Giảm ${Math.abs(focusChange)}% so với kỳ trước`
        : "Không đổi so với kỳ trước";
  const stats = [
    {
      label: "Thời gian tập trung",
      value: formatDecimalHours(data.summary.focusMinutes),
      unit: "giờ",
      change: focusChangeLabel,
      icon: AccessTimeRounded,
      tone: "green",
    },
    {
      label: "Công việc hoàn thành",
      value: data.summary.tasksCompleted,
      unit: "nhiệm vụ",
      change: data.summary.tasksPlanned
        ? `${data.summary.tasksPlanned} nhiệm vụ đã lên kế hoạch`
        : "Chưa đặt kế hoạch công việc",
      icon: CheckCircleRounded,
      tone: "blue",
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: data.summary.completionRate,
      unit: "%",
      change: data.summary.tasksPlanned
        ? `${data.summary.tasksCompleted}/${data.summary.tasksPlanned} nhiệm vụ hoàn tất`
        : "Chưa có nhiệm vụ được lên kế hoạch",
      icon: TrendingUpRounded,
      tone: "amber",
    },
    {
      label: "Chuỗi hiệu suất",
      value: data.summary.streak,
      unit: "ngày",
      change: data.summary.streak ? "Ngày có hoạt động liên tiếp" : "Bắt đầu ghi nhận hoạt động hôm nay",
      icon: LocalFireDepartmentRounded,
      tone: "coral",
    },
  ];

  return (
    <div className="personal-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-header__eyebrow">
            <CalendarTodayRounded aria-hidden="true" />
            {formattedDate}
          </p>
          <h1>Chào buổi sáng, {displayName}</h1>
          <p className="dashboard-header__subtitle">
            {isLoading ? "Đang tải số liệu cá nhân của bạn…" : "Theo dõi nhịp làm việc và tiến độ mục tiêu của bạn."}
          </p>
        </div>

        <div className="dashboard-header__actions">
          <div className="period-switch" role="group" aria-label="Chọn khoảng thời gian">
            <button type="button" className={period === "week" ? "is-active" : ""} aria-pressed={period === "week"} onClick={() => setPeriod("week")}>
              Tuần
            </button>
            <button type="button" className={period === "month" ? "is-active" : ""} aria-pressed={period === "month"} onClick={() => setPeriod("month")}>
              Tháng
            </button>
          </div>
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={() => window.print()} className="dashboard-export">
            Xuất báo cáo
          </Button>
          <Avatar className="dashboard-header__avatar">{displayName.charAt(0)}</Avatar>
        </div>
      </header>

      {isError && <Alert severity="error" className="dashboard-error">Không thể tải số liệu cá nhân. Vui lòng thử lại sau.</Alert>}

      <section className="stats-grid" aria-label="Số liệu tổng quan" aria-busy={isLoading}>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.label}>
              <div className={`stat-card__icon stat-card__icon--${stat.tone}`}><Icon aria-hidden="true" /></div>
              <p className="stat-card__label">{stat.label}</p>
              <div className="stat-card__value-row"><strong>{stat.value}</strong><span>{stat.unit}</span></div>
              <p className="stat-card__change">{stat.change}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card activity-card">
          <div className="dashboard-card__header">
            <div><h2>Nhịp làm việc</h2><p>Thời gian tập trung trong {periodLabel}</p></div>
            {isLoading ? <CircularProgress size={18} aria-label="Đang tải biểu đồ" /> : <span className="activity-card__trend"><TrendingUpRounded aria-hidden="true" /> {focusChange === null ? "Mới" : `${focusChange > 0 ? "+" : ""}${focusChange}%`}</span>}
          </div>

          <div className="activity-chart" role="img" aria-label={`Biểu đồ thời gian tập trung ${periodLabel}: ${data.chart.map((item) => `${chartLabel(item)} ${formatDuration(item.focusMinutes)}`).join(", ")}`}>
            <div className="activity-chart__scale" aria-hidden="true">{chartScale.map((label) => <span key={label}>{label}</span>)}</div>
            <div className="activity-chart__plot" aria-hidden="true">
              <span className="activity-chart__line activity-chart__line--top" /><span className="activity-chart__line activity-chart__line--middle" /><span className="activity-chart__line activity-chart__line--bottom" />
              {data.chart.map((item) => (
                <div className="activity-chart__column" key={item.date ?? item.label}>
                  <div className="activity-chart__bar-wrap" title={formatDuration(item.focusMinutes)}><span className="activity-chart__bar" style={{ height: `${Math.max(0, (item.focusMinutes / chartMax) * 100)}%` }} /></div>
                  <span className="activity-chart__label">{chartLabel(item)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-card__footer">
            <div><span>Trung bình mỗi ngày</span><strong>{formatDuration(Math.round(data.summary.focusMinutes / periodDays))}</strong></div>
            <div><span>Thời điểm hiệu suất nhất</span><strong>{mostProductive.focusMinutes ? chartLabel(mostProductive) : "Chưa có dữ liệu"}</strong></div>
          </div>
        </article>

        <article className="dashboard-card weekly-goal-card">
          <div className="dashboard-card__header"><div><h2>Mục tiêu {period === "week" ? "tuần" : "tháng"}</h2><p>{data.goals.some((goal) => goal.target > 0) ? "Tiến độ theo số liệu đã ghi nhận" : "Chưa có mục tiêu công việc được ghi nhận"}</p></div></div>
          <div className="goal-score">
            <div className="goal-score__ring" role="img" aria-label={`Đã hoàn thành ${data.goalProgress} phần trăm mục tiêu`} style={{ background: `conic-gradient(var(--dashboard-accent) 0 ${data.goalProgress}%, #edf0eb ${data.goalProgress}% 100%)` }}>
              <div><strong>{data.goalProgress}%</strong><span>hoàn thành</span></div>
            </div>
            <p><AutoAwesomeRounded aria-hidden="true" />{data.goalProgress ? "Dữ liệu được tổng hợp từ các bản ghi đã lưu" : "Bắt đầu cập nhật số liệu để theo dõi tiến độ"}</p>
          </div>
          <div className="goal-list">
            {data.goals.map((goal) => (
              <div className="goal-item" key={goal.title}>
                <div className="goal-item__copy"><span>{goal.title}</span><strong>{goal.target ? `${formatGoalValue(goal.current, goal.unit)} / ${formatGoalValue(goal.target, goal.unit)}` : "Chưa đặt mục tiêu"}</strong></div>
                <LinearProgress variant="determinate" value={goal.progress} aria-label={`${goal.title}: ${goal.progress}%`} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card focus-card">
          <div className="dashboard-card__header"><div><h2>Phân bổ tập trung</h2><p>{formatDecimalHours(data.summary.focusMinutes)} giờ theo nhóm hoạt động</p></div></div>
          <div className="focus-card__content">
            <div className="focus-donut" role="img" aria-label={focusAreas.map((area) => `${area.label} ${area.percent}%`).join(", ")} style={{ background: focusDonut }}><div><strong>{formatDecimalHours(data.summary.focusMinutes)}</strong><span>giờ</span></div></div>
            <ul className="focus-legend">
              {focusAreas.map((area) => <li key={area.label}><span className="focus-legend__dot" style={{ backgroundColor: area.color }} /><span>{area.label}</span><strong>{area.percent}%</strong></li>)}
            </ul>
          </div>
        </article>

        <article className="dashboard-card recent-card">
          <div className="dashboard-card__header"><div><h2>Hoạt động gần đây</h2><p>Được tạo từ số liệu bạn đã ghi nhận</p></div></div>
          <div className="recent-list">
            {data.recentActivity.length === 0 ? <p className="recent-list__empty">Chưa có hoạt động được ghi nhận trong kỳ này.</p> : data.recentActivity.map((activity) => {
              const isTask = activity.tasksCompleted > 0;
              const isFocus = !isTask && activity.focusMinutes > 0;
              const Icon = isTask ? TaskAltRounded : isFocus ? BoltRounded : AutoAwesomeRounded;
              const title = isTask ? `Hoàn thành ${activity.tasksCompleted} công việc` : isFocus ? `Tập trung ${formatDuration(activity.focusMinutes)}` : `Hoàn thành ${activity.learningSessions} buổi học tập`;
              const tone = isTask ? "green" : isFocus ? "amber" : "blue";
              const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${activity.recordedOn}T00:00:00.000Z`));

              return <div className="recent-item" key={`${activity.recordedOn}-${title}`}><span className={`recent-item__icon recent-item__icon--${tone}`}><Icon aria-hidden="true" /></span><div><strong>{title}</strong><span>{date}</span></div><CheckCircleRounded className="recent-item__check" aria-hidden="true" /></div>;
            })}
          </div>
          {user.role === "admin" && <Link className="recent-card__link" to="/admin/users">Quản lý thành viên <ArrowForwardRounded aria-hidden="true" /></Link>}
        </article>
      </section>
    </div>
  );
}

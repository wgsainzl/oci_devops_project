import { type JSX, useEffect, useState } from "react";
import { useAPI } from "../useAPI";
import { useAuth } from "../hooks/AuthContext";
import type {
  PendingAction,
  DashboardStats,
  ActivityLogItem,
  WorkloadMember,
  TaskStatusEntry,
  SprintVelocityEntry,
} from "../types";

import PageHeader from "../components/layout/PageHeader";
import PendingActionsTable from "../components/tasks/PendingActionsTable";
import StatsCards from "../components/tasks/StatsCards";
import RecentActivity from "../components/tasks/RecentActivity";
import TeamWorkload from "../components/tasks/TeamWorkload";
import TaskStatusChart from "../components/charts/TaskStatusChart";
import SprintVelocityChart from "../components/charts/SprintVelocityChart";
import CostPerDeveloperChart, {
  COST_PLACEHOLDER,
  type CostEntry,
} from "../components/charts/CostPerDeveloperChart";
import HoursChart, {
  HOURS_PLACEHOLDER,
  type HoursEntry,
} from "../components/charts/HoursChart";
import SprintCostSummary, {
  SPRINT_SUMMARY_PLACEHOLDER,
  type SprintSummary,
} from "../components/charts/SprintCostSummary";
import styles from "./HomePage.module.css";

// dashboard data shape
interface DashboardData {
  pendingActions: PendingAction[];
  stats: DashboardStats;
  activity: ActivityLogItem[];
  workload: WorkloadMember[];
  taskStatus: TaskStatusEntry[];
  velocity: SprintVelocityEntry[];
  costPerDev: CostEntry[];
  hoursPerDev: HoursEntry[];
  sprintSummaries: SprintSummary[];
  availableSprints: string[]; // NEW: to pass dynamic sprints to the chart
}

type ChartKey =
  | "taskStatus"
  | "sprintVelocity"
  | "costPerDeveloper"
  | "sprintTotals"
  | "hoursPerDeveloper";

/*const VISIBLE_CHARTS_BY_ROLE: Record<UserRole, ChartKey[]> = {
  ADMIN: [
    "taskStatus",
    "sprintVelocity",
    "costPerDeveloper",
    "sprintTotals",
    "hoursPerDeveloper",
  ],
  MANAGER: [
    "taskStatus",
    "sprintVelocity",
    "costPerDeveloper",
    "sprintTotals",
    "hoursPerDeveloper",
  ],
  DEVELOPER: ["taskStatus", "sprintVelocity"],
};*/

// Start with placeholders while loading or if it fails
const PLACEHOLDER: DashboardData = {
  pendingActions: [],
  stats: { completed: 0, updated: 0, created: 0, dueSoon: 0, dueNext7: 0 },
  activity: [
    {
      id: 1,
      date: "Today",
      actor: "System",
      action: "Historical activity log is currently unavailable (Backend pending)",
      status: "TODO",
      time: "Just now",
    },
  ],
  workload: [],
  taskStatus: [],
  velocity: [],
  costPerDev: COST_PLACEHOLDER,
  hoursPerDev: HOURS_PLACEHOLDER,
  sprintSummaries: SPRINT_SUMMARY_PLACEHOLDER,
  availableSprints: ["Sprint 0", "Sprint 1"],
};

export default function HomePage(): JSX.Element {
  let { user, isManager } = useAuth();
  isManager = true;
  //const role: UserRole = user?.role ?? "DEVELOPER";
  //const visibleCharts = VISIBLE_CHARTS_BY_ROLE[role];
  //const _canSeeChart = (chart: ChartKey): boolean =>
  //  visibleCharts.includes(chart);
  const canSeeChart = (chart: ChartKey) => {
    if (chart) return true;
  };

  const [data, setData] = useState<DashboardData>(PLACEHOLDER);

  useEffect(() => {
    let cancelled = false;

    // WORKAROUND: Fetch all tasks to compute the dashboard locally
    useAPI.tasks
      .getAll()
      .then((tasks) => {
        if (cancelled) return;

        // 1. Compute Pending Actions
        const pendingActions: PendingAction[] = tasks
          .filter((t) => t.status === "BLOCKED" || t.status === "IN_REVIEW")
          .map((t) => ({
            id: `Task-${t.taskId}`,
            title: t.title,
            responsible: t.responsible?.name || "Unassigned",
            message: t.status === "BLOCKED" ? "Task is blocked" : "Pending Review",
            action: t.status === "BLOCKED" ? "Resolve Blocker" : "Review Task",
          }));

        // 2. Compute General Stats
        const now = new Date().getTime();
        const next7Days = now + 7 * 24 * 60 * 60 * 1000;
        const stats: DashboardStats = {
          completed: tasks.filter((t) => t.status === "DONE").length,
          updated: tasks.filter((t) => t.updatedAt).length,
          created: tasks.length,
          dueSoon: tasks.filter(
            (t) => t.status !== "DONE" && new Date(t.dueDate).getTime() < next7Days,
          ).length,
          dueNext7: tasks.filter(
            (t) => t.status !== "DONE" && new Date(t.dueDate).getTime() < next7Days,
          ).length,
        };

        // 3. Compute Team Workload %
        const activeTasks = tasks.filter((t) => t.status !== "DONE");
        const workloadMap: Record<string, number> = {};
        activeTasks.forEach((t) => {
          const name = t.responsible?.name || "Unassigned";
          workloadMap[name] = (workloadMap[name] || 0) + 1;
        });
        const totalActive = activeTasks.length || 1;
        const workload: WorkloadMember[] = Object.entries(workloadMap).map(
          ([name, count]) => ({
            name,
            pct: Math.round((count / totalActive) * 100),
          }),
        );

        // 4. Compute Task Status by Developer
        const statusMap: Record<string, TaskStatusEntry> = {};
        tasks.forEach((t) => {
          const userId = t.responsible?.userId?.toString() || "unassigned";
          const developer = t.responsible?.name || "Unassigned";

          if (!statusMap[userId]) {
            statusMap[userId] = {
              developer,
              userId,
              todo: 0,
              inProgress: 0,
              inReview: 0,
              blocked: 0,
              done: 0,
            };
          }

          if (t.status === "TODO") statusMap[userId].todo++;
          if (t.status === "IN_PROGRESS") statusMap[userId].inProgress++;
          if (t.status === "IN_REVIEW") statusMap[userId].inReview++;
          if (t.status === "BLOCKED") statusMap[userId].blocked++;
          if (t.status === "DONE") statusMap[userId].done++;
        });
        const taskStatus = Object.values(statusMap);

        // 5. Compute Sprint Velocity
        const velocityMap: Record<number, SprintVelocityEntry> = {};
        tasks.forEach((t) => {
          if (!t.sprint) return;
          const sId = t.sprint.sprintId;

          if (!velocityMap[sId]) {
            velocityMap[sId] = { iteration: sId, estimated: 0, actual: 0 };
          }
          velocityMap[sId].estimated += t.estimatedHours || 0;
          velocityMap[sId].actual += t.actualHours || 0;
        });
        const velocity = Object.values(velocityMap);

        // ====================================================================
        // 6. Compute Cost & Hours per Developer + Sprint Summaries
        // ====================================================================
        const HOURLY_RATE = 24.04;

        const costMap: Record<string, any> = {};
        const hoursMap: Record<string, any> = {};
        const sprintSumMap: Record<string, any> = {};
        const uniqueSprints = new Set<string>();

        tasks.forEach((t) => {
          const devName = t.responsible?.name?.split(" ")[0] || "Unassigned";
          const sprintName =
            t.sprint?.sprintName || `Sprint ${t.sprint?.sprintId || "?"}`;

          uniqueSprints.add(sprintName);

          // A. Cost per Dev (Grouped by Developer, keys are Sprints)
          if (!costMap[devName]) {
            costMap[devName] = { developer: devName };
          }
          costMap[devName][sprintName] =
            (costMap[devName][sprintName] || 0) + (t.actualHours || 0) * HOURLY_RATE;

          // B. Hours per Dev
          if (!hoursMap[devName]) {
            hoursMap[devName] = { developer: devName, estimated: 0, actual: 0 };
          }
          hoursMap[devName].estimated += t.estimatedHours || 0;
          hoursMap[devName].actual += t.actualHours || 0;

          // C. Sprint Cost Summary
          if (!sprintSumMap[sprintName]) {
            sprintSumMap[sprintName] = {
              sprint: sprintName,
              totalCost: 0,
              totalHours: 0,
            };
          }
          sprintSumMap[sprintName].totalCost += (t.actualHours || 0) * HOURLY_RATE;
          sprintSumMap[sprintName].totalHours += t.actualHours || 0;
        });

        // Cast back to expected types
        const costPerDev = Object.values(costMap) as CostEntry[];
        const hoursPerDev = Object.values(hoursMap) as HoursEntry[];
        const sprintSummaries = Object.values(sprintSumMap) as SprintSummary[];
        const availableSprints = Array.from(uniqueSprints);

        // Update State
        setData((prev) => ({
          ...prev,
          pendingActions,
          stats,
          workload,
          taskStatus,
          velocity,
          costPerDev,
          hoursPerDev,
          sprintSummaries,
          availableSprints,
        }));
      })
      .catch((err) => {
        console.error("Failed to compute dashboard data:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <PageHeader title="Home" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>
        {/* pending actions and stats */}
        <div className={styles.row1}>
          <section className={`${styles.card} ${styles.pendingCard}`}>
            <h2 className={styles.sectionTitle}>Pending actions</h2>
            <PendingActionsTable rows={data.pendingActions} />
          </section>
          <aside className={styles.statsAside}>
            <StatsCards stats={data.stats} />
          </aside>
        </div>

        {/* recent activity and team workload */}
        <div className={styles.row2}>
          <section className={`${styles.card} ${styles.activityCard}`}>
            <h2 className={styles.sectionTitle}>Recent activity</h2>
            <RecentActivity items={data.activity} />
          </section>
          <section className={`${styles.card} ${styles.workloadCard}`}>
            <h2 className={styles.sectionTitle}>Team workload</h2>
            <TeamWorkload members={data.workload} />
          </section>
        </div>

        {/* task status and sprint velocity */}
        {(canSeeChart("taskStatus") || canSeeChart("sprintVelocity")) && (
          <div className={styles.row3}>
            {canSeeChart("taskStatus") && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>
                  {isManager ? "Team Tasks Status" : "My Tasks Status"}
                </h2>
                <TaskStatusChart
                  data={
                    isManager
                      ? data.taskStatus
                      : data.taskStatus.filter(
                          (t) => t.userId === user?.userId?.toString(),
                        )
                  }
                  showDeveloperNames={isManager}
                />
              </section>
            )}
            {canSeeChart("sprintVelocity") && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Team Sprint Velocity</h2>
                <SprintVelocityChart data={data.velocity} />
              </section>
            )}
          </div>
        )}

        {/* cost per developer and sprint summary */}
        {(canSeeChart("costPerDeveloper") || canSeeChart("sprintTotals")) && (
          <div className={styles.row3}>
            {canSeeChart("costPerDeveloper") && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>
                  Cost per Developer by Sprint (USD)
                </h2>
                {/* Dynamically pass down the sprints we extracted from the database */}
                <CostPerDeveloperChart
                  data={data.costPerDev}
                  sprints={data.availableSprints}
                />
              </section>
            )}
            {canSeeChart("sprintTotals") && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Sprint Totals</h2>
                <SprintCostSummary sprints={data.sprintSummaries} />
              </section>
            )}
          </div>
        )}

        {/* hours per developer */}
        {canSeeChart("hoursPerDeveloper") && (
          <div className={styles.row3}>
            <section className={`${styles.card}`} style={{ gridColumn: "1 / -1" }}>
              <h2 className={styles.sectionTitle}>
                Hours per Developer
                <span className={styles.sectionHint}> — red bar = over estimate</span>
              </h2>
              <HoursChart data={data.hoursPerDev} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

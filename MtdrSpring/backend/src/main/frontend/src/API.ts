/**
 * central API layer for frontend
 * all communication with spring boot backend goes here

 * base URL is read from the VITE_API_BASE_URL environment variable so
 the same build artifact can point at different environments (dev,
 staging, prod) without a code change, just swap the .env file

 * the vite dev server proxies /api → localhost:8080 (on vite.config.js),
 so during development you never hit a CORS error
 */

import axios, { type AxiosResponse } from "axios";
import type {
  Team,
  PendingAction,
  DashboardStats,
  ActivityLogItem,
  WorkloadMember,
  TaskStatusEntry,
  SprintVelocityEntry,
  TimelineTask,
  UserRole,
} from "./types.ts";
import type { CostEntry } from "./components/charts/CostPerDeveloperChart";
import type { HoursEntry } from "./components/charts/HoursChart";
import type { SprintSummary } from "./components/charts/SprintCostSummary";

// ==========================================
// 1. AXIOS CONFIGURATION
// ==========================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "IN_REVIEW",
  "DONE",
] as const;
const COST_PER_HOUR = 24.04;

type RawAuthEnvelope = {
  user?: {
    userId?: string;
    name?: string;
    username?: string;
    email?: string;
    roles?: string[];
  };
  userId?: string;
  name?: string;
  username?: string;
  email?: string;
  roles?: string[];
  role?: string;
  currentTeamId?: string | null;
};

const isValidStatus = (value: string): value is Task["status"] =>
  STATUS_VALUES.includes(value as (typeof STATUS_VALUES)[number]);

const parseTaskStatus = (value: unknown): Task["status"] => {
  const normalized = String(value ?? "TODO").toUpperCase();
  return isValidStatus(normalized) ? normalized : "TODO";
};

const normalizeTask = (raw: unknown): Task => {
  const source = (raw ?? {}) as Record<string, unknown>;
  const responsibleSource = source.responsible as
    | string
    | { name?: string }
    | undefined;
  const responsible =
    typeof responsibleSource === "string"
      ? responsibleSource
      : responsibleSource?.name ?? "Unassigned";

  return {
    id: String(source.id ?? source.taskId ?? ""),
    title: String(source.title ?? "Untitled"),
    description: String(source.description ?? ""),
    startDate: source.startDate ? String(source.startDate) : null,
    dueDate: source.dueDate ? String(source.dueDate) : "",
    createdAt: source.createdAt ? String(source.createdAt) : "",
    updatedAt: source.updatedAt ? String(source.updatedAt) : undefined,
    completedAt: source.completedAt ? String(source.completedAt) : undefined,
    estimatedHours:
      source.estimatedHours == null ? undefined : Number(source.estimatedHours),
    actualHours: source.actualHours == null ? undefined : Number(source.actualHours),
    status: parseTaskStatus(source.status),
    responsible,
    priority: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(
      String(source.priority ?? "").toUpperCase(),
    )
      ? (String(source.priority).toUpperCase() as Task["priority"])
      : "MEDIUM",
    sprint:
      source.sprint && typeof source.sprint === "object"
        ? (source.sprint as Sprint)
        : undefined,
  };
};

const makeAxiosResponse = <T>(
  base: AxiosResponse<unknown>,
  data: T,
): AxiosResponse<T> => ({ ...base, data });

const extractArrayPayload = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    if (Array.isArray(source.data)) return source.data as T[];
    if (Array.isArray(source.items)) return source.items as T[];
    if (Array.isArray(source.content)) return source.content as T[];
    if (Array.isArray(source.results)) return source.results as T[];
  }
  return [];
};

const toRelativeTime = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const toSprintRank = (sprintLabel: string): number => {
  const numeric = Number(sprintLabel.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
};

const sortSprintLabels = (labels: string[]): string[] =>
  [...labels].sort((a, b) => {
    const rankA = toSprintRank(a);
    const rankB = toSprintRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

type HoursKpiRow = {
  developer_name?: string;
  sprint_name?: string;
  total_hours_worked?: number | string;
};

type TasksKpiRow = {
  sprint_name?: string;
  tasks_completed?: number | string;
};

const getLatestSprintFromHoursRows = (rows: HoursKpiRow[]): string | null => {
  const labels = rows
    .map((r) => String(r.sprint_name ?? "").trim())
    .filter(Boolean);
  if (labels.length === 0) return null;
  const sorted = sortSprintLabels([...new Set(labels)]);
  return sorted[sorted.length - 1] ?? null;
};

const normalizeAuthUser = (payload: RawAuthEnvelope) => {
  const base = payload.user ?? payload;
  const roles = base.roles ?? (payload.role ? [payload.role] : []);
  const allowedRoles: UserRole[] = ["ADMIN", "MANAGER", "DEVELOPER"];
  const normalizedRoles = roles.map((r) => r.replace(/^ROLE_/, "").toUpperCase());
  const role =
    (normalizedRoles.find((r) => allowedRoles.includes(r as UserRole)) as UserRole | undefined) ??
    "DEVELOPER";

  return {
    userId: String(base.userId ?? ""),
    username: String(base.username ?? base.name ?? base.email ?? "User"),
    email: String(base.email ?? ""),
    role,
    currentTeamId: payload.currentTeamId ?? null,
  };
};

const buildPendingActionsFromTasks = (tasks: Task[]): PendingAction[] => {
  const now = Date.now();

  const highPriorityActions = tasks
    .filter((task) => {
      const dueTs = task.dueDate ? new Date(task.dueDate).getTime() : Number.NaN;
      const isOverdue = Number.isFinite(dueTs) && dueTs < now && task.status !== "DONE";
      return task.status === "BLOCKED" || task.status === "IN_REVIEW" || isOverdue;
    })
    .slice(0, 15)
    .map((task) => {
      if (task.status === "BLOCKED") {
        return {
          id: task.id,
          title: task.title,
          responsible: task.responsible,
          message: "Blocked task requires escalation.",
          action: "Escalate",
        };
      }
      if (task.status === "IN_REVIEW") {
        return {
          id: task.id,
          title: task.title,
          responsible: task.responsible,
          message: "Waiting for review.",
          action: "Review",
        };
      }
      return {
        id: task.id,
        title: task.title,
        responsible: task.responsible,
        message: "Task is overdue.",
        action: "Follow up",
      };
    });

  if (highPriorityActions.length > 0) {
    return highPriorityActions;
  }

  return tasks
    .filter((task) => task.status !== "DONE")
    .slice(0, 15)
    .map((task) => ({
      id: task.id,
      title: task.title,
      responsible: task.responsible,
      message: `Task is ${task.status.toLowerCase().replace("_", " ")}.`,
      action: task.status === "TODO" ? "Start" : "Update",
    }));
};

const buildRecentActivityFromTasks = (tasks: Task[], limit: number): ActivityLogItem[] =>
  tasks
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    )
    .slice(0, limit)
    .map((task, idx) => {
      const taskDate = new Date(task.updatedAt ?? task.createdAt ?? Date.now());
      return {
        id: task.id || String(idx),
        date: taskDate.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        actor: task.responsible,
        action: `Task ${task.title}`,
        status: task.status,
        time: toRelativeTime(taskDate),
      };
    });

/*
 * auth endpoints
 */
export const authAPI = {
  getMe: async (token: string) => {
    const response = await api.get<RawAuthEnvelope>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return makeAxiosResponse(response, normalizeAuthUser(response.data));
  },
};

/*
 * tasks (ToDoItem) endpoints
 */
export const _tasksAPI = {
  /*
   * fetch all tasks visible to the current user (filtered by team if provided)
   */
  getAll: (
    params?: Record<string, string | number>,
  ): Promise<AxiosResponse<Task[]>> => api.get("/tasks", { params }),
  /*
   * fetch a single task by ID
   */
  getById: (id: string): Promise<AxiosResponse<Task>> =>
    api.get(`/tasks/${id}`),

  /*
   * create a new task
   * ADMIN/MANAGER only
   */
  create: (task: NewTaskPayload): Promise<AxiosResponse<Task>> =>
    api.post("/tasks", task),

  /*
   * update task fields (status, description, etc.)
   * developer can only update their own
   */
  update: (
    id: string,
    updates: Partial<NewTaskPayload>,
  ): Promise<AxiosResponse<Task>> => api.put(`/tasks/${id}`, updates),

  /*
   * delete a task
   * ADMIN/MANAGER only .
   */
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/tasks/${id}`),

  /*
    * transition task status:
      (TODO → IN_PROGRESS → BLOCKED → IN_REVIEW → DONE)
    */
  updateStatus: (
    id: string,
    status: Task["status"],
  ): Promise<AxiosResponse<Task>> =>
    api.patch(`/tasks/${id}/status`, { status }),
};

/*
 * dashboard / KPI endpoints
 */
export const dashboardAPI = {
  /*
   * pending actions list: blocked, overdue, stale PRs
   */
  getPendingActions: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<PendingAction[]>> => {
    try {
      const response = await api.get("/dashboard/pending-actions", { params: { teamId } });
      const rows = extractArrayPayload<PendingAction>(response.data);
      if (rows.length > 0) {
        return makeAxiosResponse(response, rows);
      }

      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      return makeAxiosResponse(tasksRes, buildPendingActionsFromTasks(tasks));
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      return makeAxiosResponse(tasksRes, buildPendingActionsFromTasks(tasks));
    }
  },

  /*
   * summary stats (completed/updated/created/due-soon counts)
   */
  getStats: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<DashboardStats>> => {
    try {
      return await api.get("/dashboard/stats", { params: { teamId } });
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const now = Date.now();
      const in7Days = now + 7 * 24 * 60 * 60 * 1000;
      const aWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const stats: DashboardStats = {
        completed: tasks.filter((t) => t.status === "DONE").length,
        updated: tasks.filter((t) => t.status !== "TODO" && t.status !== "DONE").length,
        created: tasks.filter((t) => {
          const createdTs = t.createdAt ? new Date(t.createdAt).getTime() : Number.NaN;
          return Number.isFinite(createdTs) && createdTs >= aWeekAgo;
        }).length,
        dueSoon: tasks.filter((t) => {
          const dueTs = t.dueDate ? new Date(t.dueDate).getTime() : Number.NaN;
          return Number.isFinite(dueTs) && dueTs >= now && dueTs <= in7Days && t.status !== "DONE";
        }).length,
      };

      return makeAxiosResponse(tasksRes, stats);
    }
  },

  /*
   * recent activity feed from Activity_Logs and GitHub webhooks
   */
  getRecentActivity: async (
    teamId?: string | null,
    limit = 20,
  ): Promise<AxiosResponse<ActivityLogItem[]>> => {
    try {
      const response = await api.get<Array<Record<string, unknown>>>(
        "/dashboard/activity",
        { params: { teamId, limit } },
      );

      const rows = extractArrayPayload<Record<string, unknown>>(response.data);
      const mapped = rows.map((row, index) => {
        const timestamp = row.timestamp ? new Date(String(row.timestamp)) : new Date();
        const fieldName = String(row.fieldName ?? "task");
        const oldValue = row.oldValue ? String(row.oldValue) : "";
        const newValue = row.newValue ? String(row.newValue) : "";
        const status = isValidStatus(newValue.toUpperCase())
          ? (newValue.toUpperCase() as Task["status"])
          : undefined;
        return {
          id: String(row.id ?? index),
          date: timestamp.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          actor: "System",
          action: oldValue
            ? `${fieldName} changed from ${oldValue} to ${newValue}`
            : `${fieldName} changed to ${newValue}`,
          status,
          time: toRelativeTime(timestamp),
        };
      });

      if (mapped.length > 0) {
        return makeAxiosResponse(response, mapped);
      }

      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      return makeAxiosResponse(tasksRes, buildRecentActivityFromTasks(tasks, limit));
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      return makeAxiosResponse(tasksRes, buildRecentActivityFromTasks(tasks, limit));
    }
  },

  /*
   * team workload: work distribution % per developer
   */
  getWorkload: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<WorkloadMember[]>> => {
    try {
      return await api.get("/dashboard/workload", { params: { teamId } });
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const totals = new Map<string, number>();

      tasks.forEach((task) => {
        const weight = task.actualHours ?? task.estimatedHours ?? 1;
        totals.set(task.responsible, (totals.get(task.responsible) ?? 0) + weight);
      });

      const overall = [...totals.values()].reduce((acc, value) => acc + value, 0) || 1;
      const workload = [...totals.entries()]
        .map(([name, value]) => ({ name, pct: Math.round((value / overall) * 100) }))
        .sort((a, b) => b.pct - a.pct);

      return makeAxiosResponse(tasksRes, workload);
    }
  },

  /*
   * task status breakdown for the bar chart
   */
  getTaskStatusSummary: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<TaskStatusEntry[]>> => {
    try {
      const response = await api.get("/dashboard/task-status", { params: { teamId } });
      const rows = extractArrayPayload<TaskStatusEntry>(response.data);
      return makeAxiosResponse(response, rows);
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data;

      const byDev = new Map<string, TaskStatusEntry>();
      tasks.forEach((rawTask) => {
        const task = normalizeTask(rawTask);
        const source = rawTask as unknown as Record<string, unknown>;
        const devKey = task.responsible || "Unassigned";
        const userId = String(source.responsibleId ?? devKey);

        if (!byDev.has(devKey)) {
          byDev.set(devKey, {
            developer: devKey,
            userId,
            todo: 0,
            inProgress: 0,
            inReview: 0,
            blocked: 0,
            done: 0,
          });
        }

        const entry = byDev.get(devKey)!;
        if (task.status === "TODO") entry.todo += 1;
        if (task.status === "IN_PROGRESS") entry.inProgress += 1;
        if (task.status === "IN_REVIEW") entry.inReview += 1;
        if (task.status === "BLOCKED") entry.blocked += 1;
        if (task.status === "DONE") entry.done += 1;
      });

      return makeAxiosResponse(tasksRes, [...byDev.values()]);
    }
  },

  /*
   * sprint velocity, estimated vs actual per iteration
   */
  getSprintVelocity: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> => {
    try {
      const response = await api.get("/dashboard/sprint-velocity", { params: { teamId } });
      const rows = extractArrayPayload<SprintVelocityEntry>(response.data);
      return makeAxiosResponse(response, rows);
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const bySprint = new Map<string, { estimated: number; actual: number }>();

      tasks.forEach((task) => {
        const sprintName = String(task.sprint?.sprintName ?? "Backlog");
        if (!bySprint.has(sprintName)) {
          bySprint.set(sprintName, { estimated: 0, actual: 0 });
        }
        const aggregate = bySprint.get(sprintName)!;
        aggregate.estimated += task.estimatedHours ?? 0;
        aggregate.actual += task.actualHours ?? (task.status === "DONE" ? task.estimatedHours ?? 0 : 0);
      });

      const velocity = [...bySprint.entries()].map(([name, values], idx) => ({
        iteration: idx + 1,
        estimated: Number(values.estimated.toFixed(2)),
        actual: Number(values.actual.toFixed(2)),
        sprintName: name,
      }));

      return makeAxiosResponse(
        tasksRes,
        velocity as unknown as SprintVelocityEntry[],
      );
    }
  },

  /*
   * due-date distribution and early vs late completion
   */
  getDueDateDistribution: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> => {
    try {
      return await api.get("/dashboard/due-date-distribution", { params: { teamId } });
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const byWeek = new Map<string, { due: number; completed: number }>();

      tasks.forEach((task) => {
        if (!task.dueDate) return;
        const due = new Date(task.dueDate);
        if (Number.isNaN(due.getTime())) return;
        const weekKey = `${due.getUTCFullYear()}-${String(due.getUTCMonth() + 1).padStart(2, "0")}`;
        if (!byWeek.has(weekKey)) {
          byWeek.set(weekKey, { due: 0, completed: 0 });
        }
        const bucket = byWeek.get(weekKey)!;
        bucket.due += 1;
        if (task.status === "DONE") bucket.completed += 1;
      });

      const distribution = [...byWeek.entries()].map(([_, value], idx) => ({
        iteration: idx + 1,
        estimated: value.due,
        actual: value.completed,
      }));

      return makeAxiosResponse(tasksRes, distribution);
    }
  },

  getHoursPerDeveloper: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<HoursEntry[]>> => {
    try {
      const response = await api.get<HoursKpiRow[]>("/dashboard/kpis/hours-per-sprint", {
        params: { teamId },
      });
      const rows = extractArrayPayload<HoursKpiRow>(response.data);
      const latestSprint = getLatestSprintFromHoursRows(rows);

      const byDeveloper = new Map<string, number>();
      rows.forEach((row) => {
        const sprint = String(row.sprint_name ?? "").trim();
        if (!latestSprint || sprint !== latestSprint) return;
        const developer = String(row.developer_name ?? "Unassigned").trim() || "Unassigned";
        const hours = Number(row.total_hours_worked ?? 0);
        byDeveloper.set(developer, (byDeveloper.get(developer) ?? 0) + (Number.isFinite(hours) ? hours : 0));
      });

      const data: HoursEntry[] = [...byDeveloper.entries()].map(([developer, actual]) => ({
        developer,
        estimated: Number(actual.toFixed(2)),
        actual: Number(actual.toFixed(2)),
      }));

      return makeAxiosResponse(response, data);
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const latestSprint = sortSprintLabels(
        [...new Set(tasks.map((t) => String(t.sprint?.sprintName ?? "Backlog")))],
      ).at(-1);

      const byDeveloper = new Map<string, { estimated: number; actual: number }>();
      tasks.forEach((task) => {
        const sprint = String(task.sprint?.sprintName ?? "Backlog");
        if (latestSprint && sprint !== latestSprint) return;
        const developer = task.responsible || "Unassigned";
        if (!byDeveloper.has(developer)) {
          byDeveloper.set(developer, { estimated: 0, actual: 0 });
        }
        const aggregate = byDeveloper.get(developer)!;
        aggregate.estimated += task.estimatedHours ?? 0;
        aggregate.actual += task.actualHours ?? task.estimatedHours ?? 0;
      });

      const data: HoursEntry[] = [...byDeveloper.entries()].map(([developer, value]) => ({
        developer,
        estimated: Number(value.estimated.toFixed(2)),
        actual: Number(value.actual.toFixed(2)),
      }));

      return makeAxiosResponse(tasksRes, data);
    }
  },

  getCostPerDeveloper: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<CostEntry[]>> => {
    try {
      const response = await api.get<HoursKpiRow[]>("/dashboard/kpis/hours-per-sprint", {
        params: { teamId },
      });
      const rows = extractArrayPayload<HoursKpiRow>(response.data);
      const sprintLabels = sortSprintLabels(
        [...new Set(rows.map((r) => String(r.sprint_name ?? "").trim()).filter(Boolean))],
      );

      const byDeveloper = new Map<string, CostEntry>();
      rows.forEach((row) => {
        const developer = String(row.developer_name ?? "Unassigned").trim() || "Unassigned";
        const sprint = String(row.sprint_name ?? "Backlog").trim() || "Backlog";
        const hours = Number(row.total_hours_worked ?? 0);
        const cost = Number((Math.max(0, Number.isFinite(hours) ? hours : 0) * COST_PER_HOUR).toFixed(2));
        if (!byDeveloper.has(developer)) {
          byDeveloper.set(developer, { developer });
        }
        byDeveloper.get(developer)![sprint] = cost;
      });

      const data = [...byDeveloper.values()].map((entry) => {
        const filled: CostEntry = { developer: entry.developer };
        sprintLabels.forEach((label) => {
          filled[label] = Number(entry[label] ?? 0);
        });
        return filled;
      });

      return makeAxiosResponse(response, data);
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const byDeveloper = new Map<string, CostEntry>();
      const sprintLabels = sortSprintLabels(
        [...new Set(tasks.map((t) => String(t.sprint?.sprintName ?? "Backlog")))],
      );

      tasks.forEach((task) => {
        const developer = task.responsible || "Unassigned";
        const sprint = String(task.sprint?.sprintName ?? "Backlog");
        const cost = Number(((task.actualHours ?? task.estimatedHours ?? 0) * COST_PER_HOUR).toFixed(2));
        if (!byDeveloper.has(developer)) {
          byDeveloper.set(developer, { developer });
        }
        const current = Number(byDeveloper.get(developer)![sprint] ?? 0);
        byDeveloper.get(developer)![sprint] = Number((current + cost).toFixed(2));
      });

      const data = [...byDeveloper.values()].map((entry) => {
        const filled: CostEntry = { developer: entry.developer };
        sprintLabels.forEach((label) => {
          filled[label] = Number(entry[label] ?? 0);
        });
        return filled;
      });

      return makeAxiosResponse(tasksRes, data);
    }
  },

  getSprintSummaries: async (
    teamId?: string | null,
  ): Promise<AxiosResponse<SprintSummary[]>> => {
    try {
      const [hoursResponse, tasksResponse] = await Promise.all([
        api.get<HoursKpiRow[]>("/dashboard/kpis/hours-per-sprint", { params: { teamId } }),
        api.get<TasksKpiRow[]>("/dashboard/kpis/tasks-per-sprint", { params: { teamId } }),
      ]);

      const hoursRows = extractArrayPayload<HoursKpiRow>(hoursResponse.data);
      const tasksRows = extractArrayPayload<TasksKpiRow>(tasksResponse.data);
      const bySprint = new Map<string, { totalHours: number; tasksCompleted: number }>();

      hoursRows.forEach((row) => {
        const sprint = String(row.sprint_name ?? "Backlog").trim() || "Backlog";
        const hours = Number(row.total_hours_worked ?? 0);
        if (!bySprint.has(sprint)) {
          bySprint.set(sprint, { totalHours: 0, tasksCompleted: 0 });
        }
        bySprint.get(sprint)!.totalHours += Number.isFinite(hours) ? hours : 0;
      });

      tasksRows.forEach((row) => {
        const sprint = String(row.sprint_name ?? "Backlog").trim() || "Backlog";
        const completed = Number(row.tasks_completed ?? 0);
        if (!bySprint.has(sprint)) {
          bySprint.set(sprint, { totalHours: 0, tasksCompleted: 0 });
        }
        bySprint.get(sprint)!.tasksCompleted += Number.isFinite(completed) ? completed : 0;
      });

      const data: SprintSummary[] = sortSprintLabels([...bySprint.keys()]).map((sprint) => {
        const value = bySprint.get(sprint)!;
        return {
          label: sprint,
          totalHours: Number(value.totalHours.toFixed(2)),
          totalCost: Number((value.totalHours * COST_PER_HOUR).toFixed(2)),
          tasksCompleted: value.tasksCompleted,
        };
      });

      return makeAxiosResponse(hoursResponse, data);
    } catch {
      const tasksRes = await _tasksAPI.getAll(teamId ? { teamId } : undefined);
      const tasks = tasksRes.data.map(normalizeTask);
      const bySprint = new Map<string, { totalHours: number; tasksCompleted: number }>();

      tasks.forEach((task) => {
        const sprint = String(task.sprint?.sprintName ?? "Backlog");
        if (!bySprint.has(sprint)) {
          bySprint.set(sprint, { totalHours: 0, tasksCompleted: 0 });
        }
        const aggregate = bySprint.get(sprint)!;
        aggregate.totalHours += task.actualHours ?? task.estimatedHours ?? 0;
        if (task.status === "DONE") {
          aggregate.tasksCompleted += 1;
        }
      });

      const data: SprintSummary[] = sortSprintLabels([...bySprint.keys()]).map((sprint) => {
        const value = bySprint.get(sprint)!;
        return {
          label: sprint,
          totalHours: Number(value.totalHours.toFixed(2)),
          totalCost: Number((value.totalHours * COST_PER_HOUR).toFixed(2)),
          tasksCompleted: value.tasksCompleted,
        };
      });

      return makeAxiosResponse(tasksRes, data);
    }
  },
};

/*
 * teams endpoints
 */
export const teamsAPI = {
  getAll: (): Promise<AxiosResponse<Team[]>> => api.get("/teams"),

  create: (name: string): Promise<AxiosResponse<Team>> =>
    api.post("/teams", { name }),

  rename: (teamId: string, name: string): Promise<AxiosResponse<Team>> =>
    api.put(`/teams/${teamId}`, { name }),

  delete: (teamId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/teams/${teamId}`),

  addMember: (teamId: string, userId: string): Promise<AxiosResponse<void>> =>
    api.post(`/teams/${teamId}/members`, { userId }),

  searchUsers: (query: string): Promise<AxiosResponse<User[]>> =>
    api.get("/users/search", { params: { query } }),
};

/*
 * timeline (Gantt data) endpoint
 */
export const timelineAPI = {
  getTasks: (
    teamId?: string | null,
    params?: Record<string, string>,
  ): Promise<AxiosResponse<TimelineTask[]>> =>
    api.get("/tasks", { params: { teamId, ...params } }),
};
// ==========================================
// TYPE DEFINITIONS (Inlined)
// ==========================================
export interface User {
  userId: number;
  name: string;
  email: string;
}

export interface Sprint {
  sprintId: number;
  sprintName: string;
  startDate: string;
  endDate: string;
}

export interface Task {
  id: string; // Changed from taskId: number
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt?: string; // Optional
  completedAt?: string; // Optional
  estimatedHours?: number; // Optional
  actualHours?: number; // Optional
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "DONE";
  creator?: User; // Optional
  responsible: string; // Changed from User object to string
  manager?: User; // Optional
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sprint?: Sprint; // Optional
}

// Using Partial<Task> so you can pass only the fields you need when creating/updating
export type NewTaskPayload = Partial<Task>;
// ==========================================
// TASKS API (Native Fetch)
// ==========================================
export const tasksAPI = {
  /*
   * fetch all tasks visible to the current user
   */
  getAll: async (params?: Record<string, string | number>): Promise<Task[]> => {
    const url = new URL(`${BASE_URL}/tasks`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      throw new Error(`Error fetching tasks: ${response.statusText}`);
    return response.json();
  },

  /*
   * fetch a single task by ID
   */
  getById: async (id: string | number): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      throw new Error(`Error fetching task ${id}: ${response.statusText}`);
    return response.json();
  },

  /*
   * create a new task
   */
  create: async (task: NewTaskPayload): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok)
      throw new Error(`Error creating task: ${response.statusText}`);
    return response.json();
  },

  /*
   * update task fields
   */
  update: async (
    id: string | number,
    updates: NewTaskPayload,
  ): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok)
      throw new Error(`Error updating task ${id}: ${response.statusText}`);
    return response.json();
  },

  /*
   * delete a task
   */
  delete: async (id: string | number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok)
      throw new Error(`Error deleting task ${id}: ${response.statusText}`);
  },

  /*
   * transition task status
   */
  updateStatus: async (
    id: string | number,
    status: Task["status"],
  ): Promise<Task> => {
    const response = await fetch(`${BASE_URL}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // Note: If your backend expects {"status": "IN_PROGRESS"} for the patch, use this:
      body: JSON.stringify({ status }),
    });

    if (!response.ok)
      throw new Error(
        `Error updating status for task ${id}: ${response.statusText}`,
      );
    return response.json();
  },
};
// END NEW CHANGES LOL
export default api;

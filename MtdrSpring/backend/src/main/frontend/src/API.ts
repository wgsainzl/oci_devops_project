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
} from "./types.ts";

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
/*
 * auth endpoints
 */
export const authAPI = {
  getMe: async (token: string) => {
    return axios.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
  getPendingActions: (
    teamId?: string | null,
  ): Promise<AxiosResponse<PendingAction[]>> =>
    api.get("/dashboard/pending-actions", { params: { teamId } }),

  /*
   * summary stats (completed/updated/created/due-soon counts)
   */
  getStats: (teamId?: string | null): Promise<AxiosResponse<DashboardStats>> =>
    api.get("/dashboard/stats", { params: { teamId } }),

  /*
   * recent activity feed from Activity_Logs and GitHub webhooks
   */
  getRecentActivity: (
    teamId?: string | null,
    limit = 20,
  ): Promise<AxiosResponse<ActivityLogItem[]>> =>
    api.get("/dashboard/activity", { params: { teamId, limit } }),

  /*
   * team workload: work distribution % per developer
   */
  getWorkload: (
    teamId?: string | null,
  ): Promise<AxiosResponse<WorkloadMember[]>> =>
    api.get("/dashboard/workload", { params: { teamId } }),

  /*
   * task status breakdown for the bar chart
   */
  getTaskStatusSummary: (
    teamId?: string | null,
  ): Promise<AxiosResponse<TaskStatusEntry[]>> =>
    api.get("/dashboard/task-status", { params: { teamId } }),

  /*
   * sprint velocity, estimated vs actual per iteration
   */
  getSprintVelocity: (
    teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> =>
    api.get("/dashboard/sprint-velocity", { params: { teamId } }),

  /*
   * due-date distribution and early vs late completion
   */
  getDueDateDistribution: (
    teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> =>
    api.get("/dashboard/due-date-distribution", { params: { teamId } }),
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
    api.get("/timeline", { params: { teamId, ...params } }),
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

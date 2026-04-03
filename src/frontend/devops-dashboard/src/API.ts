/**
 * central API layer for frontend
 * all communication with spring boot backend goes here
 
 * base URL is read from the VITE_API_BASE_URL environment variable so
   the same build artifact can point at different environments (dev,
   staging, prod) without a code change, just swap the .env file
 
 * the vite dev server proxies /api → localhost:8080 (on vite.config.js),
   so during development you never hit a CORS error
 */

import axios, { type AxiosResponse } from 'axios'
import type {
  SignInResponse,
  VerifyResponse,
  User,
  Task,
  NewTaskPayload,
  Team,
  PendingAction,
  DashboardStats,
  ActivityLogItem,
  WorkloadMember,
  TaskStatusEntry,
  SprintVelocityEntry,
  TimelineTask,
  RegisterFormData,
} from './types'
/* 
 axios instance
*/ 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/* 
 * request interceptor attach Bearer token from localStorage if is present
   (Spring Security will also validate session cookie; the token is for
   the API Gateway layer in production)
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* 
* response interceptor
*/ 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/* 
* auth endpoints
*/
export const authAPI = {
  /**
   * submit email, get back a 2FA challenge token
   */
  signIn: (email: string, password: string): Promise<AxiosResponse<SignInResponse>> =>
    api.post('/auth/signin', { email, password }),

  /**
   * submit 2FA code and challenge token.
   * on success, backend sets a session cookie and returns the user object
   */
  verify2FA: (challengeToken: string, code: string): Promise<AxiosResponse<VerifyResponse>> =>
    api.post('/auth/verify-2fa', { challengeToken, code }),

  /**
   * create a new Oracle account (public endpoint, no auth required).
   */
  createAccount: (data: RegisterFormData): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/register', data),

  signOut: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/signout'),
}

/* 
* tasks (ToDoItem) endpoints
*/
export const tasksAPI = {
  /*
  * fetch all tasks visible to the current user (filtered by team if provided) 
  */
  getAll: (params?: Record<string, string | number>): Promise<AxiosResponse<Task[]>> =>
    api.get('/tasks', { params }),
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
    api.post('/tasks', task),

  /*
  * update task fields (status, description, etc.)  
  * developer can only update their own 
  */
  update: (id: string, updates: Partial<NewTaskPayload>): Promise<AxiosResponse<Task>> =>
    api.put(`/tasks/${id}`, updates),

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
  updateStatus: (id: string, status: Task['status']): Promise<AxiosResponse<Task>> =>
    api.patch(`/tasks/${id}/status`, { status }),
}

/* 
* dashboard / KPI endpoints
*/
export const dashboardAPI = {
  /*
  * pending actions list: blocked, overdue, stale PRs 
  */
  getPendingActions: (teamId?: string | null): Promise<AxiosResponse<PendingAction[]>> =>
    api.get('/dashboard/pending-actions', { params: { teamId } }),

  /*
  * summary stats (completed/updated/created/due-soon counts) 
  */
  getStats: (teamId?: string | null): Promise<AxiosResponse<DashboardStats>> =>
    api.get('/dashboard/stats', { params: { teamId } }),

  /*
  * recent activity feed from Activity_Logs and GitHub webhooks  
  */
  getRecentActivity: (
    teamId?: string | null,
    limit = 20,
  ): Promise<AxiosResponse<ActivityLogItem[]>> =>
    api.get('/dashboard/activity', { params: { teamId, limit } }),
  
  /*
  * team workload: work distribution % per developer
  */
  getWorkload: (teamId?: string | null): Promise<AxiosResponse<WorkloadMember[]>> =>
    api.get('/dashboard/workload', { params: { teamId } }),

  /*
  * task status breakdown for the bar chart 
  */
  getTaskStatusSummary: (teamId?: string | null): Promise<AxiosResponse<TaskStatusEntry[]>> =>
    api.get('/dashboard/task-status', { params: { teamId } }),

  /*
  * sprint velocity, estimated vs actual per iteration 
  */
  getSprintVelocity: (teamId?: string | null): Promise<AxiosResponse<SprintVelocityEntry[]>> =>
    api.get('/dashboard/sprint-velocity', { params: { teamId } }),

  /*
  * due-date distribution and early vs late completion
  */
  getDueDateDistribution: (teamId?: string | null): Promise<AxiosResponse<SprintVelocityEntry[]>> =>
    api.get('/dashboard/due-date-distribution', { params: { teamId } }),
}

/*
* teams endpoints
*/
export const teamsAPI = {
  getAll: (): Promise<AxiosResponse<Team[]>> =>
    api.get('/teams'),

  create: (name: string): Promise<AxiosResponse<Team>> =>
    api.post('/teams', { name }),

  rename: (teamId: string, name: string): Promise<AxiosResponse<Team>> =>
    api.put(`/teams/${teamId}`, { name }),

  delete: (teamId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/teams/${teamId}`),

  addMember: (teamId: string, userId: string): Promise<AxiosResponse<void>> =>
    api.post(`/teams/${teamId}/members`, { userId }),

  searchUsers: (query: string): Promise<AxiosResponse<User[]>> =>
    api.get('/users/search', { params: { query } }),
}

/*
* timeline (Gantt data) endpoint
*/ 
export const timelineAPI = {
  getTasks: (
    teamId?: string | null,
    params?: Record<string, string>,
  ): Promise<AxiosResponse<TimelineTask[]>> =>
    api.get('/timeline', { params: { teamId, ...params } }),
}

export default api
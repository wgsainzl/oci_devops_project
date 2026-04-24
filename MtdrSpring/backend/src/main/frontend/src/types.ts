/**
 * shared domain types for the frontend.
 
 * leave this file as the single source of truth for all data shapes
   that cross component/page boundaries.
 */

// auth & users
export type UserRole = "ADMIN" | "MANAGER" | "DEVELOPER";

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  currentTeamId?: string | null;
}

/*
 * returned by POST /auth/signin when 2FA required
 */
export interface SignInChallengeResponse {
  challengeToken: string;
}

/*
 * returned by POST /auth/signin when 2FA disabled (dev)
 */
export interface SignInDirectResponse {
  user: User;
  token?: string;
}

export type SignInResponse = SignInChallengeResponse | SignInDirectResponse;

/*
 * returned by POST /auth/verify-2fa
 */
export interface VerifyResponse {
  user: User;
  token?: string;
}

// tasks / toDoItem
export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskType = "FEATURE" | "BUG";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  createdAt: string; //
  dueDate?: string; //
  startDate?: string; // used for Gantt bar start
  assignedDevId?: string;
  responsible?: string; // display name denormalized for convenience
}

export interface NewTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedDevId?: string;
  dueDate?: string;
}

// teams
export interface Team {
  id: string;
  name: string;
  memberCount?: number;
}

// dashboard
export interface PendingAction {
  id: string;
  title: string;
  responsible: string;
  message: string;
  action: string; // recommended action label
}

export interface DashboardStats {
  completed: number;
  updated: number;
  created: number;
  dueSoon: number;
  dueNext7?: number;
}

export interface ActivityLogItem {
  id: string | number;
  date: string; // display date (string)
  actor: string;
  action: string;
  status?: TaskStatus;
  time: string; // relative time
}

export interface WorkloadMember {
  name: string;
  pct: number; // 0 - 100
}

export interface TaskStatusEntry {
  developer: string;
  userId: string;
  todo: number;
  inProgress: number;
  inReview: number;
  blocked: number;
  done: number;
}

export interface SprintVelocityEntry {
  iteration: number;
  estimated: number;
  actual: number;
}

// timeline
export interface TimelineTask extends Task {
  startDate: string; // required for Gantt
}

// forms
export interface RegisterFormData {
  email: string;
  password: string;
  confirm: string;
  country: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

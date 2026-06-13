export type UserRole = 'manager' | 'developer';

export interface E2EUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  teamId: number;
}

export interface E2ETask {
  taskId: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  sprintId: number;
  responsibleId: number;
  responsibleName: string;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  testingTasks: number;
  overdueTasks: number;
}

export const API = {
  tasks: '**/api/tasks**',
  users: '**/api/users**',
  dashboard: '**/api/dashboard/**',
  semanticSearch: '**/api/ai/tasks/semantic-search',
  authMe: '**/api/**/me',
  oauthStart: '**/oauth2/authorization/oci',
};

export const USERS = {
  manager: {
    id: 21,
    name: 'Juan Villalobos',
    email: 'manager@test.local',
    role: 'manager',
    teamId: 1,
  } satisfies E2EUser,

  developer: {
    id: 22,
    name: 'Guillermo Sainz',
    email: 'developer@test.local',
    role: 'developer',
    teamId: 1,
  } satisfies E2EUser,
};

export const TASKS: E2ETask[] = [
  {
    taskId: 132,
    title: 'Unit, component and security testing',
    description: 'Designed testing plan to test our code',
    status: 'DONE',
    priority: 'HIGH',
    sprintId: 24,
    responsibleId: 22,
    responsibleName: 'Guillermo Sainz',
    estimatedHours: 9,
    actualHours: 8,
  },
  {
    taskId: 69,
    title: 'RBAC system admin',
    description: 'Security architecture',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    sprintId: 23,
    responsibleId: 21,
    responsibleName: 'Juan Villalobos',
    estimatedHours: 5,
    actualHours: null,
  },
  {
    taskId: 71,
    title: 'Sprint 2 Testing Fundamentals',
    description: 'Weekly module delivery',
    status: 'TESTING',
    priority: 'MEDIUM',
    sprintId: 23,
    responsibleId: 22,
    responsibleName: 'Guillermo Sainz',
    estimatedHours: 2,
    actualHours: 1,
  },
];

export const DASHBOARD_STATS: DashboardStats = {
  totalTasks: 3,
  completedTasks: 1,
  inProgressTasks: 1,
  testingTasks: 1,
  overdueTasks: 0,
};

export const TEST_TOKEN = 'fake-e2e-jwt-token';
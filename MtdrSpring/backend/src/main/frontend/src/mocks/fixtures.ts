// mock fixture data for development testing
import { SPRINT_STATS, SPRINT_TASK_STATUS, SPRINT_TIMELINE_TASKS, SPRINT_VELOCITY } from './sprintData'

export const mockUser = {
  id: 'user-mock-1',
  email: 'test@oracle.com',
  firstName: 'Test',
  lastName: 'Developer',
  role: 'MANAGER', // change user role for mocking
  currentTeamId: 'team-1',
}

export const mockUsers = [
  {
    userId: 'user-mock-1',
    username: 'Test Developer',
    email: 'test@oracle.com',
    role: 'MANAGER',
    currentTeamId: 'team-1',
  },
  {
    userId: 'user-mock-2',
    username: 'Maria Garcia',
    email: 'maria.garcia@oracle.com',
    role: 'DEVELOPER',
    currentTeamId: 'team-2',
  },
  {
    userId: 'user-mock-3',
    username: 'Carlos Lopez',
    email: 'carlos.lopez@oracle.com',
    role: 'DEVELOPER',
    currentTeamId: 'team-3',
  },
  {
    userId: 'user-mock-4',
    username: 'Ana Torres',
    email: 'ana.torres@oracle.com',
    role: 'ADMIN',
    currentTeamId: 'team-1',
  },
]

export const mockPendingActions = [
  {
    id: 'ORC-789',
    title: 'API Gateway Implementation',
    responsible: 'Mau & 1 other(s)',
    message: 'Pending PR Review — PR #42 has been open for 2 days.',
    action: 'Review PR',
  },
  {
    id: 'ORC-790',
    title: 'Database Migration',
    responsible: 'You',
    message: 'Ready for deployment — 3 environments pending.',
    action: 'Deploy',
  },
]

export const mockStats = SPRINT_STATS

export const mockActivity = [
  {
    id: 1,
    date: 'Sunday, March 1, 2026',
    actor: 'System (GitHub)',
    action: 'merged Pull Request #42 into main — API Gateway endpoint...',
    status: 'DONE',
    time: '10 minutes ago',
  },
  {
    id: 2,
    date: 'Saturday, February 28, 2026',
    actor: 'Guillermo Sainz L.',
    action: 'updated ORC-789 status to In Progress',
    status: 'IN_PROGRESS',
    time: '2 hours ago',
  },
  {
    id: 3,
    date: 'Friday, February 27, 2026',
    actor: 'You',
    action: 'created new task ORC-785: Refactor auth service',
    status: 'TO_DO',
    time: '1 day ago',
  },
]

export const mockWorkload = [
  { name: 'Guillermo Sáinz L...', pct: 30 },
  { name: 'María García', pct: 28 },
  { name: 'You', pct: 22 },
  { name: 'Carlos López', pct: 20 },
]

export const mockTaskStatus = SPRINT_TASK_STATUS

export const mockSprintVelocity = SPRINT_VELOCITY

export const mockTeams = [
  { id: 'team-1', name: 'Backend', memberCount: 5 },
  { id: 'team-2', name: 'Frontend', memberCount: 4 },
  { id: 'team-3', name: 'DevOps', memberCount: 3 },
]

export const mockTimelineTasks = SPRINT_TIMELINE_TASKS;

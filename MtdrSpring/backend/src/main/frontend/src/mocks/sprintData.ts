import type { DashboardStats, TaskStatusEntry, SprintVelocityEntry, TimelineTask } from '../types'
import type { CostEntry } from '../components/charts/CostPerDeveloperChart'
import type { HoursEntry } from '../components/charts/HoursChart'
import type { SprintSummary } from '../components/charts/SprintCostSummary'

// ── SPRINT VELOCITY ──
// Only showing Sprint 0 and Sprint 1
export const SPRINT_VELOCITY: SprintVelocityEntry[] = [
  { iteration: 0, estimated: 30, actual: 30 },
  { iteration: 1, estimated: 46.5, actual: 48.5 },
]

// ── SPRINT 1 (Current Active Sprint) ──
export const SPRINT_TASK_STATUS: TaskStatusEntry[] = [
  { developer: 'Guillermo',   userId: 'user-mock-1', todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 4 },
  { developer: 'Sebastián',   userId: 'user-mock-2', todo: 0, inProgress: 1, inReview: 0, blocked: 0, done: 4 },
  { developer: 'Mauricio',    userId: 'user-mock-3', todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 3 },
  { developer: 'Juan Manuel', userId: 'user-mock-4', todo: 0, inProgress: 3, inReview: 0, blocked: 0, done: 2 },
  { developer: 'Diego',       userId: 'user-mock-5', todo: 0, inProgress: 1, inReview: 0, blocked: 0, done: 1 },
]

export const SPRINT_HOURS: HoursEntry[] = [
  { developer: 'Guillermo',   estimated: 7.5,  actual: 5.0 },
  { developer: 'Sebastián',   estimated: 14.5, actual: 12.5 },
  { developer: 'Mauricio',    estimated: 5.5,  actual: 6.25 },
  { developer: 'Juan Manuel', estimated: 13.5, actual: 22.8 }, 
  { developer: 'Diego',       estimated: 8.5,  actual: 6.5 },
]

// ── SPRINT 0 (Historical Data) ──
const SPRINT_0_HOURS: Record<string, number> = {
  'Guillermo': 7,
  'Sebastián': 5,
  'Mauricio': 6,
  'Juan Manuel': 5,
  'Diego': 7,
}
const TOTAL_SPRINT_0_HOURS = 30
const TOTAL_SPRINT_0_COMPLETED_TASKS = 12

// ── Shared Calculations ──
export const COST_PER_HOUR = 24.04
const roundCurrency = (value: number): number => Math.round(value * 100) / 100

// Cost Chart
export const SPRINT_COST_PER_DEVELOPER: CostEntry[] = SPRINT_HOURS.map((entry) => ({
  developer: entry.developer,
  'Sprint 0': roundCurrency((SPRINT_0_HOURS[entry.developer] ?? 0) * COST_PER_HOUR),
  'Sprint 1': roundCurrency(entry.actual * COST_PER_HOUR),
}))

// Current Sprint Stats
const totals = SPRINT_TASK_STATUS.reduce(
  (acc, row) => {
    acc.todo += row.todo
    acc.inProgress += row.inProgress
    acc.inReview += row.inReview
    acc.blocked += row.blocked
    acc.done += row.done
    return acc
  },
  { todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 0 },
)

const totalTasks = totals.todo + totals.inProgress + totals.inReview + totals.blocked + totals.done
const remainingTasks = totals.todo + totals.inProgress + totals.inReview + totals.blocked

export const SPRINT_STATS: DashboardStats = {
  completed: totals.done,
  updated: totalTasks - totals.todo,
  created: totalTasks,
  dueSoon: remainingTasks,
  dueNext7: remainingTasks,
}

// Sprint Totals Chart
const totalActualHours = SPRINT_HOURS.reduce((acc, row) => acc + row.actual, 0)

export const SPRINT_SUMMARIES: SprintSummary[] = [
  {
    label: 'Sprint 0',
    totalCost: roundCurrency(TOTAL_SPRINT_0_HOURS * COST_PER_HOUR),
    totalHours: TOTAL_SPRINT_0_HOURS,
    tasksCompleted: TOTAL_SPRINT_0_COMPLETED_TASKS,
  },
  {
    label: 'Sprint 1',
    totalCost: roundCurrency(totalActualHours * COST_PER_HOUR),
    totalHours: roundCurrency(totalActualHours),
    tasksCompleted: totals.done,
  },
]

// ── MASSIVE TIMELINE DATA (ALL SPRINT 0 & SPRINT 1 TASKS) ──
export const SPRINT_TIMELINE_TASKS: TimelineTask[] = [
  // SPRINT 0 (Semana 5)
  { id: 'S0-M1', title: 'Delivery M1 Software Standards', responsible: 'Mauricio', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-01', dueDate: '2026-03-10' },
  { id: 'S0-M2', title: 'Delivery M2 Project Administration', responsible: 'Guillermo', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-01', dueDate: '2026-03-11' },
  { id: 'S0-M3', title: 'Delivery M3 Software Requirements', responsible: 'Diego', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-02', dueDate: '2026-03-11' },
  { id: 'S0-M4', title: 'Delivery M4 Software Quality', responsible: 'Guillermo', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-03', dueDate: '2026-03-12' },
  { id: 'S0-M5', title: 'Delivery M5 Design & Architecture', responsible: 'Mauricio', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-04', dueDate: '2026-03-11' },
  { id: 'S0-M6', title: 'Delivery M6 Advanced Web', responsible: 'Diego', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-05', dueDate: '2026-03-13' },
  { id: 'S0-M7', title: 'Delivery M7 Advanced Databases', responsible: 'Sebastián', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-06', dueDate: '2026-03-11' },
  { id: 'S0-M8', title: 'Delivery M8 Deployment & Closure', responsible: 'Juan Manuel', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-06', dueDate: '2026-03-11' },
  { id: 'S0-M9', title: 'Delivery M9 OCI/DevOps', responsible: 'Diego', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-08', dueDate: '2026-03-13' },
  { id: 'S0-M10', title: 'Delivery M10 Linux Support', responsible: 'Sebastián', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-08', dueDate: '2026-03-11' },
  { id: 'S0-M11', title: 'Delivery M11 Java Development', responsible: 'Juan Manuel', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-09', dueDate: '2026-03-11' },
  { id: 'S0-M12', title: 'Delivery M12 Challenge', responsible: 'Mauricio', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-10', dueDate: '2026-03-13' },
  { id: 'S0-OCI', title: 'OCI Foundations completed', responsible: 'Team', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-10', dueDate: '2026-03-13' },
  { id: 'S0-PLN', title: 'Sprint Planning', responsible: 'Team', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-11', dueDate: '2026-03-13' },
  { id: 'S0-KPI', title: 'Definir KPIs', responsible: 'Guillermo', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-01', startDate: '2026-03-08', dueDate: '2026-03-11' },

  // SPRINT 1
  { id: 'S1-M3', title: 'S1, M3 Software Requirements (Luis)', responsible: 'Guillermo', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-03-25', dueDate: '2026-04-10' },
  { id: 'S1-M7', title: 'S1, M7 Advanced Databases (Miguel)', responsible: 'Sebastián', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-03-26', dueDate: '2026-04-10' },
  { id: 'S1-M5', title: 'S1, M5 Design & Architecture (Paco)', responsible: 'Mauricio', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-03-28', dueDate: '2026-04-10' },
  { id: 'S1-M10', title: 'S1, M10 Linux Support (Ken)', responsible: 'Sebastián', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-04-01', dueDate: '2026-04-10' },
  { id: 'S1-M2', title: 'S1, M2 Project Administration (Israel)', responsible: 'Guillermo', status: 'DONE', priority: 'LOW', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-04-02', dueDate: '2026-04-10' },
  { id: 'S1-M11', title: 'S1, M11 Java Development (Axel)', responsible: 'Juan Manuel', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-04-03', dueDate: '2026-04-10' },
  { id: 'S1-CH', title: 'S1, M12 Challenge (Ken)', responsible: 'Team', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-20', startDate: '2026-04-05', dueDate: '2026-04-10' },
  { id: 'S1-DB', title: 'Conectar Microservicios a DB', responsible: 'Mauricio', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-03-25', startDate: '2026-04-01', dueDate: '2026-04-12' },
  { id: 'S1-WEB', title: 'Develop Web Page', responsible: 'Sebastián, Diego', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-25', startDate: '2026-03-26', dueDate: '2026-04-07' },
  { id: 'S1-KPI1', title: 'Revisar KPIs', responsible: 'Guillermo', status: 'DONE', priority: 'MEDIUM', type: 'FEATURE', createdAt: '2026-03-28', startDate: '2026-04-02', dueDate: '2026-04-08' },
  { id: 'S1-KPI2', title: 'Actualización de nuevos KPIs en Web', responsible: 'Diego', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-03-28', startDate: '2026-04-04', dueDate: '2026-04-09' },
  { id: 'S1-REV', title: 'Revisar y corregir sistemas', responsible: 'Mauricio, Juan', status: 'DONE', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-04-01', startDate: '2026-04-02', dueDate: '2026-04-09' },
  { id: 'S1-AUTH', title: 'Auth implementation', responsible: 'Juan Manuel', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-04-01', startDate: '2026-04-05', dueDate: '2026-04-09' },
  { id: 'S1-JIRA', title: 'Update Jira', responsible: 'Guillermo', status: 'DONE', priority: 'LOW', type: 'FEATURE', createdAt: '2026-04-05', startDate: '2026-04-08', dueDate: '2026-04-10' },
  { id: 'S1-2FA', title: '2FA log in (authorized user)', responsible: 'Juan Manuel', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-04-05', startDate: '2026-04-06', dueDate: '2026-04-10' },
  { id: 'S1-GRAF', title: 'Gráfica de trabajo estimado', responsible: 'Sebastián', status: 'DONE', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-04-05', startDate: '2026-04-06', dueDate: '2026-04-10' },
  { id: 'S1-SW', title: 'Switch between teams metrics', responsible: 'Sebastián', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', createdAt: '2026-04-05', startDate: '2026-04-07', dueDate: '2026-04-10' },
  { id: 'S1-RBAC', title: 'RBAC (system admin)', responsible: 'Juan Manuel', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'FEATURE', createdAt: '2026-04-05', startDate: '2026-04-05', dueDate: '2026-04-10' },
]
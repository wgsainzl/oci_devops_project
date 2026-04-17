import type { DashboardStats, TaskStatusEntry, TimelineTask } from '../types'
import type { CostEntry } from '../components/charts/CostPerDeveloperChart'
import type { HoursEntry } from '../components/charts/HoursChart'
import type { SprintSummary } from '../components/charts/SprintCostSummary'

// SPRINT 1 (hardcoded)
export const SPRINT_TASK_STATUS: TaskStatusEntry[] = [
  { developer: 'Guillermo',   userId: 'user-mock-1', todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 4 },
  { developer: 'Sebastian',   userId: 'user-mock-2', todo: 0, inProgress: 1, inReview: 0, blocked: 0, done: 4 },
  { developer: 'Mauricio',    userId: 'user-mock-3', todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 3 },
  { developer: 'Juan Manuel', userId: 'user-mock-4', todo: 0, inProgress: 3, inReview: 0, blocked: 0, done: 2 },
  { developer: 'Diego',       userId: 'user-mock-5', todo: 0, inProgress: 1, inReview: 0, blocked: 0, done: 1 },
]

export const SPRINT_HOURS: HoursEntry[] = [
  { developer: 'Guillermo',   estimated: 7.5,  actual: 5.0 },
  { developer: 'Sebastian',   estimated: 14.5, actual: 12.5 },
  { developer: 'Mauricio',    estimated: 5.5,  actual: 6.25 },
  { developer: 'Juan Manuel', estimated: 13.5, actual: 22.8 }, 
  { developer: 'Diego',       estimated: 8.5,  actual: 6.5 },
]

// SPRINT 0 (hardcoded)
const SPRINT_0_HOURS: Record<string, number> = {
  'Guillermo': 7,
  'Sebastian': 5,
  'Mauricio': 6,
  'Juan Manuel': 5,
  'Diego': 7,
}

const TOTAL_SPRINT_0_HOURS = 30
const TOTAL_SPRINT_0_COMPLETED_TASKS = 12

// shared calculations
export const COST_PER_HOUR = 24.04
const roundCurrency = (value: number): number => Math.round(value * 100) / 100

// cost chart 
export const SPRINT_COST_PER_DEVELOPER: CostEntry[] = SPRINT_HOURS.map((entry) => ({
  developer: entry.developer,
  'Sprint 0': roundCurrency((SPRINT_0_HOURS[entry.developer] ?? 0) * COST_PER_HOUR),
  'Sprint 1': roundCurrency(entry.actual * COST_PER_HOUR),
}))

// current sprint stats 
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

// sprint totals chart
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

export const SPRINT_TIMELINE_TASKS: TimelineTask[] = [
  {
    id: 'ORC-101',
    title: 'OCI Foundations completed',
    responsible: 'All Team',
    status: 'DONE',
    priority: 'HIGH',
    type: 'FEATURE',
    createdAt: '2026-03-01',
    startDate: '2026-03-05',
    dueDate: '2026-03-13',
  },
  {
    id: 'ORC-102',
    title: 'Conectar Microservicios a DB',
    responsible: 'Mauricio',
    status: 'DONE',
    priority: 'CRITICAL',
    type: 'FEATURE',
    createdAt: '2026-03-10',
    startDate: '2026-03-11',
    dueDate: '2026-04-12',
  },
  {
    id: 'ORC-103',
    title: 'Auth implementation',
    responsible: 'Juan Manuel',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    type: 'FEATURE',
    createdAt: '2026-03-15',
    startDate: '2026-03-15',
    dueDate: '2026-04-09',
  },
  {
    id: 'ORC-104',
    title: 'Develop Web Page',
    responsible: 'Sebastian & Diego',
    status: 'DONE',
    priority: 'HIGH',
    type: 'FEATURE',
    createdAt: '2026-03-20',
    startDate: '2026-03-20',
    dueDate: '2026-04-07',
  },
  {
    id: 'ORC-105',
    title: 'Gráfica de trabajo estimado',
    responsible: 'Sebastian',
    status: 'DONE',
    priority: 'MEDIUM',
    type: 'FEATURE',
    createdAt: '2026-04-01',
    startDate: '2026-04-01',
    dueDate: '2026-04-10',
  }
]
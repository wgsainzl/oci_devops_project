import { type JSX, useEffect, useState } from 'react'
import { useAPI } from '../useAPI'
import { useAuth } from '../hooks/AuthContext'
import type {
  UserRole,
  Task,
  PendingAction,
  DashboardStats,
  ActivityLogItem,
  WorkloadMember,
  TaskStatusEntry,
  SprintVelocityEntry,
} from '../types'

import PageHeader from '../components/layout/PageHeader'
import StatsCards from '../components/tasks/StatsCards'
import RecentActivity from '../components/tasks/RecentActivity/RecentActivity'
import TeamWorkload from '../components/tasks/TeamWorkload'
import TaskStatusChart from '../components/charts/TaskStatusChart'
import SprintVelocityChart from '../components/charts/SprintVelocityChart'
import CostPerDeveloperChart, {
  type CostEntry,
} from '../components/charts/CostPerDeveloperChart'
import HoursChart, {
  type HoursEntry,
} from '../components/charts/HoursChart'
import SprintCostSummary, {
  type SprintSummary,
} from '../components/charts/SprintCostSummary'
import styles from './HomePage.module.css'

// dashboard data shape
interface DashboardData {
  pendingActions: PendingAction[]
  stats: DashboardStats
  activity: ActivityLogItem[]
  workload: WorkloadMember[]
  taskStatus: TaskStatusEntry[]
  velocity: SprintVelocityEntry[]
  costPerDev: CostEntry[]
  hoursPerDev: HoursEntry[]
  sprintSummaries: SprintSummary[]
}

type ChartKey =
  | 'taskStatus'
  | 'sprintVelocity'
  | 'costPerDeveloper'
  | 'sprintTotals'
  | 'hoursPerDeveloper'

const VISIBLE_CHARTS_BY_ROLE: Record<UserRole, ChartKey[]> = {
  ADMIN: ['taskStatus', 'sprintVelocity', 'costPerDeveloper', 'sprintTotals', 'hoursPerDeveloper'],
  MANAGER: ['taskStatus', 'sprintVelocity', 'costPerDeveloper', 'sprintTotals', 'hoursPerDeveloper'],
  DEVELOPER: ['taskStatus', 'sprintVelocity'],
}

const EMPTY_DASHBOARD: DashboardData = {
  pendingActions: [],
  stats: {
    completed: 0,
    updated: 0,
    created: 0,
    dueSoon: 0,
  },
  activity: [],
  workload: [],
  taskStatus: [],
  velocity: [],
  costPerDev: [],
  hoursPerDev: [],
  sprintSummaries: [],
}

const formatActivityDate = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Unknown date'
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const toRelativeTime = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Recently'
  const diffMs = Date.now() - d.getTime()
  const mins = Math.max(1, Math.floor(diffMs / 60000))
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const buildMyActivityFromTasks = (
  tasks: Task[],
  userId?: string,
  username?: string,
): ActivityLogItem[] => {
  const myId = String(userId ?? '').trim()
  const myName = String(username ?? '').trim().toLowerCase()

  return tasks
    .filter((task) => {
      const src = task as Task & { responsibleId?: string; updatedAt?: string }
      const byId = myId.length > 0 && String(src.responsibleId ?? '').trim() === myId
      const byName = myName.length > 0 && String(task.responsible ?? '').trim().toLowerCase() === myName
      return byId || byName
    })
    .sort((a, b) => {
      const aSrc = a as Task & { updatedAt?: string }
      const bSrc = b as Task & { updatedAt?: string }
      const aTs = new Date(aSrc.updatedAt ?? a.startDate ?? a.createdAt).getTime()
      const bTs = new Date(bSrc.updatedAt ?? b.startDate ?? b.createdAt).getTime()
      return bTs - aTs
    })
    .map((task) => {
      const src = task as Task & { updatedAt?: string }
      const dateSeed = src.updatedAt ?? task.startDate ?? task.createdAt
      const statusText = task.status.replace(/_/g, ' ')
      return {
        id: task.id,
        date: formatActivityDate(dateSeed),
        actor: task.responsible ?? 'Unassigned',
        action: `updated task status to ${statusText} on`,
        status: task.status,
        time: toRelativeTime(dateSeed),
      }
    })
}

// component
export default function HomePage(): JSX.Element {
  const { user, isManager } = useAuth()
  const teamId = user?.currentTeamId ?? null
  const role: UserRole = user?.role ?? 'DEVELOPER'
  const visibleCharts = VISIBLE_CHARTS_BY_ROLE[role]
  const canSeeChart = (chart: ChartKey): boolean => visibleCharts.includes(chart)
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD)
  const safeActivity = Array.isArray(data.activity) ? data.activity : []
  const safeWorkload = Array.isArray(data.workload) ? data.workload : []
  const safeTaskStatus = Array.isArray(data.taskStatus) ? data.taskStatus : []
  const safeVelocity = Array.isArray(data.velocity) ? data.velocity : []
  const safeCostPerDev = Array.isArray(data.costPerDev) ? data.costPerDev : []
  const safeHoursPerDev = Array.isArray(data.hoursPerDev) ? data.hoursPerDev : []
  const safeSprintSummaries = Array.isArray(data.sprintSummaries) ? data.sprintSummaries : []

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      useAPI.dashboard.getPendingActions(teamId),
      useAPI.dashboard.getStats(teamId),
      useAPI.tasks.getAll(teamId ? { teamId } : undefined),
      useAPI.dashboard.getWorkload(teamId),
      useAPI.dashboard.getTaskStatusSummary(teamId),
      useAPI.dashboard.getSprintVelocity(teamId),
      useAPI.dashboard.getCostPerDeveloper(teamId),
      useAPI.dashboard.getHoursPerDeveloper(teamId),
      useAPI.dashboard.getSprintSummaries(teamId),
    ])
      .then((results) => {
        if (cancelled) return
        const [pa, stats, tasksRes, workload, taskStatus, velocity, costPerDev, hoursPerDev, sprintSummaries] = results

        const myActivity =
          tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)
            ? buildMyActivityFromTasks(tasksRes.value as Task[], user?.userId, user?.username)
            : []

        setData((prev) => ({
          ...prev,
          pendingActions:
            pa.status === 'fulfilled' && Array.isArray(pa.value.data)
              ? pa.value.data
              : prev.pendingActions,
          stats: stats.status === 'fulfilled' ? stats.value.data : prev.stats,
          activity: myActivity.length > 0 ? myActivity : prev.activity,
          workload:
            workload.status === 'fulfilled' && Array.isArray(workload.value.data)
              ? workload.value.data
              : prev.workload,
          taskStatus:
            taskStatus.status === 'fulfilled' && Array.isArray(taskStatus.value.data)
              ? taskStatus.value.data
              : prev.taskStatus,
          velocity:
            velocity.status === 'fulfilled' && Array.isArray(velocity.value.data)
              ? velocity.value.data
              : prev.velocity,
          costPerDev:
            costPerDev.status === 'fulfilled' && Array.isArray(costPerDev.value.data)
              ? costPerDev.value.data
              : prev.costPerDev,
          hoursPerDev:
            hoursPerDev.status === 'fulfilled' && Array.isArray(hoursPerDev.value.data)
              ? hoursPerDev.value.data
              : prev.hoursPerDev,
          sprintSummaries:
            sprintSummaries.status === 'fulfilled' && Array.isArray(sprintSummaries.value.data)
              ? sprintSummaries.value.data
              : prev.sprintSummaries,
        }))
      })
      .catch(() => { /* keep current state */ })

    return () => { cancelled = true }
  }, [teamId, user?.userId, user?.username])

  return (
    <div className={styles.page}>
      <PageHeader title="Home" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>
        {/* <p className={styles.sectionHint}>
          Data source: {useMocks ? 'MOCK MODE (fixtures)' : 'BACKEND LIVE'}
        </p> */}

        {/* pending actions and stats */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}>Recent activity</h2>
          <div className={styles.row1}>
            <section className={`${styles.card} ${styles.activityCard}`}>
              <RecentActivity items={safeActivity} />
            </section>
            <aside className={styles.statsAside}>
              <StatsCards stats={data.stats} />
            </aside>
          </div>
        </div>
        
        
        {/* recent activity and team workload */}
        <div className={styles.row2}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Team workload</h2>
            <section className={`${styles.card} ${styles.workloadCard}`}>
              <TeamWorkload members={safeWorkload} />
            </section>
          </div>
        </div>

        {/* task status and sprint velocity */}
        {(canSeeChart('taskStatus') || canSeeChart('sprintVelocity')) && (
          <div className={styles.row3}>
            {canSeeChart('taskStatus') && (
              <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>
                  {isManager ? 'Team Tasks Status' : 'My Tasks Status'}
                </h2>
                <section className={`${styles.card} ${styles.chartCard}`}>
                  <TaskStatusChart 
                    data={isManager ? safeTaskStatus : safeTaskStatus.filter(t => t.userId === user?.userId)}
                    showDeveloperNames={isManager}
                  />
                </section>
              </div>
            )}
            {canSeeChart('sprintVelocity') && (
              <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Team Sprint Velocity</h2>
                <section className={`${styles.card} ${styles.chartCard}`}>
                  <SprintVelocityChart data={safeVelocity} />
                </section>
              </div>
            )}
          </div>
        )}

        {/* cost per developer and sprint summary */}
        {(canSeeChart('costPerDeveloper') || canSeeChart('sprintTotals')) && (
          <div className={styles.row3}>
            {canSeeChart('costPerDeveloper') && (
              <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Cost per Developer by Sprint (USD)</h2>
                <section className={`${styles.card} ${styles.chartCard}`}>
                  <CostPerDeveloperChart data={safeCostPerDev} />
                </section>
              </div>
            )}
            {canSeeChart('sprintTotals') && (
              <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Sprint Totals</h2>
                <section className={`${styles.card} ${styles.chartCard}`}>
                  <SprintCostSummary sprints={safeSprintSummaries} />
                </section>
              </div>
            )}
          </div>
        )}

        {/* hours per developer */}
        {canSeeChart('hoursPerDeveloper') && (
          <div className={styles.row3}>
            <div className={styles.sectionBlock} style={{ gridColumn: '1 / -1' }}>
              <h2 className={styles.sectionTitle}>
                Hours per Developer
              </h2>
              <section className={styles.card}>
                <HoursChart data={safeHoursPerDev} />
              </section>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
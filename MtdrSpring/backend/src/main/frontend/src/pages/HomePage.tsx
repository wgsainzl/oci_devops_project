import { type JSX, useEffect, useState } from 'react'
import { useAPI } from '../useAPI'
import { useAuth } from '../hooks/AuthContext'
import type {
  UserRole,
  PendingAction,
  DashboardStats,
  ActivityLogItem,
  WorkloadMember,
  TaskStatusEntry,
  SprintVelocityEntry,
} from '../types'

import PageHeader from '../components/layout/PageHeader'
import StatsCards from '../components/tasks/StatsCards'
import PendingActionsTable from '../components/tasks/PendingActionsTable'
import RecentActivity from '../components/tasks/RecentActivity'
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

// component
export default function HomePage(): JSX.Element {
  const { user, isManager } = useAuth()
  const useMocks = String(import.meta.env.VITE_USE_MOCKS).toLowerCase() === 'true'
  const teamId = user?.currentTeamId ?? null
  const role: UserRole = user?.role ?? 'DEVELOPER'
  const visibleCharts = VISIBLE_CHARTS_BY_ROLE[role]
  const canSeeChart = (chart: ChartKey): boolean => visibleCharts.includes(chart)
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD)
  const safePendingActions = Array.isArray(data.pendingActions) ? data.pendingActions : []
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
      useAPI.dashboard.getRecentActivity(teamId),
      useAPI.dashboard.getWorkload(teamId),
      useAPI.dashboard.getTaskStatusSummary(teamId),
      useAPI.dashboard.getSprintVelocity(teamId),
      useAPI.dashboard.getCostPerDeveloper(teamId),
      useAPI.dashboard.getHoursPerDeveloper(teamId),
      useAPI.dashboard.getSprintSummaries(teamId),
    ])
      .then((results) => {
        if (cancelled) return
        const [pa, stats, activity, workload, taskStatus, velocity, costPerDev, hoursPerDev, sprintSummaries] = results

        setData((prev) => ({
          ...prev,
          pendingActions:
            pa.status === 'fulfilled' && Array.isArray(pa.value.data)
              ? pa.value.data
              : prev.pendingActions,
          stats: stats.status === 'fulfilled' ? stats.value.data : prev.stats,
          activity:
            activity.status === 'fulfilled' && Array.isArray(activity.value.data)
              ? activity.value.data
              : prev.activity,
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
  }, [teamId])

  return (
    <div className={styles.page}>
      <PageHeader title="Home" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>
        <p className={styles.sectionHint}>
          Data source: {useMocks ? 'MOCK MODE (fixtures)' : 'BACKEND LIVE'}
        </p>

        {/* pending actions and stats */}
        <div className={styles.row1}>
          <section className={`${styles.card} ${styles.pendingCard}`}>
            <h2 className={styles.sectionTitle}>Pending actions</h2>
            <PendingActionsTable rows={safePendingActions} />
          </section>
          <aside className={styles.statsAside}>
            <StatsCards stats={data.stats} />
          </aside>
        </div>
        
        {/* INCOMING */}
        
        {/* recent activity and team workload */}
        <div className={styles.row2}>
          <section className={`${styles.card} ${styles.activityCard}`}>
            <h2 className={styles.sectionTitle}>Recent activity</h2>
            <RecentActivity items={safeActivity} />
          </section>
          <section className={`${styles.card} ${styles.workloadCard}`}>
            <h2 className={styles.sectionTitle}>Team workload</h2>
            <TeamWorkload members={safeWorkload} />
          </section>
        </div>

        {/* task status and sprint velocity */}
        {(canSeeChart('taskStatus') || canSeeChart('sprintVelocity')) && (
          <div className={styles.row3}>
            {canSeeChart('taskStatus') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>
                  {isManager ? 'Team Tasks Status' : 'My Tasks Status'}
                </h2>
                <TaskStatusChart 
                  data={isManager ? safeTaskStatus : safeTaskStatus.filter(t => t.userId === user?.userId)}
                  showDeveloperNames={isManager}
                />
              </section>
            )}
            {canSeeChart('sprintVelocity') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Team Sprint Velocity</h2>
                <SprintVelocityChart data={safeVelocity} />
              </section>
            )}
          </div>
        )}

        {/* cost per developer and sprint summary */}
        {(canSeeChart('costPerDeveloper') || canSeeChart('sprintTotals')) && (
          <div className={styles.row3}>
            {canSeeChart('costPerDeveloper') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Cost per Developer by Sprint (USD)</h2>
                <CostPerDeveloperChart data={safeCostPerDev} />
              </section>
            )}
            {canSeeChart('sprintTotals') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Sprint Totals</h2>
                <SprintCostSummary sprints={safeSprintSummaries} />
              </section>
            )}
          </div>
        )}

        {/* hours per developer */}
        {canSeeChart('hoursPerDeveloper') && (
          <div className={styles.row3}>
            <section className={`${styles.card}`} style={{ gridColumn: '1 / -1' }}>
              <h2 className={styles.sectionTitle}>
                Hours per Developer
              </h2>
              <HoursChart data={safeHoursPerDev} />
            </section>
          </div>
        )}

      </div>
    </div>
  )
}
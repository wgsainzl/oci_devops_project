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
import PendingActionsTable from '../components/tasks/PendingActionsTable'
import StatsCards from '../components/tasks/StatsCards'
import RecentActivity from '../components/tasks/RecentActivity'
import TeamWorkload from '../components/tasks/TeamWorkload'
import TaskStatusChart from '../components/charts/TaskStatusChart'
import SprintVelocityChart from '../components/charts/SprintVelocityChart'
import CostPerDeveloperChart, {
  COST_PLACEHOLDER,
  type CostEntry,
} from '../components/charts/CostPerDeveloperChart'
import HoursChart, {
  HOURS_PLACEHOLDER,
  type HoursEntry,
} from '../components/charts/HoursChart'
import SprintCostSummary, {
  SPRINT_SUMMARY_PLACEHOLDER,
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

const PLACEHOLDER: DashboardData = {
  pendingActions: [
    { id: 'ORC-789', title: 'API Gateway Implementation', responsible: 'Mau & 1 other(s)', message: 'Pending PR Review — PR #42 has been open for 2 days.', action: 'Review PR' },
    { id: 'ORC-799', title: 'Database Implementation',    responsible: 'La Fleim',           message: 'Bottleneck — Blocked by IT provisioning.',           action: 'Escalate to Admin' },
    { id: 'ORC-304', title: 'Security Audit',              responsible: 'Mau & 1 other(s)', message: 'Overdue — Due 27/02/2026. In progress.',             action: 'Ping Developers' },
    { id: 'ORC-401', title: 'Cache fix',                   responsible: 'La Fleim',           message: 'Status Mismatch — Code merged in GitHub, task status is still In progress.', action: 'Escalate to Admin' },
    { id: 'ORC-112', title: 'Notification Service',        responsible: 'Mau & 1 other(s)', message: 'Aging in Review — Has been in review for 5 days.', action: 'Ping Reviewers' },
  ],
  stats: { completed: 13, updated: 41, created: 26, dueSoon: 18, dueNext7: 13 },
  activity: [
    { id: 1, date: 'Sunday, March 1, 2026', actor: 'System (GitHub)',      action: 'merged Pull Request #42 and changed the status to DONE on ORC-205: OCI Database Setup', status: 'DONE',        time: '10 minutes ago' },
    { id: 2, date: 'Sunday, March 1, 2026', actor: 'Guillermo Sáinz',      action: 'changed the status from TODO to IN_PROGRESS on ORC-401: Database Normalization',        status: 'IN_PROGRESS', time: '2 hours ago' },
    { id: 3, date: 'Sunday, March 1, 2026', actor: 'Mauricio Villalobos',  action: 'opened Pull Request #45 and changed the status to IN_REVIEW on ORC-101: API Gateway Auth Implementation', status: 'IN_REVIEW', time: '1 day ago' },
  ],
  workload: [
    { name: 'Guillermo Sáinz L...',   pct: 30 },
    { name: 'Sebastian Allet O...',   pct: 24 },
    { name: 'Mauricio Villalobos...', pct: 15 },
  ],
  taskStatus: [
    { developer: 'Sebastian', userId: 'user-mock-1', todo: 2, inProgress: 4, inReview: 1, blocked: 0, done: 10 },
    { developer: 'Mauricio',  userId: 'user-mock-2', todo: 5, inProgress: 2, inReview: 3, blocked: 1, done: 8 },
    { developer: 'Guillermo', userId: 'user-mock-3', todo: 1, inProgress: 5, inReview: 2, blocked: 0, done: 12 },
    { developer: 'Juan Manuel', userId: 'user-mock-4', todo: 3, inProgress: 1, inReview: 0, blocked: 2, done: 5 },
    { developer: 'Diego', userId: 'user-mock-5', todo: 3, inProgress: 3, inReview: 4, blocked: 1, done: 9 },
  ],
  velocity: [
    { iteration: 1, estimated: 140, actual: 80  },
    { iteration: 2, estimated: 120, actual: 115 },
    { iteration: 3, estimated: 130, actual: 125 },
    { iteration: 4, estimated: 120, actual: 105 },
  ],
  // new KPI data 
  costPerDev:      COST_PLACEHOLDER,
  hoursPerDev:     HOURS_PLACEHOLDER,
  sprintSummaries: SPRINT_SUMMARY_PLACEHOLDER,
}

// component
export default function HomePage(): JSX.Element {
  const { user, isManager } = useAuth()
  const teamId = user?.currentTeamId ?? null
  const role: UserRole = user?.role ?? 'DEVELOPER'
  const visibleCharts = VISIBLE_CHARTS_BY_ROLE[role]
  const canSeeChart = (chart: ChartKey): boolean => visibleCharts.includes(chart)
  const [data, setData] = useState<DashboardData>(PLACEHOLDER)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      useAPI.dashboard.getPendingActions(teamId),
      useAPI.dashboard.getStats(teamId),
      useAPI.dashboard.getRecentActivity(teamId),
      useAPI.dashboard.getWorkload(teamId),
      useAPI.dashboard.getTaskStatusSummary(teamId),
      useAPI.dashboard.getSprintVelocity(teamId),
      // TODO: wire these three once backend endpoints exist
      // useAPI.dashboard.getCostPerDeveloper(teamId),
      // useAPI.dashboard.getHoursPerDeveloper(teamId),
      // useAPI.dashboard.getSprintSummaries(teamId),
    ])
      .then(([pa, stats, activity, workload, taskStatus, velocity]) => {
        if (cancelled) return
        setData((prev) => ({
          ...prev,
          pendingActions: pa.data,
          stats: stats.data,
          activity: activity.data,
          workload: workload.data,
          taskStatus: taskStatus.data,
          velocity: velocity.data,
        }))
      })
      .catch(() => { /* keep placeholder */ })

    return () => { cancelled = true }
  }, [teamId])

  return (
    <div className={styles.page}>
      <PageHeader title="Home" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>

        {/* pending actions and stats */}
        <div className={styles.row1}>
          <section className={`${styles.card} ${styles.pendingCard}`}>
            <h2 className={styles.sectionTitle}>Pending actions</h2>
            <PendingActionsTable rows={data.pendingActions} />
          </section>
          <aside className={styles.statsAside}>
            <StatsCards stats={data.stats} />
          </aside>
        </div>

        {/* recent activity and team workload */}
        <div className={styles.row2}>
          <section className={`${styles.card} ${styles.activityCard}`}>
            <h2 className={styles.sectionTitle}>Recent activity</h2>
            <RecentActivity items={data.activity} />
          </section>
          <section className={`${styles.card} ${styles.workloadCard}`}>
            <h2 className={styles.sectionTitle}>Team workload</h2>
            <TeamWorkload members={data.workload} />
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
                  data={isManager ? data.taskStatus : data.taskStatus.filter(t => t.userId === user?.userId)}
                  showDeveloperNames={isManager}
                />
              </section>
            )}
            {canSeeChart('sprintVelocity') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Team Sprint Velocity</h2>
                <SprintVelocityChart data={data.velocity} />
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
                <CostPerDeveloperChart data={data.costPerDev} />
              </section>
            )}
            {canSeeChart('sprintTotals') && (
              <section className={`${styles.card} ${styles.chartCard}`}>
                <h2 className={styles.sectionTitle}>Sprint Totals</h2>
                <SprintCostSummary sprints={data.sprintSummaries} />
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
                <span className={styles.sectionHint}> — red bar = over estimate</span>
              </h2>
              <HoursChart data={data.hoursPerDev} />
            </section>
          </div>
        )}

      </div>
    </div>
  )
}
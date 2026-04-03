import { type JSX, useEffect, useState } from 'react'
import { useAPI } from '../useAPI'
import { useAuth } from '../hooks/AuthContext'
import type {
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
import styles from './HomePage.module.css'

// ---------------------------------------------------------------------------
// Placeholder data — rendered immediately before the API responds
// ---------------------------------------------------------------------------
interface DashboardData {
  pendingActions: PendingAction[]
  stats: DashboardStats
  activity: ActivityLogItem[]
  workload: WorkloadMember[]
  taskStatus: TaskStatusEntry[]
  velocity: SprintVelocityEntry[]
}

const PLACEHOLDER: DashboardData = {
  pendingActions: [
    {
      id: 'ORC-789',
      title: 'API Gateway Implementation',
      responsible: 'Mau & 1 other(s)',
      message: 'Pending PR Review — PR #42 has been open for 2 days.',
      action: 'Review PR',
    },
    {
      id: 'ORC-799',
      title: 'Database Implementation',
      responsible: 'La Fleim',
      message: 'Bottleneck — Blocked by IT provisioning.',
      action: 'Escalate to Admin',
    },
    {
      id: 'ORC-304',
      title: 'Security Audit',
      responsible: 'Mau & 1 other(s)',
      message: 'Overdue — Due 27/02/2026. In progress.',
      action: 'Ping Developers',
    },
    {
      id: 'ORC-401',
      title: 'Cache fix',
      responsible: 'La Fleim',
      message: "Status Mismatch — Code merged in GitHub, task status is still In progress.",
      action: 'Escalate to Admin',
    },
    {
      id: 'ORC-112',
      title: 'Notification Service',
      responsible: 'Mau & 1 other(s)',
      message: 'Aging in Review — Has been in review for 5 days.',
      action: 'Ping Reviewers',
    },
  ],
  stats: { completed: 13, updated: 41, created: 26, dueSoon: 18, dueNext7: 13 },
  activity: [
    {
      id: 1,
      date: 'Sunday, March 1, 2026',
      actor: 'System (GitHub)',
      action: 'merged Pull Request #42 and changed the status to DONE on ORC-205: OCI Database Setup',
      status: 'DONE',
      time: '10 minutes ago',
    },
    {
      id: 2,
      date: 'Sunday, March 1, 2026',
      actor: 'Guillermo Sáinz',
      action: 'changed the status from TODO to IN_PROGRESS on ORC-401: Database Normalization',
      status: 'IN_PROGRESS',
      time: '2 hours ago',
    },
    {
      id: 3,
      date: 'Sunday, March 1, 2026',
      actor: 'Mauricio Villalobos',
      action: 'opened Pull Request #45 and changed the status to IN_REVIEW on ORC-101: API Gateway Auth Implementation',
      status: 'IN_REVIEW',
      time: '1 day ago',
    },
  ],
  workload: [
    { name: 'Guillermo Sáinz L...', pct: 30 },
    { name: 'Sebastian Allet O...', pct: 24 },
    { name: 'Mauricio Villalobos...', pct: 15 },
  ],
  taskStatus: [
    { label: 'To do',       count: 80  },
    { label: 'In progress', count: 120 },
    { label: 'In review',   count: 60  },
    { label: 'Done',        count: 140 },
  ],
  velocity: [
    { iteration: 1, estimated: 140, actual: 80  },
    { iteration: 2, estimated: 120, actual: 115 },
    { iteration: 3, estimated: 130, actual: 125 },
    { iteration: 4, estimated: 120, actual: 105 },
  ],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomePage(): JSX.Element {
  const { user } = useAuth()
  const teamId = user?.currentTeamId ?? null

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
    ])
      .then(([pa, stats, activity, workload, taskStatus, velocity]) => {
        if (cancelled) return
        setData({
          pendingActions: pa.data,
          stats: stats.data,
          activity: activity.data,
          workload: workload.data,
          taskStatus: taskStatus.data,
          velocity: velocity.data,
        })
      })
      .catch(() => {
        // API not yet available — keep placeholder data, silent failure
      })

    return () => {
      cancelled = true
    }
  }, [teamId])

  return (
    <div className={styles.page}>
      <PageHeader title="Home" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>
        {/* ── Row 1: Pending Actions + Stats ── */}
        <div className={styles.row1}>
          <section className={`${styles.card} ${styles.pendingCard}`}>
            <h2 className={styles.sectionTitle}>Pending actions</h2>
            <PendingActionsTable rows={data.pendingActions} />
          </section>

          <aside className={styles.statsAside}>
            <StatsCards stats={data.stats} />
          </aside>
        </div>

        {/* ── Row 2: Recent Activity + Team Workload ── */}
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

        {/* ── Row 3: Charts ── */}
        <div className={styles.row3}>
          <section className={`${styles.card} ${styles.chartCard}`}>
            <h2 className={styles.sectionTitle}>Tasks Status</h2>
            <TaskStatusChart data={data.taskStatus} />
          </section>

          <section className={`${styles.card} ${styles.chartCard}`}>
            <h2 className={styles.sectionTitle}>Team Sprint Velocity</h2>
            <SprintVelocityChart data={data.velocity} />
          </section>
        </div>
      </div>
    </div>
  )
}

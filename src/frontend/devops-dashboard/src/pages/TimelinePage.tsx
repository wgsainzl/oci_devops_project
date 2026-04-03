import { type JSX, useEffect, useState } from 'react'
import { timelineAPI } from '../API'
import { useAuth } from '../hooks/AuthContext'
import type { TimelineTask, TaskStatus, TaskPriority } from '../types'
import PageHeader from '../components/layout/PageHeader'
import styles from './TimelinePage.module.css'

// ---------------------------------------------------------------------------
// Gantt window: Jan 1 → Jun 30 2026
// ---------------------------------------------------------------------------
const GANTT_START = new Date('2026-01-01')
const GANTT_END   = new Date('2026-06-30')
const TOTAL_DAYS  = Math.ceil(
  (GANTT_END.getTime() - GANTT_START.getTime()) / 86_400_000,
)
const TODAY = new Date('2026-03-30')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Days from GANTT_START to a given date string
function dayOffset(dateStr: string): number {
  const d = new Date(dateStr)
  return Math.max(0, Math.ceil((d.getTime() - GANTT_START.getTime()) / 86_400_000))
}

function toPct(days: number): string {
  return `${((days / TOTAL_DAYS) * 100).toFixed(2)}%`
}

interface MonthHeader {
  label: string
  startPct: string
  widthPct: string
}

function buildMonthHeaders(): MonthHeader[] {
  const headers: MonthHeader[] = []
  let d = new Date(GANTT_START)
  while (d <= GANTT_END) {
    const month = d.getMonth()
    const year  = d.getFullYear()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth  = new Date(year, month + 1, 0)
    const start = Math.max(dayOffset(firstOfMonth.toISOString().slice(0, 10)), 0)
    const end   = Math.min(dayOffset(lastOfMonth.toISOString().slice(0, 10)) + 1, TOTAL_DAYS)
    headers.push({
      label: MONTHS[month],
      startPct: toPct(start),
      widthPct: toPct(end - start),
    })
    d = new Date(year, month + 1, 1)
  }
  return headers
}

const MONTH_HEADERS = buildMonthHeaders()
const TODAY_PCT     = toPct(Math.min(dayOffset(TODAY.toISOString().slice(0, 10)), TOTAL_DAYS))

// ---------------------------------------------------------------------------
// Display maps
// ---------------------------------------------------------------------------
const STATUS_LABEL: Record<TaskStatus, string> = {
  IN_PROGRESS: 'In progress',
  DONE:        'Done',
  TODO:        'To do',
  BLOCKED:     'Blocked',
  IN_REVIEW:   'In review',
}

const STATUS_CSS_CLASS: Record<TaskStatus, string> = {
  IN_PROGRESS: 'in-progress',
  DONE:        'done',
  TODO:        'todo',
  BLOCKED:     'blocked',
  IN_REVIEW:   'in-review',
}

const PRIORITY_CSS_CLASS: Record<TaskPriority, string> = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
}

const BAR_COLOR: Record<TaskStatus, string> = {
  IN_PROGRESS: '#5aacbe',
  DONE:        '#5ba87a',
  TODO:        '#b0b8c4',
  BLOCKED:     '#e07b5a',
  IN_REVIEW:   '#a07bc4',
}

// ---------------------------------------------------------------------------
// Placeholder tasks
// ---------------------------------------------------------------------------
const PLACEHOLDER_TASKS: TimelineTask[] = [
  {
    id: 'ORC-789',
    title: 'API Gateway Implementation',
    responsible: 'Mau & 1 other(s)',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    type: 'FEATURE',
    createdAt: '2026-01-15',
    startDate: '2026-01-15',
    dueDate: '2026-03-28',
  },
  {
    id: 'ORC-799',
    title: 'Database Implementation',
    responsible: 'La Fleim',
    status: 'DONE',
    priority: 'CRITICAL',
    type: 'FEATURE',
    createdAt: '2026-02-01',
    startDate: '2026-02-01',
    dueDate: '2026-03-14',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TimelinePage(): JSX.Element {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TimelineTask[]>(PLACEHOLDER_TASKS)

  useEffect(() => {
    let cancelled = false
    timelineAPI
      .getTasks(user?.currentTeamId)
      .then((res) => { if (!cancelled) setTasks(res.data) })
      .catch(() => { /* keep placeholder */ })
    return () => { cancelled = true }
  }, [user?.currentTeamId])

  return (
    <div className={styles.page}>
      <PageHeader title="Timeline" subtitle="EasyMoneySnipers" />

      <div className={styles.content}>
        <div className={styles.ganttWrap}>
          <table className={styles.table}>
            <colgroup>
              <col className={styles.colTask} />
              <col className={styles.colResponsible} />
              <col className={styles.colStatus} />
              <col className={styles.colPriority} />
              <col className={styles.colDue} />
              <col className={styles.colGantt} />
            </colgroup>

            <thead>
              {/* Month labels row */}
              <tr className={styles.monthRow}>
                <th colSpan={5} className={styles.metaCols} />
                <th className={styles.ganttHead}>
                  <div className={styles.monthHeaders}>
                    {MONTH_HEADERS.map((m) => (
                      <span
                        key={m.label}
                        className={styles.monthLabel}
                        style={{ left: m.startPct, width: m.widthPct }}
                      >
                        {m.label}
                      </span>
                    ))}
                    {/* Today marker */}
                    <div
                      className={styles.todayLine}
                      style={{ left: TODAY_PCT }}
                      aria-label="Today"
                    >
                      <span className={styles.todayLabel}>
                        Today {TODAY.getDate()}/
                        {String(TODAY.getMonth() + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </th>
              </tr>

              {/* Column headers */}
              <tr className={styles.colHeadRow}>
                <th>Task</th>
                <th>Responsible</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th className={styles.ganttHead} />
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => {
                const startDay = dayOffset(task.startDate)
                const endDay   = dayOffset(task.dueDate ?? task.startDate)
                const barWidth = Math.max(endDay - startDay, 1)
                const dueFormatted = task.dueDate?.split('-').reverse().join('/') ?? '—'

                return (
                  <tr key={task.id} className={styles.taskRow}>
                    <td>
                      <span className={styles.taskId}>{task.id}</span>
                      <span className={styles.taskTitle}>{task.title}</span>
                    </td>
                    <td className={styles.responsible}>{task.responsible ?? '—'}</td>
                    <td>
                      <span className={`badge badge--${STATUS_CSS_CLASS[task.status]}`}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${PRIORITY_CSS_CLASS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className={styles.dueDate}>{dueFormatted}</td>
                    <td className={styles.ganttCell}>
                      <div className={styles.ganttTrack}>
                        <div
                          className={styles.ganttBar}
                          style={{
                            left: toPct(startDay),
                            width: toPct(barWidth),
                            background: BAR_COLOR[task.status],
                          }}
                          title={`${task.id}: ${task.startDate} → ${task.dueDate ?? ''}`}
                        />
                        <div
                          className={styles.todayLineRow}
                          style={{ left: TODAY_PCT }}
                          aria-hidden="true"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

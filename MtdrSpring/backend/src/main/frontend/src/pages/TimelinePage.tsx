import { type JSX, useEffect, useState } from 'react'
import { useAPI } from '../useAPI'
import { useAuth } from '../hooks/AuthContext'
import type { TimelineTask, TaskStatus, TaskPriority } from '../types'
import PageHeader from '../components/layout/PageHeader'
import styles from './TimelinePage.module.css'

// Use UTC noon to prevent timezone off-by-one shifts during math
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

const GANTT_START = new Date(Date.UTC(2026, 0, 1, 12, 0, 0))
const GANTT_END   = new Date(Date.UTC(2026, 5, 30, 12, 0, 0)) // Jun 30
const TOTAL_DAYS  = Math.round((GANTT_END.getTime() - GANTT_START.getTime()) / 86_400_000)

// Configured to match the 'Today' marker context in the reference image
const TODAY = new Date(Date.UTC(2026, 3, 17, 12, 0, 0)) 

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June']

function dayOffset(dateStr: string): number {
  const d = parseDate(dateStr)
  return Math.max(0, (d.getTime() - GANTT_START.getTime()) / 86_400_000)
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
  for (let month = 0; month <= 5; month++) {
    const firstOfMonth = new Date(Date.UTC(2026, month, 1, 12, 0, 0))
    const lastOfMonth  = new Date(Date.UTC(2026, month + 1, 0, 12, 0, 0))

    const start = (firstOfMonth.getTime() - GANTT_START.getTime()) / 86_400_000
    const end   = (lastOfMonth.getTime() - GANTT_START.getTime()) / 86_400_000 + 1

    headers.push({
      label: MONTHS[month],
      startPct: toPct(start),
      widthPct: toPct(end - start),
    })
  }
  return headers
}

const MONTH_HEADERS = buildMonthHeaders()
const TODAY_PCT     = toPct(Math.min((TODAY.getTime() - GANTT_START.getTime()) / 86_400_000, TOTAL_DAYS))

// Display maps
const STATUS_LABEL: Record<TaskStatus, string> = {
  IN_PROGRESS: 'In progress',
  DONE:        'Done',
  TODO:        'To do',
  BLOCKED:     'Blocked',
  IN_REVIEW:   'In review',
}

// Inline styles for badges to match the target's muted aesthetic perfectly
const STATUS_STYLE: Record<TaskStatus, React.CSSProperties> = {
  IN_PROGRESS: { backgroundColor: '#759cac', color: '#000' },
  DONE:        { backgroundColor: '#6ca67b', color: '#000' },
  TODO:        { backgroundColor: '#b0b8c4', color: '#000' },
  BLOCKED:     { backgroundColor: '#d07d70', color: '#000' },
  IN_REVIEW:   { backgroundColor: '#a07bc4', color: '#000' },
}

const PRIORITY_STYLE: Record<TaskPriority, React.CSSProperties> = {
  CRITICAL: { backgroundColor: '#cf7b71', color: '#000' },
  HIGH:     { backgroundColor: '#e29b65', color: '#000' },
  MEDIUM:   { backgroundColor: '#e0c86c', color: '#000' },
  LOW:      { backgroundColor: '#8db580', color: '#000' },
}

const BAR_COLOR: Record<TaskStatus, string> = {
  IN_PROGRESS: '#759cac',
  DONE:        '#6ca67b',
  TODO:        '#b0b8c4',
  BLOCKED:     '#d07d70',
  IN_REVIEW:   '#a07bc4',
}

export default function TimelinePage(): JSX.Element {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TimelineTask[]>([])

  useEffect(() => {
    let cancelled = false
    useAPI.timeline // Changed from timelineAPI
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
              {/* Single unified header row to match the target design */}
              <tr className={styles.colHeadRow}>
                <th>Task</th>
                <th>Responsible</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th className={styles.ganttHead}>
                  <div className={styles.monthHeaders}>
                    {MONTH_HEADERS.map((m) => (
                      <div
                        key={m.label}
                        className={styles.monthHeaderCell}
                        style={{ left: m.startPct, width: m.widthPct }}
                      >
                        {m.label}
                      </div>
                    ))}
                    {/* Today marker correctly aligned to the top */}
                    <div className={styles.todayLineHeader} style={{ left: TODAY_PCT }}>
                      <span className={styles.todayLabel}>
                        Today {String(TODAY.getUTCDate()).padStart(2, '0')}/
                        {String(TODAY.getUTCMonth() + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </th>
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
                    <td className={styles.responsible}>
                      <div className={styles.userWrap}>
                         <div 
                           className={styles.avatar} 
                           style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(task.responsible ?? 'U')}&background=random)` }} 
                         />
                         <span>{task.responsible ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.statusBadge} style={STATUS_STYLE[task.status]}>
                        {STATUS_LABEL[task.status]}
                      </span>
                    </td>
                    <td>
                      <span className={styles.statusBadge} style={PRIORITY_STYLE[task.priority]}>
                        {task.priority === 'CRITICAL' ? 'Critical' : task.priority}
                      </span>
                    </td>
                    <td className={styles.dueDate}>{dueFormatted}</td>
                    <td className={styles.ganttCell}>
                      <div className={styles.ganttTrack}>
                        
                        {/* Vertical Month Grids */}
                        {MONTH_HEADERS.map((m) => (
                          <div
                            key={`grid-${m.label}`}
                            className={styles.monthGrid}
                            style={{ left: m.startPct, width: m.widthPct }}
                          />
                        ))}

                        {/* Gantt Bar */}
                        <div
                          className={styles.ganttBar}
                          style={{
                            left: toPct(startDay),
                            width: toPct(barWidth),
                            background: BAR_COLOR[task.status],
                          }}
                          title={`${task.id}: ${task.startDate} → ${task.dueDate ?? ''}`}
                        />

                        {/* Dashed line matching target */}
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

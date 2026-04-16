import { type JSX } from 'react'
import type { ActivityLogItem, TaskStatus } from '../../types'
import styles from './RecentActivity.module.css'

interface Props {
  items: ActivityLogItem[]
}

function StatusBadge({ text }: { text: TaskStatus }): JSX.Element {
  const cls = text.replace(/_/g, '-').toLowerCase()
  return <span className={`badge badge--${cls}`}>{text.replace(/_/g, ' ')}</span>
}

function groupByDate(items: ActivityLogItem[]): Record<string, ActivityLogItem[]> {
  return items.reduce<Record<string, ActivityLogItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})
}

const GitHubIcon = (): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.57v-2c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const UserIcon = (): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z" />
  </svg>
)

export default function RecentActivity({ items }: Props): JSX.Element {
  if (items.length === 0) {
    return <p className={styles.empty}>No recent activity.</p>
  }

  const groups = groupByDate(items)

  return (
    <div className={styles.feed}>
      {Object.entries(groups).map(([date, dayItems]) => (
        <div key={date} className={styles.group}>
          <p className={styles.dateLabel}>{date}</p>
          {dayItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.avatar}>
                {item.actor.startsWith('System') ? <GitHubIcon /> : <UserIcon />}
              </div>
              <div className={styles.body}>
                <p className={styles.text}>
                  <strong>{item.actor}</strong>{' '}
                  {item.action}{' '}
                  {item.status && <StatusBadge text={item.status} />}
                </p>
                <p className={styles.time}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

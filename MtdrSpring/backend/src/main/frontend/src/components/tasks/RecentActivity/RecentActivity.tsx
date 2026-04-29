import { type JSX } from 'react'
import type { ActivityLogItem } from '../../../types'
import styles from './RecentActivity.module.css'

interface Props {
  items: ActivityLogItem[]
}

function groupByDate(items: ActivityLogItem[]): Record<string, ActivityLogItem[]> {
  return items.reduce<Record<string, ActivityLogItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})
}


export default function RecentActivity({ items }: Props): JSX.Element {
  if (items.length === 0) {
    return <p className={styles.empty}>No recent activity.</p>
  }

  const groups = groupByDate(items);

  return (
    <div className={styles.feed}>
      {Object.entries(groups).map(([date, dayItems]) => (
        <div key={date} className={styles.group}>
          <p className={styles.dateLabel}>{date}</p>
          {dayItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.body}>
                <p className={styles.text}>
                  <strong>{item.actor}</strong>{' '}
                  {item.status ? (
                    <>
                      updated task status to <strong>{item.status.replace(/_/g, ' ')}</strong> on{' '}
                    </>
                  ) : (
                    <>
                      {item.action}{' '}
                    </>
                  )}
                  <strong>ORC-{String(item.id)}</strong>
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

import { type JSX } from 'react'
import type { PendingAction } from '../../types'
import styles from './PendingActionsTable.module.css'

interface Props {
  rows: PendingAction[]
}

const ExternalLinkIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5z" />
    <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5z" />
  </svg>
)

export default function PendingActionsTable({ rows }: Props): JSX.Element {
  if (rows.length === 0) {
    return <p className={styles.empty}>No pending actions, you&apos;re all caught up</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Task</th>
          <th>Responsible</th>
          <th>Message</th>
          <th>Recommended action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>
              <span className={styles.taskId}>{row.id}</span>
              <span className={styles.taskTitle}>{row.title}</span>
            </td>
            <td className={styles.responsible}>{row.responsible}</td>
            <td className={styles.message}>{row.message}</td>
            <td>
              <button className={styles.actionBtn} type="button">
                {row.action} <ExternalLinkIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

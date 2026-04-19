import { type JSX } from 'react'
import type { WorkloadMember } from '../../types'
import styles from './TeamWorkload.module.css'

interface Props {
  members: WorkloadMember[]
}

const BAR_COLORS: string[] = ['#5aacbe', '#8ab4c8', '#a0c8b8']

export default function TeamWorkload({ members }: Props): JSX.Element {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.col}>Task</span>
        <span className={styles.col}>Work distribution</span>
      </div>

      {members.map((m, i) => (
        <div key={m.name} className={styles.row}>
          <div className={styles.memberInfo}>
            <div
              className={styles.avatar}
              style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
            <span className={styles.name}>{m.name}</span>
          </div>

          <div className={styles.barTrack}>
            <div
              className={styles.bar}
              style={{
                width: `${m.pct}%`,
                background: BAR_COLORS[i % BAR_COLORS.length],
              }}
              role="progressbar"
              aria-valuenow={m.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${m.name}: ${m.pct}%`}
            />
            <span className={styles.pct}>{m.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

import React, { type JSX } from 'react'
import styles from './SprintCostSummary.module.css'

// types

export interface SprintSummary {
  label: string      // e.g. "Sprint 0"
  totalCost: number  // USD
  totalHours: number
  tasksCompleted: number
}

interface Props {
  sprints: SprintSummary[]
}

// component
export default function SprintCostSummary({
  sprints,
}: Props): JSX.Element {
  const filteredSprints = sprints.filter(s => s.label !== "Backlog")
  
  return (
    <div className={styles.grid}>
      {filteredSprints.map((s, i) => (
        <div key={s.label} className={`${styles.card} ${i === filteredSprints.length - 1 ? styles.primary : styles.secondary}`}>
          <p className={styles.sprintLabel}>{s.label}</p>

          <div className={styles.stat}>
            <span className={styles.statValue}>${s.totalCost.toLocaleString()}</span>
            <span className={styles.statLabel}>Total Cost (USD)</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.row}>
            <div className={styles.miniStat}>
              <span className={styles.miniValue}>{s.totalHours}h</span>
              <span className={styles.miniLabel}>Hours worked</span>
            </div>
            <div className={styles.miniStat}>
              <span className={styles.miniValue}>{s.tasksCompleted}</span>
              <span className={styles.miniLabel}>Tasks done</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

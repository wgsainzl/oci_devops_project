import React, { type JSX, useState } from 'react'
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
  const [selectedSprint, setSelectedSprint] = useState<string>("all")
  let displaySprints: SprintSummary[] = []

  if (selectedSprint === "all") {
    const totalAccumulated = filteredSprints.reduce(
      (acc, s) => {
        acc.totalCost += s.totalCost;
        acc.totalHours += s.totalHours;
        acc.tasksCompleted += s.tasksCompleted;
        return acc;
      },
      { label: "All Sprints Total", totalCost: 0, totalHours: 0, tasksCompleted: 0 }
    );
    displaySprints = [totalAccumulated];
  } else {
    displaySprints = filteredSprints.filter(s => s.label === selectedSprint);
  }

  return (
    <div className={styles.widgetContainer}>
      {/* Encabezado interno con espacio de separación mejorado */}
      <div className={styles.widgetHeader}>
        <select 
          className={styles.dropdownFilter}
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
        >
          <option value="all">All Sprints Total</option>
          {filteredSprints.map(s => (
            <option key={s.label} value={s.label}>{s.label}</option>
          ))}
        </select>
      </div>
      {/* Grid contenedor de tarjetas */}
      <div className={styles.grid}>
        {displaySprints.map((s, i) => (
          <div 
            key={s.label} 
            className={`${styles.card} ${styles.secondary}`}
          >
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
    </div>
  )
}
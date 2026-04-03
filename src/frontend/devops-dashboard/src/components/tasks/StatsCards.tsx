import { type JSX } from 'react'
import type { DashboardStats } from '../../types'
import styles from './StatsCards.module.css'

interface Props {
  stats: DashboardStats
}

interface CardConfig {
  key: keyof DashboardStats
  icon: string
  iconClass: string
  label: string
  sub: (s: DashboardStats) => string
}

const CARDS: CardConfig[] = [
  {
    key: 'completed',
    icon: '/stats_card/task-done.svg',
    iconClass: 'iconGreen',
    label: 'tasks completed',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'updated',
    icon: '/stats_card/update.svg',
    iconClass: 'iconBlue',
    label: 'tasks updated',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'created',
    icon: '/stats_card/add-circle.svg',
    iconClass: 'iconTeal',
    label: 'tasks created',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'dueSoon',
    icon: '/stats_card/calendar-icon.svg',
    iconClass: 'iconOrange',
    label: 'tasks due soon',
    sub: (s) => `${s.dueNext7 ?? ''} in the next 7 days`,
  },
]

export default function StatsCards({ stats }: Props): JSX.Element {
  return (
    <>
      {CARDS.map((card) => (
        <div key={card.key} className={styles.card}>
          <span className={`${styles.icon} ${styles[card.iconClass]}`} aria-hidden="true">
            <img className={styles.iconImage} src={card.icon} alt="" />
          </span>
          <div className={styles.text}>
            <span className={styles.count}>{stats[card.key] ?? '—'}</span>
            <span className={styles.label}> {card.label}</span>
            <p className={styles.sub}>{card.sub(stats)}</p>
          </div>
        </div>
      ))}
    </>
  )
}

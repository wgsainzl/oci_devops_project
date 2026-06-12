import { type JSX } from 'react'
import type { DashboardStats } from '../../types'
import styles from './StatsCards.module.css'

interface Props {
  stats: DashboardStats
  isManager?: boolean 
  onCreateTaskClick?: () => void 
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
    icon: '/stats_card/Check square.png',
    iconClass: 'iconGreen',
    label: 'tasks completed',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'updated',
    icon: '/stats_card/Pen tool.png',
    iconClass: 'iconBlue',
    label: 'tasks updated',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'created',
    icon: '/stats_card/add_circle.png',
    iconClass: 'iconTeal',
    label: 'tasks created',
    sub: () => 'in the last 7 days',
  },
  {
    key: 'dueSoon',
    icon: '/stats_card/Calendar.png',
    iconClass: 'iconOrange',
    label: 'tasks due soon',
    sub: (s) => `${s.dueNext7 ?? ''} in the next 7 days`,
  },
]

export default function StatsCards({ stats, isManager, onCreateTaskClick }: Props): JSX.Element {
  return (
    <>
    {isManager && onCreateTaskClick && (
      <div className={styles.buttonRow}>
          <button 
            type="button" 
            className={styles.inlineCreateBtn} 
            onClick={onCreateTaskClick}
          >
            New Task
          </button>
      </div>
      )}
      {CARDS.map((card) => (
        <div key={card.key} className={styles.card}>
          {/* Main layout container wrapper for card content */}
          <div className={styles.cardContent}>
            <span className={`${styles.icon} ${styles[card.iconClass]}`} aria-hidden="true">
              <img className={styles.iconImage} src={card.icon} alt="" />
            </span>
            <div className={styles.text}>
              <span className={styles.count}>{stats[card.key] ?? '—'}</span>
              <span className={styles.label}> {card.label}</span>
              <p className={styles.sub}>{card.sub(stats)}</p>
            </div>
          </div>

          {/* If this is the 'created' card and user is a manager, inject the button on the right side of the card
          {card.key === 'created' && isManager && onCreateTaskClick && (
            <button 
              type="button" 
              className={styles.inlineCreateBtn} 
              onClick={onCreateTaskClick}
            >
              New Task
            </button>
          )} */}
        </div>
      ))}
    </>
  )
}
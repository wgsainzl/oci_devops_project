import { type JSX } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: JSX.Element
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps): JSX.Element {
  return (
    <div className={styles.header}>
      {/* Move the toolbar/actions wrapper to render first (on the left side) */}
      {actions && (
        <div className={styles.toolbar}>
          {actions}
        </div>
      )}
      
      <div className={styles.inner}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

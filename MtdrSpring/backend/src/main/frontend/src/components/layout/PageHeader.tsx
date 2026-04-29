import { type JSX } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  // onFilter?: () => void
}

export default function PageHeader({ title, subtitle, /*onFilter*/ }: PageHeaderProps): JSX.Element {
  // const filterCount = 0    

  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.toolbar}>
        {/* <button
          className={styles.filterBtn}
          onClick={onFilter}
          aria-label={`Filter (${filterCount} active)`}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 .707 1.707L13 10.414V16a1 1 0 0 1-1.447.894l-4-2A1 1 0 0 1 7 14v-3.586L3.293 6.707A1 1 0 0 1 3 6V5z" />
          </svg>
          Filter ({filterCount})
        </button> */}
      </div>
    </div>
  )
}

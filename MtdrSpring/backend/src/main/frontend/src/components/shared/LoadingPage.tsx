import type { JSX } from 'react'
import styles from './LoadingPage.module.css'

type LoadingPageProps = {
  title?: string
  description?: string
}

export default function LoadingPage({
}: LoadingPageProps): JSX.Element {
  return (
    <div className={styles.page} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true">
          <span className={styles.ring} />
        </div>
        <div className={styles.copy}>
        </div>
          <span />
          <span />
          <span />
        </div>
    </div>
  )
}
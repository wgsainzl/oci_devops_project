import type { JSX } from 'react'
import styles from './LoadingPage.module.css'

type LoadingPageProps = {
  title?: string
  description?: string
}

export default function LoadingPage({
  title = 'Loading',
  description = 'Fetching dounce and preparing the view.',
}: LoadingPageProps): JSX.Element {
  return (
    <div className={styles.page} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.dot} />
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>Dounce wait</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.pulseRow} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
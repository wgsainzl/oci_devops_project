import { type JSX } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import styles from './ApiDocsPage.module.css'

export default function ApiDocsPage(): JSX.Element {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>API Documentation</h1>
        <p className={styles.sub}>
          Live reference for all Oracle Task Manager REST endpoints.
        </p>
      </div>
      <div className={styles.swaggerWrap}>
        {/* Reads swagger_APIs_definition.yaml from /public (REQ-FUN-015) */}
        <SwaggerUI url="/swagger_APIs_definition.yaml" />
      </div>
    </div>
  )
}

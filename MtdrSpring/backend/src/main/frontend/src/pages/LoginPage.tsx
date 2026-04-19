import styles from './LoginPage.module.css'

const OracleMark = (): JSX.Element => (
    <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon}/>
)

export default function LoginPage(): JSX.Element {

    const handleOracleLogin = (): void => {
        // Directly trigger the Spring Boot OAuth2 flow
        window.location.href = 'http://localhost:8080/oauth2/authorization/oci'
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <span className={styles.oracleMark}><OracleMark/></span>
                    <span className={styles.appName}>Oracle Task Manager</span>
                    <div className={styles.headerActions}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
                            <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z"/>
                        </svg>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Sign in to Oracle</h1>

                    <p style={{marginBottom: '20px', color: '#666'}}>
                        Click the button below to authenticate with your Oracle Identity account.
                    </p>

                    <button
                        className={styles.btnPrimary}
                        onClick={handleOracleLogin}
                        type="button"
                    >
                        Login with Oracle Cloud
                    </button>
                </div>

                {/* Optional: Helpful footer or message for dev */}
                <p style={{textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '20px'}}>
                    Internal Task Management System
                </p>
            </div>
        </div>
    )
}
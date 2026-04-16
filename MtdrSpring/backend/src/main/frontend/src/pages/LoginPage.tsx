import { useState, type FormEvent, type JSX } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import styles from './LoginPage.module.css'

type LoginStep = 'email' | 'password' | '2fa'

const OracleMark = (): JSX.Element => (
  <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon} />
)

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { signIn, verify2FA, error } = useAuth()

  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [challengeToken, setChallengeToken] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const displayError = localError ?? error

  // email
  const handleEmailNext = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!email.trim()) return
    setStep('password')
  }

  // password
  const handlePasswordNext = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLocalError(null)
    setLoading(true)
    try {
      const data = await signIn(email, password)
      if ('user' in data && data.user) {
        // 2FA disabled (dev test) already authenticated
        navigate('/home', { replace: true })
      } else if ('challengeToken' in data && typeof data.challengeToken === 'string') {
        setChallengeToken(data.challengeToken)
        setStep('2fa')
      }
    } catch {
      // error surfaced via AuthContext
    } finally {
      setLoading(false)
    }
  }

  // 2FA
  const handle2FAVerify = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLocalError(null)
    setLoading(true)
    try {
      await verify2FA(challengeToken, code)
      navigate('/home', { replace: true })
    } catch {
      // error surfaced via AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* <span className={styles.menuIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
              <rect y="3" width="20" height="2" rx="1" />
              <rect y="9" width="20" height="2" rx="1" />
              <rect y="15" width="20" height="2" rx="1" />
            </svg>
          </span> */}
          <span className={styles.oracleMark}><OracleMark /></span>
          <span className={styles.appName}>Oracle Task Manager</span>
          <div className={styles.headerActions}>
            {/* <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
              <path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
            </svg> */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
              <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z" />
            </svg>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* error banner (password step only) */}
        {displayError && step === 'password' && (
          <div className={styles.errorBanner} role="alert">
            {displayError}
          </div>
        )}

        {/* sign-in card */}
        <div className={styles.card}>
          <h1 className={styles.title}>Sign in to Oracle</h1>

          {/* email */}
          {step === 'email' && (
            <form onSubmit={handleEmailNext}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">
                  Username or email
                </label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="Username or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                />
              </div>
              <button className={styles.btnPrimary} type="submit">Next</button>
            </form>
          )}

          {/* password */}
          {step === 'password' && (
            <form onSubmit={handlePasswordNext}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="password">Password</label>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  required
                />
              </div>
              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Next'}
              </button>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </form>
          )}

          {/* 2FA */}
          {step === '2fa' && (
            <form onSubmit={handle2FAVerify}>
              <p className={styles.twoFaHint}>
                Enter the 6-digit code from your authenticator app.
              </p>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="code">
                  Verification code
                </label>
                <input
                  id="code"
                  className={`${styles.input} ${styles.inputCode}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
              {displayError && (
                <p className={styles.inlineError} role="alert">{displayError}</p>
              )}
              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>
          )}
        </div>

        {/* register card */}
        <div className={styles.card}>
          <h2 className={styles.secondaryTitle}>Don&apos;t have an account?</h2>
          <Link to="/register">
            <button className={styles.btnSecondary} type="button">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

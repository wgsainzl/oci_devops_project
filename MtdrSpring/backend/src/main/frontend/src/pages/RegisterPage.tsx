import { type JSX, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../API'
import type { RegisterFormData } from '../types'
import styles from './RegisterPage.module.css'

interface FieldConfig {
  name: keyof RegisterFormData
  label: string
  type: string
  required: boolean
}

const FIELDS: FieldConfig[] = [
  { name: 'email',     label: 'Email Address',  type: 'email',    required: true  },
  { name: 'password',  label: 'Password',        type: 'password', required: true  },
  { name: 'confirm',   label: 'Retype password', type: 'password', required: true  },
  { name: 'country',   label: 'Country',         type: 'text',     required: true  },
  { name: 'firstName', label: 'First Name',      type: 'text',     required: true  },
  { name: 'lastName',  label: 'Last Name',       type: 'text',     required: true  },
  { name: 'jobTitle',  label: 'Job Title',       type: 'text',     required: false },
  { name: 'phone',     label: 'Work Phone',      type: 'tel',      required: false },
  { name: 'address',   label: 'Address',         type: 'text',     required: false },
  { name: 'city',      label: 'City',            type: 'text',     required: false },
  { name: 'state',     label: 'State/Province',  type: 'text',     required: false },
  { name: 'zip',       label: 'Zip/Postal Code', type: 'text',     required: false },
]

const EMPTY_FORM: RegisterFormData = {
  email: '', password: '', confirm: '', country: '',
  firstName: '', lastName: '', jobTitle: '', phone: '',
  address: '', city: '', state: '', zip: '',
}

const OracleMark = (): JSX.Element => (
  <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon} />
)

export default function RegisterPage(): JSX.Element {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterFormData>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    try {
      await authAPI.createAccount(form)
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/login" className={styles.headerLink} aria-label="Go to login page">
          <span className={styles.oracleMark}><OracleMark /></span>
        </Link>
        <span className={styles.appName}>Oracle Task Manager</span>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create Your Oracle Account</h1>

          <p className={styles.signInPrompt}>
            Already have an Oracle Account?{' '}
            <Link to="/login">Sign In</Link>
          </p>

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {FIELDS.map((f) => (
              <div key={f.name} className={styles.field}>
                <label className={styles.label} htmlFor={f.name}>
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  className={styles.input}
                  value={form[f.name] as string}
                  onChange={handleChange}
                  required={f.required}
                  autoComplete={f.name === 'email' ? 'email' : 'off'}
                />
              </div>
            ))}

            <p className={styles.terms}>
              By clicking on the &ldquo;Create Account&rdquo; button below, you understand and
              agree that the use of Oracle&apos;s web site is subject to the{' '}
              <a
                href="https://www.oracle.com/legal/terms.html"
                target="_blank"
                rel="noreferrer"
              >
                Oracle.com Terms of Use
              </a>
              .
            </p>

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

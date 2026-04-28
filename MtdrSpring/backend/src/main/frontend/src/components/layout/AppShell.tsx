import { type JSX, useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/AuthContext'
import styles from './AppShell.module.css'

// inline SVG icons 
const IconMenu = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <rect y="3" width="20" height="2" rx="1" />
    <rect y="9" width="20" height="2" rx="1" />
    <rect y="15" width="20" height="2" rx="1" />
  </svg>
)
const IconBell = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
  </svg>
)
const IconUser = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z" />
  </svg>
)
const OracleMark = (): JSX.Element => (
  <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon} />
)

// appshell component
export default function AppShell(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [itemsVisible, setItemsVisible] = useState<boolean>(true)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Delay showing items when sidebar opens, hide immediately when it closes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    
    if (sidebarOpen) {
      // Faster initial opening - only 20ms delay
      timeoutId = setTimeout(() => setItemsVisible(true), 20)
    } else {
      // Hide immediately, no delay
      setItemsVisible(false)
    }
    
    // Always cleanup pending timeout
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [sidebarOpen])

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const navClass = ({ isActive }: { isActive: boolean }): string =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`

  return (
    <div className={styles.shell}>
      {/* header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <IconMenu />
          </button>
          <span className={styles.oracleMark} aria-hidden="true">
            <OracleMark />
          </span>
          <span className={styles.appName}>Oracle Task Manager</span>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.iconBtn}
            aria-label="User menu"
            title={user?.email}
            onClick={handleSignOut}
          >
            <IconUser />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* sidebar */}
        <nav
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
          aria-label="Main navigation"
          data-items-visible={itemsVisible}
        >
          <NavLink to="/home" className={navClass}>
            <span>Home</span>
          </NavLink>
          <NavLink to="/timeline" className={navClass}>
            <span>Timeline</span>
          </NavLink>
        </nav>

        {/* content */}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

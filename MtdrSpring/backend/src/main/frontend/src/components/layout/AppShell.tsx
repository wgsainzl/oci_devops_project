import {type JSX, useState, useEffect, useRef} from 'react'
import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import {useAuth} from '../../hooks/AuthContext'
import styles from './AppShell.module.css'

// inline SVG icons 
const IconMenu = (): JSX.Element => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={styles.burgerSvg}
    >
        {/* up line */}
        <rect className={`${styles.burgerLine} ${styles.lineTop}`} y="3" width="20" height="2" rx="1"/>
        {/* center line*/}
        <rect className={`${styles.burgerLine} ${styles.lineMiddle}`} y="9" width="20" height="2" rx="1"/>
        {/* down line */}
        <rect className={`${styles.burgerLine} ${styles.lineBottom}`} y="15" width="20" height="2" rx="1"/>
    </svg>
);
const IconBell = (): JSX.Element => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
            d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z"/>
    </svg>
)
const IconUser = (): JSX.Element => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z"/>
    </svg>
)
const OracleMark = (): JSX.Element => (
    <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon}/>
)

// appshell component
export default function AppShell(): JSX.Element {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [itemsVisible, setItemsVisible] = useState<boolean>(true)
    const {user, signOut} = useAuth()
    const navigate = useNavigate()

    // state to handle profile dropdown menu visibility
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // states for telegram code management
    const [telegramCode, setTelegramCode] = useState<number | null>(null)
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [showCodeModal, setShowCodeModal] = useState<boolean>(false)

    // Delay showing items when sidebar opens, hide immediately when it closes
    useEffect(() => {
        // Set visibility instantly matching the sidebar state, no timeouts!
        setItemsVisible(sidebarOpen);
    }, [sidebarOpen]);

    // Close dropdown if user clicks anywhere outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async (): Promise<void> => {
        await signOut()
        setUserMenuOpen(false)
        navigate('/login', {replace: true})
    }

    // fetching  linking token
    const handleGenerateTelegramCode = async () => {
        setIsGenerating(true)
        setUserMenuOpen(false) // close dropdown item view
        try {
            const response = await fetch("/api/link", {
                method: "POST",
                credentials: "include", // Pass cookies/JWT session safely
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)

            const code = await response.json() // Server returns raw Integer code
            setTelegramCode(code)
            setShowCodeModal(true)
        } catch (err) {
            console.error("Failed generating validation link token:", err)
            alert("Could not generate a temporary integration code. Please verify authentication.")
        } finally {
            setIsGenerating(false)
        }
    }

    const navClass = ({isActive}: { isActive: boolean }): string =>
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
                        <IconMenu/>
                    </button>
                    <span className={styles.oracleMark} aria-hidden="true">
            <OracleMark/>
          </span>
                    <span className={styles.appName}>Oracle Task Manager</span>
                </div>

                {/* User Profile Menu Container */}
                <div className={styles.headerRight} ref={menuRef}>
                    <div className={styles.profileContainer}>
                        <button
                            className={`${styles.iconBtnProfile} ${userMenuOpen ? styles.activeProfileBtn : ''}`}
                            aria-label="User menu"
                            title={user?.email}
                            onClick={() => setUserMenuOpen((prev) => !prev)}
                        >
                            <IconUser/>
                        </button>

                        {userMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <p className={styles.userEmail}>{user?.email}</p>
                                </div>

                                {/* generate Telegram ID button */}
                                <button
                                    type="button"
                                    className={styles.dropdownItem}
                                    disabled={isGenerating}
                                    onClick={handleGenerateTelegramCode}
                                >
                                    {isGenerating ? "Generating..." : "Generate Telegram ID"}
                                </button>

                                <hr className={styles.dropdownDivider}/>

                                <button
                                    type="button"
                                    className={`${styles.dropdownItem} ${styles.signOutBtn}`}
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
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
                    <NavLink to="/tasks" className={navClass}>
                        <span>Tasks</span>
                    </NavLink>
                </nav>

                {/* content */}
                <main className={styles.main}>
                    <Outlet/>
                </main>
            </div>

            {/* modal layer overlay displaying the random integration code */}
            {showCodeModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h3>Link Telegram Bot</h3>
                        <p>Send the following 6-digit synchronization token directly to your Telegram Chatbot to
                            authorize updates:</p>
                        <div className={styles.codeBox}>{telegramCode}</div>
                        <p className={styles.expiryWarning}>This registration token expires automatically after 15
                            minutes.</p>
                        <button className={styles.closeModalBtn} onClick={() => setShowCodeModal(false)}>
                            Got it, Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

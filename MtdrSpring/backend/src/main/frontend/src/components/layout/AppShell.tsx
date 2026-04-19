import { type JSX, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
//import TeamSwitcher from "./TeamSwitcher";
import styles from "./AppShell.module.css";

// inline SVG icons
const IconMenu = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <rect y="3" width="20" height="2" rx="1" />
    <rect y="9" width="20" height="2" rx="1" />
    <rect y="15" width="20" height="2" rx="1" />
  </svg>
);
const IconBell = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
  </svg>
);
const IconUser = (): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H3z" />
  </svg>
);
const IconHome = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v7a1 1 0 0 0 1 1h4v-5h2v5h4a1 1 0 0 0 1-1v-7h1a1 1 0 0 0 .707-1.707l-7-7z" />
  </svg>
);
const IconTimeline = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm1 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H4z" />
  </svg>
);
const OracleMark = (): JSX.Element => (
  <img src="/oracle-icon.svg" alt="Oracle" className={styles.oracleMarkIcon} />
);

// appshell component
export default function AppShell(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }: { isActive: boolean }): string =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;

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
          <button className={styles.iconBtn} aria-label="Notifications">
            <IconBell />
          </button>
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
        >
          <NavLink to="/home" className={navClass}>
            <IconHome />
            <span>Home</span>
          </NavLink>
          <NavLink to="/timeline" className={navClass}>
            <IconTimeline />
            <span>Timeline</span>
          </NavLink>
          {/*<TeamSwitcher />*/}
        </nav>

        {/* content */}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

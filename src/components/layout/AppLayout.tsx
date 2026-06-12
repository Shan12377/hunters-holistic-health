import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import styles from './AppLayout.module.css'

const clientNav = [
  { to: '/app/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/app/daily-log', icon: '✓', label: 'Daily Log' },
  { to: '/app/bp-tracker', icon: '♥', label: 'BP Tracker' },
  { to: '/app/meal-guard', icon: '⚡', label: 'Meal Guard' },
  { to: '/app/protocol', icon: '◈', label: 'My Protocol' },
  { to: '/app/supplements', icon: '⬡', label: 'Supplements' },
  { to: '/app/weekly-grade', icon: '★', label: 'Weekly Grade' },
  { to: '/app/feed', icon: '◎', label: 'Community Feed' },
]

export default function AppLayout() {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>Hunter's Holistic</div>
          <div className={styles.logoSub}>Functional Medicine Education</div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>My Health</div>
          {clientNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {profile?.role === 'educator' && (
            <>
              <div className={styles.navSection}>Educator</div>
              <NavLink
                to="/app/educator"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <span className={styles.navIcon}>◈</span>
                Educator View
              </NavLink>
            </>
          )}

          <div className={styles.navSection}>Account</div>
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <span className={styles.navIcon}>⚙</span>
            Settings
          </NavLink>

          <button className={styles.navLink} onClick={handleSignOut}>
            <span className={styles.navIcon}>↩</span>
            Sign Out
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className={styles.userRole}>{profile?.role ?? 'member'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div className={styles.topbarTitle}>Hunter's Holistic Health</div>
          <div className={styles.topbarActions}>
            <span className={styles.topbarUser}>
              {profile?.first_name}
            </span>
          </div>
        </div>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { flushQueue } from '@/lib/offlineQueue'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import LateSlipModal from '@/components/ui/LateSlipModal'
import styles from './AppLayout.module.css'

interface NavItem {
  to: string
  icon: string
  label: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Track',
    items: [
      { to: '/app/daily-log',      icon: '✓', label: 'Daily Log' },
      { to: '/app/blood-pressure', icon: '♥', label: 'BP Tracker' },
      { to: '/app/blood-sugar',    icon: '◉', label: 'Blood Sugar' },
      { to: '/app/supplements',    icon: '⬡', label: 'Supplements' },
      { to: '/app/exercise',       icon: '◎', label: 'Movement Log' },
      { to: '/app/weekly-grade',   icon: '★', label: 'Weekly Grade' },
    ],
  },
  {
    label: 'Nutrition',
    items: [
      { to: '/app/meal-guard',       icon: '⚡', label: 'Meal Guard' },
      { to: '/app/meal-plan',        icon: '◉', label: 'Meal Plan' },
      { to: '/app/daily-plate',      icon: '◉', label: 'Daily Plate' },
      { to: '/app/build-your-plate', icon: '⚡', label: 'Build Your Plate' },
      { to: '/app/trending-meals',   icon: '◎', label: 'Trending Meals' },
      { to: '/app/food-search',      icon: '◇', label: 'Food Search' },
      { to: '/app/recipe-builder',   icon: '◈', label: 'Recipe Builder' },
      { to: '/app/recipes',          icon: '◇', label: 'Recipe Ideas' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/app/protocol',         icon: '◈', label: 'My Protocol' },
      { to: '/app/protocol-matrix',  icon: '⬡', label: 'Protocol Matrix' },
      { to: '/app/classroom',        icon: '◈', label: 'Classroom' },
      { to: '/app/metabolic-tools',  icon: '◉', label: 'Metabolic Tools' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/app/feed',        icon: '◎', label: 'Community Feed' },
      { to: '/app/cohort',      icon: '◑', label: 'My Cohort' },
      { to: '/app/leaderboard', icon: '★', label: 'Leaderboard' },
      { to: '/app/challenges',  icon: '⚡', label: 'Challenges' },
      { to: '/app/events',      icon: '◷', label: 'Events' },
      { to: '/app/messages',    icon: '✉', label: 'Messages' },
    ],
  },
  {
    label: 'Sessions',
    items: [
      { to: '/app/sessions',  icon: '◷', label: 'My Sessions' },
      { to: '/app/feedback',  icon: '◎', label: 'Give Feedback' },
    ],
  },
]

function activeGroup(pathname: string): string {
  for (const group of NAV_GROUPS) {
    if (group.items.some(item => pathname.startsWith(item.to))) return group.label
  }
  return 'Track'
}

export default function AppLayout() {
  const { profile, user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen]     = useState(false)
  const [isOnline, setIsOnline]         = useState(navigator.onLine)
  const [showLateSlip, setShowLateSlip] = useState(false)
  const [feedBadge, setFeedBadge]       = useState(0)
  const [openGroups, setOpenGroups]     = useState<Set<string>>(
    () => new Set([activeGroup(location.pathname)])
  )

  // Keep the active group open when navigating
  useEffect(() => {
    const current = activeGroup(location.pathname)
    setOpenGroups(prev => {
      if (prev.has(current)) return prev
      const next = new Set(prev)
      next.add(current)
      return next
    })
  }, [location.pathname])

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  useEffect(() => {
    if (!user?.id) return
    const lastVisit = localStorage.getItem('feed_last_visit') ?? new Date(0).toISOString()
    supabase
      .from('feed_posts')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', lastVisit)
      .neq('user_id', user.id)
      .then(({ count }) => setFeedBadge(count ?? 0))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    Promise.all([
      supabase.from('daily_logs').select('id').eq('user_id', user.id).eq('log_date', yesterday).maybeSingle(),
      supabase.from('daily_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    ]).then(([yesterdayRes, countRes]) => {
      const hasAnyLogs = (countRes.count ?? 0) > 0
      if (hasAnyLogs && !yesterdayRes.data) setShowLateSlip(true)
    })
  }, [user?.id])

  const handleLateSlipSubmit = async (reason: string) => {
    if (!user?.id || !profile) return
    const handle = profile.display_handle || `${profile.first_name} ${profile.last_name[0]}.`
    const feedContent = reason
      ? `${handle} checked in late: "${reason}"`
      : `${handle} missed yesterday and is back today.`
    await supabase.from('feed_posts').insert({
      user_id: user.id,
      content: feedContent,
      post_type: 'late_slip',
      likes: 0,
    })
    setShowLateSlip(false)
  }

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      flushQueue().then(count => { if (count > 0) toast.success('Offline logs synced.') })
    }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      {showLateSlip && (
        <LateSlipModal
          onSubmit={handleLateSlipSubmit}
          onClose={() => setShowLateSlip(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <img src="/logo-mark.png" alt="Hunter's Holistic Health emblem" className={styles.sidebarLogoImg} />
          <div>
            <div className={styles.logoMark}>Hunter's Holistic</div>
            <div className={styles.logoSub}>Functional Medicine Education</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {/* Dashboard: always visible, no group */}
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className={styles.navIcon}>⬡</span>
            Dashboard
          </NavLink>

          {/* Collapsible groups */}
          {NAV_GROUPS.map(group => {
            const isOpen = openGroups.has(group.label)
            return (
              <div key={group.label} className={styles.navGroup}>
                <button
                  className={styles.navGroupHeader}
                  onClick={() => toggleGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={13}
                    className={`${styles.navGroupChevron} ${isOpen ? styles.navGroupChevronOpen : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className={styles.navGroupItems}>
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        onClick={() => {
                          setMobileOpen(false)
                          if (item.to === '/app/feed') {
                            localStorage.setItem('feed_last_visit', new Date().toISOString())
                            setFeedBadge(0)
                          }
                        }}
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.label}
                        {item.to === '/app/feed' && feedBadge > 0 && (
                          <span className={styles.feedBadge}>{feedBadge > 99 ? '99+' : feedBadge}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Educator section */}
          {profile?.role === 'educator' && (
            <>
              <div className={styles.navSection}>Educator</div>
              <NavLink to="/coach" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>◈</span>Educator View
              </NavLink>
              <NavLink to="/coach/messages" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>✉</span>Participant Messages
              </NavLink>
              <NavLink to="/coach/challenges" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>⚡</span>Manage Challenges
              </NavLink>
              <NavLink to="/coach/classroom" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>◈</span>Manage Classroom
              </NavLink>
              <NavLink to="/coach/events" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>◷</span>Manage Events
              </NavLink>
              <NavLink to="/coach/compliance-guard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}>✓</span>FTC Compliance Guard
              </NavLink>
            </>
          )}

          {/* Account */}
          <div className={styles.navSection}>Account</div>
          <NavLink to="/app/settings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
            <span className={styles.navIcon}>⚙</span>Settings
          </NavLink>
          <button className={styles.navLink} onClick={handleSignOut}>
            <span className={styles.navIcon}>↩</span>Sign Out
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>{profile?.first_name} {profile?.last_name}</div>
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
            {!isOnline && (
              <span className={styles.offlinePill}>
                <span className={styles.offlineDot} />
                Offline
              </span>
            )}
            <span className={styles.topbarUser}>{profile?.first_name}</span>
          </div>
        </div>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

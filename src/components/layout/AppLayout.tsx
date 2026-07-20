import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronDown, LayoutDashboard, ClipboardList, Heart, Droplet, Scale, Pill, Activity,
  Star, TrendingUp, Shield, CalendarDays, ChefHat, Lock, BookOpen, GraduationCap,
  Gauge, Users, HeartHandshake, Trophy, Zap, Calendar, Mail, Target, ListChecks,
  HeartPulse, Clock, MessageSquare, Briefcase, PenLine, ShieldCheck, Inbox, BarChart3, Brain,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { flushQueue } from '@/lib/offlineQueue'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import LateSlipModal, { lateSlipDismissKey } from '@/components/ui/LateSlipModal'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import styles from './AppLayout.module.css'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Consolidated July 2026 (Rule F, approved by Dr. Hunter): related pages became
// tabs inside one destination (see PAGE_TABS below). All routes still work.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Track',
    items: [
      { to: '/app/daily-log',      icon: ClipboardList, label: 'Daily Log' },
      { to: '/app/blood-pressure', icon: Heart, label: 'BP Tracker' },
      { to: '/app/blood-sugar',    icon: Droplet, label: 'Blood Sugar' },
      { to: '/app/weight',         icon: Scale, label: 'Weight' },
      { to: '/app/supplements',    icon: Pill, label: 'Supplements' },
      { to: '/app/exercise',       icon: Activity, label: 'Movement' },
      { to: '/app/weekly-grade',   icon: Star, label: 'Weekly Grade' },
      { to: '/app/snapshot',       icon: TrendingUp, label: 'My Snapshot' },
    ],
  },
  {
    label: 'Nutrition',
    items: [
      { to: '/app/meal-guard', icon: Shield, label: 'Nourish Log' },
      { to: '/app/meal-plan',  icon: CalendarDays, label: 'Meal Plan' },
      { to: '/app/recipes',    icon: ChefHat, label: 'Recipes' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/app/vault',           icon: Lock, label: 'The Vault' },
      { to: '/app/my-protocol',     icon: BookOpen, label: 'My Protocol' },
      { to: '/app/classroom',       icon: GraduationCap, label: 'Classroom' },
      { to: '/app/metabolic-tools', icon: Gauge, label: 'Metabolic Tools' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/app/feed',        icon: Users, label: 'Community Feed' },
      { to: '/app/cohort',      icon: HeartHandshake, label: 'My Cohort' },
      { to: '/app/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/app/challenges',  icon: Zap, label: 'Challenges' },
      { to: '/app/events',      icon: Calendar, label: 'Events' },
      { to: '/app/messages',    icon: Mail, label: 'Messages' },
    ],
  },
  {
    label: 'Goals & Habits',
    items: [
      { to: '/app/health-goals', icon: Target, label: 'Health Goals' },
      { to: '/app/habits',       icon: ListChecks, label: 'Daily Habits' },
    ],
  },
  {
    label: 'Sessions',
    items: [
      { to: '/app/health-hub', icon: HeartPulse, label: 'My Health Hub' },
      { to: '/app/sessions',   icon: Clock, label: 'My Sessions' },
      { to: '/app/feedback',   icon: MessageSquare, label: 'Give Feedback' },
    ],
  },
]

// Pages absorbed into a sibling as tabs. The tab bar renders above the page.
const PAGE_TABS: { match: string[]; tabs: { to: string; label: string }[] }[] = [
  { match: ['/app/meal-plan', '/app/daily-plate'], tabs: [
    { to: '/app/meal-plan', label: 'Meal Plan' },
    { to: '/app/daily-plate', label: 'Daily Plate' },
  ]},
  { match: ['/app/recipes', '/app/recipe-builder'], tabs: [
    { to: '/app/recipes', label: 'Recipes' },
    { to: '/app/recipe-builder', label: 'AI Recipe Builder' },
  ]},
  { match: ['/app/my-protocol', '/app/protocol', '/app/protocol-matrix'], tabs: [
    { to: '/app/my-protocol', label: 'My Protocol' },
    { to: '/app/protocol', label: 'ROOTS Framework' },
    { to: '/app/protocol-matrix', label: 'Protocol Matrix' },
  ]},
  { match: ['/app/exercise', '/app/workout-tracker'], tabs: [
    { to: '/app/exercise', label: 'Movement Log' },
    { to: '/app/workout-tracker', label: 'Workout Tracker' },
  ]},
  { match: ['/app/habits', '/app/morning'], tabs: [
    { to: '/app/habits', label: 'Daily Habits' },
    { to: '/app/morning', label: 'Morning Protocol' },
  ]},
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
    // Rule B (CLAUDE.md): never for educators, only once per day, and never on the
    // pages where the user is already logging (do not interrupt the fix).
    if (profile?.role === 'educator') return
    if (localStorage.getItem(lateSlipDismissKey())) return
    if (['/app/daily-log', '/app/meal-guard'].some(p => location.pathname.startsWith(p))) return
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    Promise.all([
      supabase.from('daily_logs').select('id').eq('user_id', user.id).eq('log_date', yesterday).maybeSingle(),
      supabase.from('daily_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    ]).then(([yesterdayRes, countRes]) => {
      const hasAnyLogs = (countRes.count ?? 0) > 0
      // Small delay so the page is visible and interactive before any prompt appears.
      if (hasAnyLogs && !yesterdayRes.data) setTimeout(() => setShowLateSlip(true), 5000)
    })
  }, [user?.id, profile?.role])

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
    ? (profile.display_name
        ? profile.display_name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase())
    : '?'

  const avatarStyle = profile?.avatar_color
    ? {
        background: `${profile.avatar_color}26`,
        borderColor: `${profile.avatar_color}80`,
        color: profile.avatar_color,
        boxShadow: `0 0 8px ${profile.avatar_color}40`,
      }
    : undefined

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
            <span className={styles.navIcon}><LayoutDashboard size={15} /></span>
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
                        <span className={styles.navIcon}><item.icon size={15} /></span>
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
                <span className={styles.navIcon}><LayoutDashboard size={15} /></span>Educator View
              </NavLink>
              <NavLink to="/coach/crm" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Briefcase size={15} /></span>CRM Pipeline
              </NavLink>
              <NavLink to="/coach/comms" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><PenLine size={15} /></span>Comms Studio
              </NavLink>
              <NavLink to="/coach/messages" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Mail size={15} /></span>Participant Messages
              </NavLink>
              <NavLink to="/coach/challenges" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Zap size={15} /></span>Manage Challenges
              </NavLink>
              <NavLink to="/coach/classroom" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><GraduationCap size={15} /></span>Manage Classroom
              </NavLink>
              <NavLink to="/coach/events" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Calendar size={15} /></span>Manage Events
              </NavLink>
              <NavLink to="/coach/compliance-guard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><ShieldCheck size={15} /></span>FTC Compliance Guard
              </NavLink>
              <NavLink to="/coach/applications" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Inbox size={15} /></span>Applications
              </NavLink>
              <NavLink to="/coach/kpis" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><BarChart3 size={15} /></span>KPI Dashboard
              </NavLink>
              <NavLink to="/coach/brain-dump" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                <span className={styles.navIcon}><Brain size={15} /></span>Brain Dump
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
            <div className={styles.userAvatar} style={avatarStyle}>{initials}</div>
            <div>
              <div className={styles.userName}>{profile?.display_name || `${profile?.first_name} ${profile?.last_name}`}</div>
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
            <span className={styles.topbarUser}>{profile?.display_name || profile?.first_name}</span>
          </div>
        </div>

        <div className={styles.content}>
          {(() => {
            const tabs = PAGE_TABS.find(s => s.match.includes(location.pathname))?.tabs
            if (!tabs) return null
            return (
              <div className={styles.pageTabs}>
                {tabs.map(t => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    end
                    className={({ isActive }) => `${styles.pageTab} ${isActive ? styles.pageTabActive : ''}`}
                  >
                    {t.label}
                  </NavLink>
                ))}
              </div>
            )
          })()}
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

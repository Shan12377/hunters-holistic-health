import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Activity, Shield, ClipboardList, BookOpen, Droplets, Droplet, Zap, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { format, addDays } from 'date-fns'
import type { DailyLog, BPReading, BSReading } from '@/types'
import { getBPZone, BP_ZONE_LABELS, BP_ZONE_COLORS, getBSZone, BS_ZONE_LABELS, BS_ZONE_COLORS } from '@/types'
import LateSlipModal, { lateSlipDismissKey } from '@/components/ui/LateSlipModal'
import OnboardingChecklist from '@/components/ui/OnboardingChecklist'
import WeeklyPulseCard from '@/components/ui/WeeklyPulseCard'
import { getTotalPoints, getLevelInfo } from '@/lib/points'
import { STEPS_GOAL, WATER_GOAL_OZ } from '@/lib/goals'
import { withTimeout } from '@/lib/withTimeout'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const DASHBOARD_TIMEOUT_MS = 15000

const DOXY_URL = 'https://doxy.me/drshallandahunter'

interface UpcomingSessionBrief {
  id: string
  session_date: string
  session_time: string
  session_type: string
}

function fmtTime(timeStr: string): string {
  return format(new Date(`1970-01-01T${timeStr}`), 'h:mm a')
}

function fmtDate(dateStr: string): string {
  return format(new Date(dateStr + 'T12:00:00'), 'EEEE, MMMM d')
}

// Values live on the same 1 to 10 scale as the Daily Log energy slider (Rule C).
const ENERGY_LEVELS = [
  { value: 2, label: 'Drained' },
  { value: 4, label: 'Low' },
  { value: 6, label: 'Okay' },
  { value: 8, label: 'Good' },
  { value: 10, label: 'Strong' },
]

export default function ClientDashboard() {
  const { profile } = useAuthStore()
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [latestBP, setLatestBP] = useState<BPReading | null>(null)
  const [latestBS, setLatestBS] = useState<BSReading | null>(null)
  const [upcomingSession, setUpcomingSession] = useState<UpcomingSessionBrief | null>(null)
  const [showLateSlip, setShowLateSlip] = useState(false)
  const [totalPoints, setTotalPoints] = useState<number | null>(null)
  const [showEnergyCheckIn, setShowEnergyCheckIn] = useState(false)
  const [savingEnergy, setSavingEnergy] = useState(false)
  // If a single query in fetchTodayData throws (no BP history yet, no
  // blood sugar history yet, nothing logged today), it previously took the
  // whole Promise.all down with it, silently, with no error shown and no
  // way to retry. The dashboard just sat there looking permanently stale.
  const [loadError, setLoadError] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')
  const hour = new Date().getHours()

  useEffect(() => {
    fetchTodayData()
  }, [])

  useEffect(() => {
    // Evening check-in after 9 PM if the daily log is incomplete.
    // Rule B (CLAUDE.md): never for educators, only once per day, never instantly on load.
    if (profile?.role === 'educator') return
    if (localStorage.getItem(lateSlipDismissKey())) return
    if (hour >= 21 && todayLog && !todayLog.late_slip_reason) {
      const incomplete = !todayLog.meal1_logged || !todayLog.supplement_am_done
      if (incomplete) {
        const t = setTimeout(() => setShowLateSlip(true), 5000)
        return () => clearTimeout(t)
      }
    }
  }, [todayLog, hour, profile?.role])

  useEffect(() => {
    // Show midday energy check-in between 11am and 8pm if not already done today
    if (hour >= 11 && hour < 20) {
      const checkinKey = `energy_checkin_${today}`
      if (!localStorage.getItem(checkinKey)) setShowEnergyCheckIn(true)
    }
  }, [today, hour])

  const handleEnergyCheckIn = async (level: number) => {
    setSavingEnergy(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (user) {
      await supabase.from('daily_logs').upsert(
        { user_id: user.id, log_date: today, energy_level: level },
        { onConflict: 'user_id,log_date' }
      )
      localStorage.setItem(`energy_checkin_${today}`, String(level))
      setTodayLog(prev => prev ? { ...prev, energy_level: level } : prev)
    }
    setSavingEnergy(false)
    setShowEnergyCheckIn(false)
  }

  const fetchTodayData = async () => {
    setLoadError(false)
    try {
      const { data: { session } } = await withTimeout(supabase.auth.getSession(), DASHBOARD_TIMEOUT_MS, 'Session check')
      const user = session?.user
      if (!user) return

      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

      // maybeSingle, not single: single() throws when there is no row yet
      // (no BP history, no blood sugar history, nothing logged today), and
      // that throw previously took the whole Promise.all down with it, so
      // one missing history silently blanked out data that did exist.
      const [logRes, bpRes, bsRes, sessRes] = await withTimeout(
        Promise.all([
          supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
          supabase.from('blood_pressure_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('blood_sugar_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('sessions')
            .select('id, session_date, session_time, session_type')
            .eq('user_id', user.id)
            .eq('status', 'scheduled')
            .gte('session_date', today)
            .lte('session_date', tomorrow)
            .order('session_date')
            .order('session_time')
            .limit(5),
        ]),
        DASHBOARD_TIMEOUT_MS,
        "Today's dashboard data"
      )

      if (logRes.data) setTodayLog(logRes.data as DailyLog)
      if (bpRes.data) setLatestBP(bpRes.data as BPReading)
      if (bsRes.data) setLatestBS(bsRes.data as BSReading)
      getTotalPoints(user.id).then(pts => setTotalPoints(pts))

      const now = new Date()
      const within24h = ((sessRes.data ?? []) as UpcomingSessionBrief[]).find(s => {
        const sessionDt = new Date(`${s.session_date}T${s.session_time}`)
        const diffMs = sessionDt.getTime() - now.getTime()
        return diffMs > 0 && diffMs <= 86400000
      })
      setUpcomingSession(within24h ?? null)
    } catch (err) {
      console.error('[dashboard] fetch failed:', err)
      setLoadError(true)
    }
  }

  // Labeled so the user can always see what counts toward the score (Rule C).
  const checklist = todayLog ? [
    { label: 'Fast', done: !!todayLog.morning_fast_done },
    { label: 'Meal 1', done: !!todayLog.meal1_logged },
    { label: 'Meal 2', done: !!todayLog.meal2_logged },
    { label: 'AM supps', done: !!todayLog.supplement_am_done },
    { label: 'PM supps', done: !!todayLog.supplement_pm_done },
    { label: 'Steps', done: (todayLog.steps ?? 0) >= STEPS_GOAL },
    { label: 'Water', done: (todayLog.water_oz ?? 0) >= WATER_GOAL_OZ },
  ] : []
  const completionPct = checklist.length > 0 ? Math.round((checklist.filter(c => c.done).length / checklist.length) * 100) : 0
  const bpZone = latestBP ? getBPZone(latestBP.systolic, latestBP.diastolic) : null
  const bsZone = latestBS ? getBSZone(latestBS.glucose_mg_dl, latestBS.reading_context) : null
  const levelInfo = totalPoints !== null ? getLevelInfo(totalPoints) : null

  return (
    <div className="animate-fade-in">
      {/* Command Header */}
      <div className={styles.commandHeader}>
        <div>
          <h1 className={styles.commandGreeting}>
            Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {profile?.display_name || profile?.first_name}
          </h1>
          <p className={styles.commandDate}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        {levelInfo && (
          <div className={styles.commandLevelWrap}>
            <span className={styles.commandLvlPill}>LVL {levelInfo.level}</span>
            <span className={styles.commandLvlLabel}>{levelInfo.label}</span>
          </div>
        )}
      </div>

      {loadError && (
        <div className={styles.nutritionNotFoundRow}>
          Could not load your dashboard data. Check your connection and
          <button type="button" className={shared.btnGhost} onClick={fetchTodayData} style={{ marginLeft: 8 }}>
            Retry
          </button>
        </div>
      )}

      {/* First-week onboarding (hides itself when complete or dismissed) */}
      <OnboardingChecklist todayLog={todayLog} latestBP={latestBP} latestBS={latestBS} />

      {/* 24-hour session reminder */}
      {upcomingSession && (
        <div className={styles.sessionBanner}>
          <div className={styles.sessionBannerBody}>
            <div className={styles.sessionBannerLabel}>Session Today</div>
            <div className={styles.sessionBannerTitle}>{upcomingSession.session_type}</div>
            <div className={styles.sessionBannerMeta}>
              {fmtDate(upcomingSession.session_date)} at {fmtTime(upcomingSession.session_time)}
            </div>
            <a href={DOXY_URL} target="_blank" rel="noopener noreferrer" className={styles.sessionBannerLink}>
              <ExternalLink size={13} /> Join Session Room
            </a>
          </div>
        </div>
      )}

      {/* Hero Metric Cards */}
      <div className={styles.heroGrid}>
        {/* Today's Progress */}
        <Link to="/app/daily-log" className={styles.miniLink}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardLabel}>Today's Progress</div>
            <div className={styles.heroRingWrap}>
              <svg width="100" height="100" className={styles.ringSvg}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="7" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gold)" strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - completionPct / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className={styles.heroRingValue}>{completionPct}%</div>
            </div>
            <div className={styles.heroCardGoalsCount}>
              {checklist.filter(c => c.done).length} of {checklist.length || 7} goals done
            </div>
            {checklist.length > 0 && (
              <div className={styles.heroProgressItems}>
                {checklist.map(item => (
                  <span
                    key={item.label}
                    className={item.done ? styles.heroProgressItemDone : styles.heroProgressItemPending}
                    title={item.label}
                  >
                    {item.done ? '●' : '○'}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.heroCardCta}>Tap to log</div>
          </div>
        </Link>

        {/* Blood Pressure */}
        <Link to="/app/blood-pressure" className={styles.miniLink}>
          {/* Border color from live BP zone, stays inline */}
          <div className={styles.heroCard} style={bpZone ? { borderColor: BP_ZONE_COLORS[bpZone] + '40' } : undefined}>
            <div className={styles.heroCardLabel}>Blood Pressure</div>
            {latestBP ? (
              <>
                <div className={styles.heroBPValue} style={{ color: BP_ZONE_COLORS[bpZone!] }}>
                  {latestBP.systolic}/{latestBP.diastolic}
                </div>
                <div className={styles.heroBPUnit}>mmHg</div>
                <div
                  className={styles.heroZonePill}
                  style={{
                    color: BP_ZONE_COLORS[bpZone!],
                    borderColor: BP_ZONE_COLORS[bpZone!] + '50',
                    background: BP_ZONE_COLORS[bpZone!] + '18',
                  }}
                >
                  {BP_ZONE_LABELS[bpZone!]}
                </div>
              </>
            ) : (
              <div className={styles.heroEmpty}>
                <Heart size={36} strokeWidth={1.2} />
                <span>No readings yet</span>
              </div>
            )}
            <div className={styles.heroCardCta}>Tap to log BP</div>
          </div>
        </Link>

        {/* Activity: steps + water + energy */}
        <Link to="/app/daily-log" className={styles.miniLink}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardLabel}>Activity</div>
            <div className={styles.heroActivityGrid}>
              <div className={styles.heroActivityItem}>
                <Activity size={20} color="var(--teal)" />
                <div className={styles.heroActivityValue} style={{ color: 'var(--teal)' }}>
                  {(todayLog?.steps ?? 0).toLocaleString()}
                </div>
                <div className={styles.heroActivitySub}>steps</div>
                <div className={styles.heroActivityGoal}>Goal {STEPS_GOAL.toLocaleString()}</div>
              </div>
              <div className={styles.heroActivityDivider} />
              <div className={styles.heroActivityItem}>
                <Droplets size={20} color="#4b9ee0" />
                <div className={styles.heroActivityValue} style={{ color: '#4b9ee0' }}>
                  {todayLog?.water_oz ?? 0}
                </div>
                <div className={styles.heroActivitySub}>oz water</div>
                <div className={styles.heroActivityGoal}>Goal {WATER_GOAL_OZ}</div>
              </div>
            </div>
            {todayLog?.energy_level ? (
              <div className={styles.heroEnergyRow}>
                <Zap size={13} color="var(--gold)" />
                <span>Energy:</span>
                <span className={styles.heroEnergyVal}>{todayLog.energy_level}/10</span>
              </div>
            ) : null}
            <div className={styles.heroCardCta}>Tap to log activity</div>
          </div>
        </Link>
      </div>

      {/* Midday Energy Check-In */}
      {showEnergyCheckIn && (
        <div className={styles.energyCheckInCard}>
          <div className={styles.energyCheckInHeader}>
            <Zap size={16} color="var(--gold)" />
            <span className={styles.energyCheckInTitle}>Quick check-in: how's your energy right now?</span>
          </div>
          <div className={styles.energyLevelRow}>
            {ENERGY_LEVELS.map(({ value, label }) => (
              <button
                key={value}
                className={styles.energyLevelBtn}
                onClick={() => handleEnergyCheckIn(value)}
                disabled={savingEnergy}
              >
                <span className={styles.energyLevelNum}>{value}</span>
                <span className={styles.energyLevelLabel}>{label}</span>
              </button>
            ))}
          </div>
          <button className={styles.energySkip} onClick={() => {
            localStorage.setItem(`energy_checkin_${today}`, 'skipped')
            setShowEnergyCheckIn(false)
          }}>
            Skip for today
          </button>
        </div>
      )}

      {/* Blood Sugar (secondary stat) */}
      <div className={styles.secondaryGrid}>
        <Link to="/app/blood-sugar" className={styles.miniLink}>
          {/* Border and value color from live BS zone, stays inline */}
          <div className={styles.miniCard} style={bsZone ? { borderColor: BS_ZONE_COLORS[bsZone] + '40' } : undefined}>
            <div className={styles.miniHeader}>
              <Droplet size={16} color={bsZone ? BS_ZONE_COLORS[bsZone] : 'var(--text-secondary)'} />
              <span className={styles.miniLabel}>Blood Sugar</span>
            </div>
            {latestBS ? (
              <>
                <div className={styles.miniValue} style={{ color: BS_ZONE_COLORS[bsZone!] }}>
                  {latestBS.glucose_mg_dl}
                </div>
                <div className={styles.miniSub}>{BS_ZONE_LABELS[bsZone!]}</div>
              </>
            ) : (
              <div className={styles.miniEmpty}>No readings yet</div>
            )}
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={styles.sectionLabel}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          {[
            { to: '/app/blood-pressure', icon: Heart, label: 'Log BP', color: '#e05c5c' },
            { to: '/app/meal-guard', icon: Shield, label: 'Nourish Log', color: 'var(--gold)' },
            { to: '/app/daily-log', icon: ClipboardList, label: 'Daily Log', color: 'var(--teal)' },
            { to: '/app/my-protocol', icon: BookOpen, label: 'My Protocol', color: '#9b59b6' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className={styles.miniLink}>
              <div className={styles.actionCard}>
                <Icon size={22} color={color} />
                <div className={styles.actionLabel}>{label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Coach: Weekly Pulse */}
      <WeeklyPulseCard />

      {/* Disclaimer */}
      <div className={styles.disclaimerBox}>
        <p className={styles.disclaimerText}>
          <strong>Educational Purposes Only.</strong> This platform provides health education and lifestyle tracking tools. It does not constitute medical advice, diagnosis, or treatment. Dr. Shallanda Hunter, CFNMP, PharmD operates as a Functional Medicine Educator. Always consult your licensed healthcare provider before making changes to your health regimen.
        </p>
      </div>

      {/* Late Slip Modal */}
      {showLateSlip && (
        <LateSlipModal
          onSubmit={async (reason) => {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            if (!user) return
            await supabase.from('daily_logs').upsert({
              user_id: user.id,
              log_date: today,
              late_slip_reason: reason,
            }, { onConflict: 'user_id,log_date' })
            setShowLateSlip(false)
            fetchTodayData()
          }}
          onClose={() => setShowLateSlip(false)}
        />
      )}
    </div>
  )
}

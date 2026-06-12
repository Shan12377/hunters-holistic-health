import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Activity, Shield, ClipboardList, BookOpen, Droplets, Droplet, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import type { DailyLog, BPReading, BSReading } from '@/types'
import { getBPZone, BP_ZONE_LABELS, BP_ZONE_COLORS, getBSZone, BS_ZONE_LABELS, BS_ZONE_COLORS } from '@/types'
import LateSlipModal from '@/components/ui/LateSlipModal'
import styles from './Client.module.css'

export default function ClientDashboard() {
  const { profile } = useAuthStore()
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null)
  const [latestBP, setLatestBP] = useState<BPReading | null>(null)
  const [latestBS, setLatestBS] = useState<BSReading | null>(null)
  const [showLateSlip, setShowLateSlip] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')
  const hour = new Date().getHours()

  useEffect(() => {
    fetchTodayData()
  }, [])

  useEffect(() => {
    // Show Late Slip after 9 PM if daily log is incomplete
    if (hour >= 21 && todayLog && !todayLog.late_slip_reason) {
      const incomplete = !todayLog.meal1_logged || !todayLog.supplement_am_done
      if (incomplete) setShowLateSlip(true)
    }
  }, [todayLog, hour])

  const fetchTodayData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [logRes, bpRes, bsRes] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
      supabase.from('blood_pressure_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).single(),
      supabase.from('blood_sugar_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).single(),
    ])

    if (logRes.data) setTodayLog(logRes.data as DailyLog)
    if (bpRes.data) setLatestBP(bpRes.data as BPReading)
    if (bsRes.data) setLatestBS(bsRes.data as BSReading)
  }

  const completionItems = todayLog ? [
    todayLog.morning_fast_done,
    todayLog.meal1_logged,
    todayLog.meal2_logged,
    todayLog.supplement_am_done,
    todayLog.supplement_pm_done,
    (todayLog.steps ?? 0) >= 5000,
    (todayLog.water_oz ?? 0) >= 64,
  ] : []
  const completionPct = completionItems.length > 0 ? Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100) : 0

  const bpZone = latestBP ? getBPZone(latestBP.systolic, latestBP.diastolic) : null
  const bsZone = latestBS ? getBSZone(latestBS.glucose_mg_dl, latestBS.reading_context) : null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {profile?.first_name} 👋
        </h1>
        <p className={styles.greetingDate}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Progress Ring + Today's Score */}
      <div className={styles.progressCard}>
        <div className={styles.ringWrap}>
          <svg width="80" height="80" className={styles.ringSvg}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
            {/* Dash offset is computed from completion percentage, so it stays inline */}
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--gold)" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionPct / 100)}`}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className={styles.ringValue}>
            {completionPct}%
          </div>
        </div>
        <div>
          <div className={styles.progressTitle}>Today's Progress</div>
          <div className={styles.progressMessage}>
            {completionPct === 100 ? '🌟 Perfect day! All goals complete.' :
             completionPct >= 70 ? '💪 Great work, keep going!' :
             completionPct >= 40 ? '📈 Good start, stay consistent.' :
             '🌱 Your journey starts with one step.'}
          </div>
          <Link to="/app/daily-log" className={styles.progressLink}>
            Update today's log →
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={styles.miniGrid}>
        {/* Latest BP */}
        <Link to="/app/blood-pressure" className={styles.miniLink}>
          {/* Border and value color come from the live BP zone, so they stay inline */}
          <div className={styles.miniCard} style={bpZone ? { borderColor: BP_ZONE_COLORS[bpZone] + '40' } : undefined}>
            <div className={styles.miniHeader}>
              <Heart size={16} color={bpZone ? BP_ZONE_COLORS[bpZone] : 'var(--text-secondary)'} />
              <span className={styles.miniLabel}>Blood Pressure</span>
            </div>
            {latestBP ? (
              <>
                <div className={styles.miniValue} style={{ color: BP_ZONE_COLORS[bpZone!] }}>
                  {latestBP.systolic}/{latestBP.diastolic}
                </div>
                <div className={styles.miniSub}>{BP_ZONE_LABELS[bpZone!]}</div>
              </>
            ) : (
              <div className={styles.miniEmpty}>No readings yet</div>
            )}
          </div>
        </Link>

        {/* Steps */}
        <Link to="/app/daily-log" className={styles.miniLink}>
          <div className={styles.miniCard}>
            <div className={styles.miniHeader}>
              <Activity size={16} color="var(--teal)" />
              <span className={styles.miniLabel}>Steps Today</span>
            </div>
            <div className={`${styles.miniValue} ${styles.miniValueTeal}`}>
              {(todayLog?.steps ?? 0).toLocaleString()}
            </div>
            <div className={styles.miniSub}>Goal: 8,000</div>
          </div>
        </Link>

        {/* Water */}
        <Link to="/app/daily-log" className={styles.miniLink}>
          <div className={styles.miniCard}>
            <div className={styles.miniHeader}>
              <Droplets size={16} color="#4b9ee0" />
              <span className={styles.miniLabel}>Water (oz)</span>
            </div>
            <div className={`${styles.miniValue} ${styles.miniValueBlue}`}>
              {todayLog?.water_oz ?? 0}
            </div>
            <div className={styles.miniSub}>Goal: 64 oz</div>
          </div>
        </Link>

        {/* Energy */}
        <Link to="/app/daily-log" className={styles.miniLink}>
          <div className={styles.miniCard}>
            <div className={styles.miniHeader}>
              <Zap size={16} color="var(--gold)" />
              <span className={styles.miniLabel}>Energy Level</span>
            </div>
            <div className={`${styles.miniValue} ${styles.miniValueGold}`}>
              {todayLog?.energy_level ?? '-'}{todayLog?.energy_level ? '/10' : ''}
            </div>
            <div className={styles.miniSub}>Self-reported</div>
          </div>
        </Link>

        {/* Blood Sugar */}
        <Link to="/app/blood-sugar" className={styles.miniLink}>
          {/* Border and value color come from the live BS zone, so they stay inline */}
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
            { to: '/app/meal-guard', icon: Shield, label: 'AI Meal Guard', color: 'var(--gold)' },
            { to: '/app/daily-log', icon: ClipboardList, label: 'Daily Log', color: 'var(--teal)' },
            { to: '/app/protocol', icon: BookOpen, label: 'My Protocol', color: '#9b59b6' },
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

      {/* Disclaimer */}
      <div className={styles.disclaimerBox}>
        <p className={styles.disclaimerText}>
          <strong>Educational Purposes Only.</strong> This platform provides health education and lifestyle tracking tools. It does not constitute medical advice, diagnosis, or treatment. Dr. Shallanda Hunter, PharmD operates as a Functional Medicine Educator. Always consult your licensed healthcare provider before making changes to your health regimen.
        </p>
      </div>

      {/* Late Slip Modal */}
      {showLateSlip && (
        <LateSlipModal
          onSubmit={async (reason) => {
            const { data: { user } } = await supabase.auth.getUser()
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

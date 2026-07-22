import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import { format, parseISO, isValid, startOfMonth, differenceInDays } from 'date-fns'
import styles from './Client.module.css'

function fmtDate(d: string | null): string {
  if (!d) return ''
  try {
    const parsed = d.includes('T') ? parseISO(d) : new Date(d + 'T00:00:00')
    return isValid(parsed) ? format(parsed, 'MMM d') : ''
  } catch { return '' }
}

function bpZone(sys: number, dia: number): { label: string; color: string } {
  if (sys < 120 && dia < 80)  return { label: 'OPTIMAL',  color: '#0B9E8E' }
  if (sys < 130 && dia < 80)  return { label: 'ELEVATED', color: '#c8a74b' }
  if (sys < 140 || dia < 90)  return { label: 'HIGH',     color: '#e07b5a' }
  return                              { label: 'STAGE 2',  color: '#c0392b' }
}

function ScoreRing({ score, color, size = 90 }: { score: number; color: string; size?: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SnapshotPage() {
  const { user } = useAuthStore()
  const { isAtLeast } = usePlan()
  const isPaid = isAtLeast('foundation')
  const today = new Date()
  const monthStart = startOfMonth(today)
  const daysElapsed = differenceInDays(today, monthStart) + 1

  const [loading, setLoading] = useState(true)
  const [logCount, setLogCount]     = useState(0)
  const [logDates, setLogDates]     = useState<string[]>([])
  const [bpReadings, setBpReadings] = useState<{ systolic: number; diastolic: number; logged_at: string }[]>([])
  const [bsLatest, setBsLatest]     = useState<{ glucose_mg_dl: number; logged_at: string } | null>(null)
  const [bsCount, setBsCount]       = useState(0)
  const [weightReadings, setWeightReadings] = useState<{ weight_lbs: number; logged_at: string }[]>([])
  const [suppCount, setSuppCount]   = useState(0)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [lastWorkout, setLastWorkout]   = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    const uid = user.id
    const monthStr = format(monthStart, 'yyyy-MM-dd')
    ;(async () => {
      const [
        lgDates, lgCount,
        bpR,
        bsR, bsC,
        wtR,
        spC,
        wkR, wkC,
      ] = await Promise.all([
        supabase.from('daily_logs').select('log_date').eq('user_id', uid).gte('log_date', monthStr).order('log_date', { ascending: false }),
        supabase.from('daily_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('blood_pressure_logs').select('systolic,diastolic,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(14),
        supabase.from('blood_sugar_logs').select('glucose_mg_dl,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1),
        supabase.from('blood_sugar_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('weight_logs').select('weight_lbs,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(7),
        supabase.from('supplement_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('workout_sessions').select('session_date').eq('user_id', uid).gte('session_date', monthStr).order('session_date', { ascending: false }),
        supabase.from('workout_sessions').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('session_date', monthStr),
      ])

      setLogDates((lgDates.data ?? []).map(r => r.log_date))
      setLogCount(lgCount.count ?? 0)
      setBpReadings(bpR.data ?? [])
      setBsLatest(bsR.data?.[0] ?? null)
      setBsCount(bsC.count ?? 0)
      setWeightReadings(wtR.data ?? [])
      setSuppCount(spC.count ?? 0)
      setWorkoutCount(wkC.count ?? 0)
      setLastWorkout(wkR.data?.[0]?.session_date ?? null)
      setLoading(false)
    })()
  }, [user?.id])

  const consistencyScore = Math.round((logDates.length / daysElapsed) * 100)
  const consistencyStatus =
    consistencyScore >= 80 ? { label: 'ON TRACK',   color: '#0B9E8E' } :
    consistencyScore >= 50 ? { label: 'BUILDING',   color: '#c8a74b' } :
                             { label: 'GETTING STARTED', color: '#888' }

  const latestBp = bpReadings[0] ?? null
  const bpZoneInfo = latestBp ? bpZone(latestBp.systolic, latestBp.diastolic) : null

  const bpMax = bpReadings.length ? Math.max(...bpReadings.map(r => r.systolic)) : 0
  const bpSparkBars = [...bpReadings].reverse().slice(-10)

  const weightLatest  = weightReadings[0]
  const weightPrev    = weightReadings[4]
  const weightTrend   = weightLatest && weightPrev
    ? weightLatest.weight_lbs < weightPrev.weight_lbs ? 'down'
    : weightLatest.weight_lbs > weightPrev.weight_lbs ? 'up' : 'same'
    : null
  const weightDelta   = weightLatest && weightPrev
    ? Math.abs(weightLatest.weight_lbs - weightPrev.weight_lbs).toFixed(1)
    : null

  if (loading) {
    return (
      <div className={styles.snapshotShell}>
        <div className={styles.snapshotHeroRow}>
          {[1, 2, 3].map(i => <div key={i} className={styles.snapshotHeroSkeleton} />)}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.snapshotShell}>
      <div className={styles.snapshotPageHeader}>
        <h1 className={styles.snapshotTitle}>Your Pattern Snapshot</h1>
        <p className={styles.snapshotSub}>Everything you have been tracking, in one place.</p>
      </div>

      {/* HERO ROW — 3 score cards */}
      <div className={styles.snapshotHeroRow}>

        {/* Consistency Score */}
        <div className={styles.snapshotHeroCard}>
          <div className={styles.snapshotHeroTopRow}>
            <div>
              <div className={styles.snapshotHeroEyebrow}>Consistency Score</div>
              <div className={styles.snapshotHeroCaption}>Daily log · this month</div>
            </div>
            <span className={styles.snapshotBadge} style={{ background: consistencyStatus.color + '22', color: consistencyStatus.color }}>
              {consistencyStatus.label}
            </span>
          </div>
          <div className={styles.snapshotRingRow}>
            <div className={styles.snapshotRingWrap}>
              <ScoreRing score={consistencyScore} color={consistencyStatus.color} />
              <div className={styles.snapshotRingCenter}>
                <span className={styles.snapshotRingNum}>{consistencyScore}</span>
                <span className={styles.snapshotRingUnit}>/ 100</span>
              </div>
            </div>
            <div className={styles.snapshotHeroStats}>
              <div className={styles.snapshotHeroStat}>
                <span className={styles.snapshotHeroStatNum}>{logDates.length}</span>
                <span className={styles.snapshotHeroStatLabel}>days logged</span>
              </div>
              <div className={styles.snapshotHeroStat}>
                <span className={styles.snapshotHeroStatNum}>{daysElapsed}</span>
                <span className={styles.snapshotHeroStatLabel}>days this month</span>
              </div>
              <div className={styles.snapshotHeroStat}>
                <span className={styles.snapshotHeroStatNum}>{logCount}</span>
                <span className={styles.snapshotHeroStatLabel}>total logs ever</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className={styles.snapshotHeroCard}>
          <div className={styles.snapshotHeroTopRow}>
            <div>
              <div className={styles.snapshotHeroEyebrow}>Blood Pressure</div>
              <div className={styles.snapshotHeroCaption}>Compared with normal baseline</div>
            </div>
            {bpZoneInfo && (
              <span className={styles.snapshotBadge} style={{ background: bpZoneInfo.color + '22', color: bpZoneInfo.color }}>
                {bpZoneInfo.label}
              </span>
            )}
          </div>
          {latestBp ? (
            <>
              <div className={styles.snapshotBpBig}>
                <span className={styles.snapshotBpNum}>{latestBp.systolic}<span className={styles.snapshotBpSep}>/</span>{latestBp.diastolic}</span>
                <span className={styles.snapshotBpUnit}>mmHg</span>
              </div>
              <div className={styles.snapshotSparkCaption}>{bpReadings.length} readings · last logged {fmtDate(latestBp.logged_at)}</div>
              {bpSparkBars.length > 1 && (
                <div className={styles.snapshotSparkRow}>
                  {bpSparkBars.map((r, i) => {
                    const pct = bpMax > 0 ? Math.round((r.systolic / bpMax) * 100) : 50
                    const zone = bpZone(r.systolic, r.diastolic)
                    return (
                      <div key={i} className={styles.snapshotSparkBarWrap} title={`${r.systolic}/${r.diastolic} · ${fmtDate(r.logged_at)}`}>
                        <div className={styles.snapshotSparkBar} style={{ height: `${pct}%`, background: zone.color }} />
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className={styles.snapshotEmptyHero}>
              <span className={styles.snapshotEmptyMsg}>No readings yet</span>
              <Link to="/app/blood-pressure" className={styles.snapshotEmptyLink}>Log your first reading</Link>
            </div>
          )}
        </div>

        {/* Workout this month */}
        <div className={styles.snapshotHeroCard}>
          <div className={styles.snapshotHeroTopRow}>
            <div>
              <div className={styles.snapshotHeroEyebrow}>Movement</div>
              <div className={styles.snapshotHeroCaption}>Workouts this month</div>
            </div>
            {workoutCount > 0 && (
              <span className={styles.snapshotBadge} style={{ background: '#0B9E8E22', color: '#0B9E8E' }}>
                ACTIVE
              </span>
            )}
          </div>
          {workoutCount > 0 ? (
            <>
              <div className={styles.snapshotRingRow}>
                <div className={styles.snapshotRingWrap}>
                  <ScoreRing score={Math.min(Math.round((workoutCount / 12) * 100), 100)} color="#0B9E8E" />
                  <div className={styles.snapshotRingCenter}>
                    <span className={styles.snapshotRingNum}>{workoutCount}</span>
                    <span className={styles.snapshotRingUnit}>sessions</span>
                  </div>
                </div>
                <div className={styles.snapshotHeroStats}>
                  <div className={styles.snapshotHeroStat}>
                    <span className={styles.snapshotHeroStatLabel}>Last workout</span>
                    <span className={styles.snapshotHeroStatNum} style={{ fontSize: '0.9rem' }}>{lastWorkout ? fmtDate(lastWorkout) : '—'}</span>
                  </div>
                  <div className={styles.snapshotHeroStat}>
                    <span className={styles.snapshotHeroStatLabel}>Goal</span>
                    <span className={styles.snapshotHeroStatNum} style={{ fontSize: '0.9rem' }}>12 / month</span>
                  </div>
                </div>
              </div>
              <Link to="/app/workout-tracker" className={styles.snapshotTileLink}>Go to Workout Tracker</Link>
            </>
          ) : (
            <div className={styles.snapshotEmptyHero}>
              <span className={styles.snapshotEmptyMsg}>No workouts logged yet</span>
              <Link to="/app/workout-tracker" className={styles.snapshotEmptyLink}>Start your first workout</Link>
            </div>
          )}
        </div>
      </div>

      {/* SECOND ROW — Blood Sugar + Weight + Supplements */}
      <div className={styles.snapshotMidRow}>

        {/* Blood Sugar */}
        <div className={styles.snapshotMidCard}>
          <div className={styles.snapshotMidHeader}>
            <span className={styles.snapshotMidEyebrow}>Blood Sugar</span>
            {bsCount > 0 && <span className={styles.snapshotMidCount}>{bsCount} readings</span>}
          </div>
          {bsLatest ? (
            <>
              <div className={styles.snapshotMidBig}>{bsLatest.glucose_mg_dl} <span className={styles.snapshotMidUnit}>mg/dL</span></div>
              <div className={styles.snapshotMidMeta}>Latest · {fmtDate(bsLatest.logged_at)}</div>
              <Link to="/app/blood-sugar" className={styles.snapshotTileLink}>View history</Link>
            </>
          ) : (
            <>
              <div className={styles.snapshotMidEmpty}>Nothing logged yet</div>
              <Link to="/app/blood-sugar" className={styles.snapshotEmptyLink}>Log your first reading</Link>
            </>
          )}
        </div>

        {/* Weight */}
        <div className={styles.snapshotMidCard}>
          <div className={styles.snapshotMidHeader}>
            <span className={styles.snapshotMidEyebrow}>Weight</span>
            {weightReadings.length > 0 && <span className={styles.snapshotMidCount}>{weightReadings.length} entries</span>}
          </div>
          {weightLatest ? (
            <>
              <div className={styles.snapshotMidBig}>
                {weightLatest.weight_lbs} <span className={styles.snapshotMidUnit}>lbs</span>
                {weightTrend === 'down' && <span className={styles.snapshotTrendDown}> ↓ {weightDelta}</span>}
                {weightTrend === 'up'   && <span className={styles.snapshotTrendUp}>   ↑ {weightDelta}</span>}
              </div>
              <div className={styles.snapshotMidMeta}>Latest · {fmtDate(weightLatest.logged_at)}</div>
              {weightReadings.length > 1 && (
                <div className={styles.snapshotWeightBars}>
                  {[...weightReadings].reverse().map((w, i) => {
                    const mn = Math.min(...weightReadings.map(x => x.weight_lbs))
                    const mx = Math.max(...weightReadings.map(x => x.weight_lbs))
                    const range = mx - mn || 1
                    const pct = 30 + Math.round(((w.weight_lbs - mn) / range) * 60)
                    return <div key={i} className={styles.snapshotWeightBar} style={{ height: `${pct}%` }} title={`${w.weight_lbs} lbs · ${fmtDate(w.logged_at)}`} />
                  })}
                </div>
              )}
              <Link to="/app/weight" className={styles.snapshotTileLink}>View history</Link>
            </>
          ) : (
            <>
              <div className={styles.snapshotMidEmpty}>Nothing logged yet</div>
              <Link to="/app/weight" className={styles.snapshotEmptyLink}>Log your first entry</Link>
            </>
          )}
        </div>

        {/* Supplements */}
        <div className={styles.snapshotMidCard}>
          <div className={styles.snapshotMidHeader}>
            <span className={styles.snapshotMidEyebrow}>Supplements</span>
            {suppCount > 0 && <span className={styles.snapshotMidCount}>{suppCount} logs total</span>}
          </div>
          {suppCount > 0 ? (
            <>
              <div className={styles.snapshotMidBig}>{suppCount} <span className={styles.snapshotMidUnit}>entries</span></div>
              <div className={styles.snapshotMidMeta}>Supplement log history</div>
              <Link to="/app/supplements" className={styles.snapshotTileLink}>View history</Link>
            </>
          ) : (
            <>
              <div className={styles.snapshotMidEmpty}>Nothing logged yet</div>
              <Link to="/app/supplements" className={styles.snapshotEmptyLink}>Log your first supplement</Link>
            </>
          )}
        </div>
      </div>

      {/* UPGRADE CARD for free users with data */}
      {!isPaid && (logDates.length > 0 || bpReadings.length > 0) && (
        <div className={styles.snapshotUpgradeCard}>
          <div className={styles.snapshotUpgradeEmoji}>📈</div>
          <div className={styles.snapshotUpgradeBody}>
            <strong>You are building your picture.</strong> Foundation membership unlocks trend charts, the Weekly Grade report, and the full ROOTS curriculum so you can understand what your numbers are telling you.
          </div>
          <a href="/#pricing" className={styles.snapshotUpgradeCta}>See Foundation — $37/mo</a>
        </div>
      )}

      <p className={styles.footerNote}>All data is private to you and your educator.</p>
    </div>
  )
}

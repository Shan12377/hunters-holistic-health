import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'
import { format, parseISO, isValid } from 'date-fns'
import styles from './Client.module.css'

interface Stat {
  count: number
  latest: string | null
  latestDate: string | null
}

const EMPTY: Stat = { count: 0, latest: null, latestDate: null }

function fmtDate(d: string | null): string {
  if (!d) return ''
  try {
    const parsed = d.includes('T') ? parseISO(d) : new Date(d + 'T00:00:00')
    return isValid(parsed) ? format(parsed, 'MMM d') : ''
  } catch { return '' }
}

export default function SnapshotPage() {
  const { user } = useAuthStore()
  const { isAtLeast } = usePlan()
  const isPaid = isAtLeast('foundation')

  const [stats, setStats] = useState({
    bp:     EMPTY,
    bs:     EMPTY,
    weight: EMPTY,
    log:    EMPTY,
    supps:  EMPTY,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    const uid = user.id
    ;(async () => {
      const [
        bpR, bpC,
        bsR, bsC,
        wtR, wtC,
        lgR, lgC,
        spR, spC,
      ] = await Promise.all([
        supabase.from('blood_pressure_logs').select('systolic,diastolic,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1),
        supabase.from('blood_pressure_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('blood_sugar_logs').select('glucose_mg_dl,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1),
        supabase.from('blood_sugar_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('weight_logs').select('weight_lbs,logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1),
        supabase.from('weight_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('daily_logs').select('log_date').eq('user_id', uid).order('log_date', { ascending: false }).limit(1),
        supabase.from('daily_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('supplement_logs').select('logged_at').eq('user_id', uid).order('logged_at', { ascending: false }).limit(1),
        supabase.from('supplement_logs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      ])

      const bp0 = bpR.data?.[0]
      const bs0 = bsR.data?.[0]
      const wt0 = wtR.data?.[0]
      const lg0 = lgR.data?.[0]
      const sp0 = spR.data?.[0]

      setStats({
        bp:     { count: bpC.count ?? 0, latest: bp0 ? `${bp0.systolic}/${bp0.diastolic} mmHg` : null, latestDate: bp0?.logged_at ?? null },
        bs:     { count: bsC.count ?? 0, latest: bs0 ? `${bs0.glucose_mg_dl} mg/dL` : null,            latestDate: bs0?.logged_at ?? null },
        weight: { count: wtC.count ?? 0, latest: wt0 ? `${wt0.weight_lbs} lbs` : null,                  latestDate: wt0?.logged_at ?? null },
        log:    { count: lgC.count ?? 0, latest: lg0 ? 'Day logged' : null,                              latestDate: lg0?.log_date  ?? null },
        supps:  { count: spC.count ?? 0, latest: sp0 ? 'Logged' : null,                                  latestDate: sp0?.logged_at ?? null },
      })
      setLoading(false)
    })()
  }, [user?.id])

  const TILES = [
    { key: 'bp',     icon: '♥', label: 'Blood Pressure', unit: 'readings', stat: stats.bp,     href: '/app/blood-pressure', hint: 'Log your first reading' },
    { key: 'bs',     icon: '◉', label: 'Blood Sugar',    unit: 'readings', stat: stats.bs,     href: '/app/blood-sugar',    hint: 'Log your first reading' },
    { key: 'weight', icon: '⚖', label: 'Weight',         unit: 'entries',  stat: stats.weight, href: '/app/weight',         hint: 'Log your first entry' },
    { key: 'log',    icon: '✓', label: 'Daily Log',      unit: 'days',     stat: stats.log,    href: '/app/daily-log',      hint: 'Start your daily check-in' },
    { key: 'supps',  icon: '⬡', label: 'Supplements',    unit: 'entries',  stat: stats.supps,  href: '/app/supplements',    hint: 'Log your first supplement' },
  ]

  const totalEntries = TILES.reduce((s, t) => s + t.stat.count, 0)

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>Your Pattern Snapshot</h1>
        <p className={styles.snapshotSub}>Everything you have been tracking, in one place.</p>
      </div>

      {loading ? (
        <div className={styles.snapshotGrid}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.snapshotTileSkeleton} />)}
        </div>
      ) : (
        <div className={styles.snapshotGrid}>
          {TILES.map(tile => (
            <div key={tile.key} className={styles.snapshotTile}>
              <div className={styles.snapshotTileHeader}>
                <span className={styles.snapshotTileIcon}>{tile.icon}</span>
                <span className={styles.snapshotTileLabel}>{tile.label}</span>
              </div>
              {tile.stat.count > 0 ? (
                <>
                  <div className={styles.snapshotTileCount}>
                    {tile.stat.count}
                    <span className={styles.snapshotTileUnit}> {tile.unit}</span>
                  </div>
                  {tile.stat.latest && (
                    <div className={styles.snapshotTileLatest}>
                      Latest: <strong>{tile.stat.latest}</strong>
                      {tile.stat.latestDate && (
                        <span className={styles.snapshotTileDate}> · {fmtDate(tile.stat.latestDate)}</span>
                      )}
                    </div>
                  )}
                  <Link to={tile.href} className={styles.snapshotTileLink}>View history</Link>
                </>
              ) : (
                <>
                  <div className={styles.snapshotTileEmpty}>Nothing logged yet</div>
                  <Link to={tile.href} className={styles.snapshotTileLinkEmpty}>{tile.hint}</Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!isPaid && !loading && totalEntries > 0 && (
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

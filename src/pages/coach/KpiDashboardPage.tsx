import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './KpiDashboardPage.module.css'

interface TierStat {
  key: string
  label: string
  count: number
  mrr: number
  isOneTime: boolean
}

interface AppsByStatus {
  [status: string]: number
}

interface KpiData {
  tiers: TierStat[]
  totalMembers: number
  mrr: number
  overhaulRevenue: number
  appsThisMonth: number
  appsTotal90: number
  appsApproved90: number
  appsByStatus: AppsByStatus
}

const TIER_CONFIG: { key: string; label: string; price: number; isOneTime: boolean; match: string[] }[] = [
  { key: 'overhaul',   label: '6-Month Overhaul', price: 4997, isOneTime: true,  match: ['overhaul'] },
  { key: 'intensive',  label: 'VIP Intensive',     price: 997,  isOneTime: false, match: ['intensive', 'vip'] },
  { key: 'program',    label: 'The Program',       price: 97,   isOneTime: false, match: ['program'] },
  { key: 'foundation', label: 'Foundation',        price: 37,   isOneTime: false, match: ['foundation'] },
]

function classifyPlan(plan: string | null): string {
  if (!plan) return ''
  const p = plan.toLowerCase()
  for (const tier of TIER_CONFIG) {
    if (tier.match.some(m => p.includes(m))) return tier.key
  }
  return ''
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  approved: 'Approved',
  declined: 'Declined',
  waitlisted: 'Waitlisted',
}

export default function KpiDashboardPage() {
  const [data, setData] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => { void fetchKpis() }, [])

  async function fetchKpis() {
    setLoading(true)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const [profilesRes, appsMonthRes, apps90Res] = await Promise.all([
      supabase.from('profiles').select('plan').not('plan', 'is', null),
      supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
      supabase.from('applications').select('status').gte('created_at', ninetyDaysAgo),
    ])

    const tierCounts: Record<string, number> = {}
    for (const row of profilesRes.data ?? []) {
      const key = classifyPlan(row.plan as string | null)
      if (key) tierCounts[key] = (tierCounts[key] ?? 0) + 1
    }

    const tiers: TierStat[] = TIER_CONFIG.map(cfg => ({
      key: cfg.key,
      label: cfg.label,
      count: tierCounts[cfg.key] ?? 0,
      mrr: cfg.isOneTime ? 0 : (tierCounts[cfg.key] ?? 0) * cfg.price,
      isOneTime: cfg.isOneTime,
    }))

    const mrr = tiers.filter(t => !t.isOneTime).reduce((s, t) => s + t.mrr, 0)
    const overhaulCount = tierCounts['overhaul'] ?? 0
    const totalMembers = tiers.reduce((s, t) => s + t.count, 0)

    const apps90 = apps90Res.data ?? []
    const appsByStatus: AppsByStatus = {}
    for (const a of apps90) {
      const st = a.status as string
      appsByStatus[st] = (appsByStatus[st] ?? 0) + 1
    }

    setData({
      tiers,
      totalMembers,
      mrr,
      overhaulRevenue: overhaulCount * 4997,
      appsThisMonth: appsMonthRes.count ?? 0,
      appsTotal90: apps90.length,
      appsApproved90: appsByStatus['approved'] ?? 0,
      appsByStatus,
    })
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }

  const conversionRate = data && data.appsTotal90 > 0
    ? Math.round((data.appsApproved90 / data.appsTotal90) * 100)
    : 0

  const maxCount = data ? Math.max(...data.tiers.map(t => t.count), 1) : 1

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Business KPIs</h1>
          <p className={styles.sub}>Live data from Supabase{lastUpdated ? ` — updated ${lastUpdated}` : ''}</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => void fetchKpis()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingMsg}>Loading metrics...</div>
      ) : data ? (
        <div className={styles.body}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{data.totalMembers}</div>
              <div className={styles.statLabel}>Active Members</div>
              <div className={styles.statNote}>Paid plans on record</div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardGreen}`}>
              <div className={styles.statValue}>${data.mrr.toLocaleString()}</div>
              <div className={styles.statLabel}>Monthly Recurring Revenue</div>
              <div className={styles.statNote}>Foundation + Program + VIP Intensive</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{data.appsThisMonth}</div>
              <div className={styles.statLabel}>Applications This Month</div>
              <div className={styles.statNote}>All statuses included</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{conversionRate}%</div>
              <div className={styles.statLabel}>Conversion Rate</div>
              <div className={styles.statNote}>Approved / total, last 90 days</div>
            </div>
          </div>

          {data.overhaulRevenue > 0 && (
            <div className={styles.overhaulBanner}>
              <span className={styles.overhaulLabel}>6-Month Overhaul</span>
              <span className={styles.overhaulValue}>${data.overhaulRevenue.toLocaleString()} one-time revenue on record</span>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Members by Tier</h2>
            <div className={styles.tierList}>
              {data.tiers.map(t => (
                <div key={t.key} className={styles.tierRow}>
                  <div className={styles.tierLabel}>{t.label}</div>
                  <div className={styles.tierBarWrap}>
                    <div
                      className={styles.tierBar}
                      style={{ width: `${Math.max(2, Math.round((t.count / maxCount) * 100))}%` }}
                    />
                  </div>
                  <div className={styles.tierCount}>{t.count} members</div>
                  <div className={styles.tierRevenue}>
                    {t.isOneTime
                      ? <span className={styles.oneTimeLabel}>one-time</span>
                      : <>${t.mrr.toLocaleString()}/mo</>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(data.appsByStatus).length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Applications Pipeline — Last 90 Days</h2>
              <div className={styles.statusGrid}>
                {Object.entries(data.appsByStatus)
                  .sort(([a], [b]) => {
                    const order = ['new', 'reviewing', 'approved', 'waitlisted', 'declined']
                    return order.indexOf(a) - order.indexOf(b)
                  })
                  .map(([status, count]) => (
                    <div key={status} className={`${styles.statusCard} ${styles[`s_${status}`] ?? ''}`}>
                      <div className={styles.statusCount}>{count}</div>
                      <div className={styles.statusLabel}>{STATUS_LABELS[status] ?? status}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

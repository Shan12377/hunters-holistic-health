import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Activity, AlertTriangle, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import type { DailyLog } from '@/types'
import { calcGrade, scoreWeek, scoreWeekProjected } from '@/lib/grading'
import { calcSupplementAdherence } from '@/lib/adherence'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'
import shared from '../../styles/shared.module.css'

function gradeToNum(grade: string): number {
  const map: Record<string, number> = { 'A+': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 }
  return map[grade] ?? 0
}

interface ClientSummary {
  id: string
  first_name: string
  last_name: string
  age: number | null
  display_handle: string | null
  latest_bp: { systolic: number; diastolic: number } | null
  today_completion: number
  streak: number
  last_active: string | null
  projected_grade: string
  projected_grade_color: string
  projected_score: number
  last_week_grade: string
  at_risk: boolean
  supp_adherence: number    // 0–100, or -1 if no active supplements
  low_adherence: boolean
}

interface CohortStats {
  avgProjectedScore: number
  fastingPct: number
  avgSteps: number
  topGradeCount: number
  avgEnergy: number
}

interface ProgramCohort {
  id: string
  name: string
  starts_on: string
  ends_on: string
  cohort_members: { user_id: string }[]
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [cohortStats, setCohortStats] = useState<CohortStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [programCohorts, setProgramCohorts] = useState<ProgramCohort[]>([])
  const [showCohortForm, setShowCohortForm] = useState(false)
  const [cohortForm, setCohortForm] = useState({ name: '', starts_on: '', ends_on: '' })
  const [cohortMemberIds, setCohortMemberIds] = useState<string[]>([])
  const [savingCohort, setSavingCohort] = useState(false)

  useEffect(() => { fetchClients(); fetchCohorts() }, [])

  const fetchClients = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('last_name')

    if (!profiles) { setLoading(false); return }

    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const lastWeekStart = format(startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const lastWeekEnd = format(endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const suppWindowStart = format(subDays(new Date(), 13), 'yyyy-MM-dd')
    const todayDow = new Date().getDay()
    const daysElapsed = Math.max(1, todayDow === 0 ? 7 : todayDow)

    const rawSummaries = await Promise.all(
      profiles.map(async (p) => {
        const [bpRes, logsRes, suppRes, suppLogsRes] = await Promise.all([
          supabase.from('blood_pressure_logs').select('systolic,diastolic').eq('user_id', p.id).order('logged_at', { ascending: false }).limit(1).single(),
          supabase.from('daily_logs').select('*').eq('user_id', p.id).gte('log_date', thirtyDaysAgo).order('log_date', { ascending: true }),
          supabase.from('supplements').select('id,name,timing').eq('user_id', p.id).eq('active', true),
          supabase.from('supplement_logs').select('supplement_id,log_date').eq('user_id', p.id).gte('log_date', suppWindowStart),
        ])

        const allLogs = (logsRes.data as DailyLog[]) ?? []
        const thisWeekLogs = allLogs.filter(l => l.log_date >= weekStart && l.log_date <= today)
        const lastWeekLogs = allLogs.filter(l => l.log_date >= lastWeekStart && l.log_date <= lastWeekEnd)
        const todayLog = allLogs.find(l => l.log_date === today) ?? null

        let streak = 0
        const logDates = allLogs.map(l => l.log_date)
        for (let i = 0; i < 30; i++) {
          const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd')
          if (logDates.includes(checkDate)) streak++
          else break
        }

        let completion = 0
        if (todayLog) {
          const l = todayLog
          const items = [l.morning_fast_done, l.meal1_logged, l.meal2_logged, l.supplement_am_done, l.supplement_pm_done, (l.steps ?? 0) >= 5000, (l.water_oz ?? 0) >= 64]
          completion = Math.round(items.filter(Boolean).length / items.length * 100)
        }

        const hasLogsThisWeek = thisWeekLogs.length > 0
        const projectedScore = hasLogsThisWeek ? scoreWeekProjected(thisWeekLogs, daysElapsed) : 0
        const projected = hasLogsThisWeek
          ? calcGrade(projectedScore)
          : { grade: 'N/A', color: '#91a0ac', message: '' }
        const lastWeekScore = scoreWeek(lastWeekLogs).score
        const lastWeekGradeResult = calcGrade(lastWeekScore)
        const at_risk = hasLogsThisWeek && gradeToNum(projected.grade) < gradeToNum(lastWeekGradeResult.grade)

        const supps = (suppRes.data ?? []) as { id: string; name: string; timing: string }[]
        const suppLogs = (suppLogsRes.data ?? []) as { supplement_id: string; log_date: string }[]
        const adhrResult = supps.length > 0 ? calcSupplementAdherence(supps, suppLogs) : null
        const supp_adherence = adhrResult ? adhrResult.overall : -1
        const low_adherence = supp_adherence >= 0 && supp_adherence < 60

        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          age: p.age,
          display_handle: p.display_handle,
          latest_bp: bpRes.data ? { systolic: bpRes.data.systolic, diastolic: bpRes.data.diastolic } : null,
          today_completion: completion,
          streak,
          last_active: allLogs[allLogs.length - 1]?.log_date ?? null,
          projected_grade: projected.grade,
          projected_grade_color: projected.color,
          projected_score: projectedScore,
          last_week_grade: lastWeekGradeResult.grade,
          at_risk,
          supp_adherence,
          low_adherence,
          thisWeekLogs,
        }
      })
    )

    // Cohort aggregates (de-identified, no individual names)
    const allThisWeekLogs = rawSummaries.flatMap(s => s.thisWeekLogs)
    const energyLogs = allThisWeekLogs.filter(l => l.energy_level !== null)
    const cs: CohortStats = {
      avgProjectedScore: rawSummaries.length
        ? Math.round(rawSummaries.reduce((a, s) => a + s.projected_score, 0) / rawSummaries.length)
        : 0,
      fastingPct: allThisWeekLogs.length
        ? Math.round(allThisWeekLogs.filter(l => l.morning_fast_done).length / allThisWeekLogs.length * 100)
        : 0,
      avgSteps: allThisWeekLogs.length
        ? Math.round(allThisWeekLogs.reduce((a, l) => a + (l.steps ?? 0), 0) / allThisWeekLogs.length)
        : 0,
      topGradeCount: rawSummaries.filter(s => s.projected_grade === 'A+' || s.projected_grade === 'A').length,
      avgEnergy: energyLogs.length
        ? Math.round(energyLogs.reduce((a, l) => a + (l.energy_level ?? 0), 0) / energyLogs.length * 10) / 10
        : 0,
    }

    const summaries: ClientSummary[] = rawSummaries.map(({ thisWeekLogs: _omit, ...rest }) => rest)
    setClients(summaries)
    setCohortStats(cs)
    setLoading(false)
  }

  const fetchCohorts = async () => {
    const { data } = await supabase
      .from('cohorts')
      .select('id, name, starts_on, ends_on, cohort_members(user_id)')
      .order('starts_on', { ascending: false })
    setProgramCohorts((data ?? []) as unknown as ProgramCohort[])
  }

  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cohortForm.name.trim() || !cohortForm.starts_on || !cohortForm.ends_on) return
    setSavingCohort(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: newCohort, error } = await supabase
      .from('cohorts')
      .insert({
        name: cohortForm.name.trim(),
        starts_on: cohortForm.starts_on,
        ends_on: cohortForm.ends_on,
        created_by: user?.id ?? null,
      })
      .select()
      .single()
    if (error || !newCohort) {
      toast.error('Failed to create cohort.')
      setSavingCohort(false)
      return
    }
    if (cohortMemberIds.length > 0) {
      const { error: membersError } = await supabase.from('cohort_members').insert(
        cohortMemberIds.map(uid => ({ cohort_id: newCohort.id, user_id: uid }))
      )
      if (membersError) toast.error('Cohort created, but member assignment failed. Try editing from the database.')
    }
    toast.success('Cohort created!')
    setCohortForm({ name: '', starts_on: '', ends_on: '' })
    setCohortMemberIds([])
    setShowCohortForm(false)
    setSavingCohort(false)
    fetchCohorts()
  }

  const filtered = clients
    .filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.display_handle ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.at_risk && !b.at_risk) return -1
      if (!a.at_risk && b.at_risk) return 1
      return 0
    })

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.streak > 0).length,
    needsAttention: clients.filter(c => c.today_completion < 40).length,
    highBP: clients.filter(c => c.latest_bp && (c.latest_bp.systolic >= 140 || c.latest_bp.diastolic >= 90)).length,
    atRisk: clients.filter(c => c.at_risk).length,
    lowAdherence: clients.filter(c => c.low_adherence).length,
  }

  const downloadOutcomesReport = () => {
    if (!cohortStats) return
    const dateStr = format(new Date(), 'MMMM d, yyyy')
    const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')
    const weekEndStr = format(new Date(), 'MMM d, yyyy')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Program Outcomes Report - Hunter's Holistic Health</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0e1c1b; color: #f7f7f7; padding: 24px; max-width: 860px; margin: 0 auto; }
  .kicker { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #0b9e8e; margin-bottom: 4px; }
  h1 { font-size: 26px; font-weight: 700; color: #c8a74b; margin-bottom: 4px; }
  .sub { font-size: 14px; color: #91a0ac; margin-bottom: 28px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .stat { background: #13211f; border: 1px solid #1f3331; border-radius: 10px; padding: 20px; text-align: center; }
  .stat-val { font-size: 32px; font-weight: 700; color: #c8a74b; }
  .stat-label { font-size: 12px; color: #91a0ac; margin-top: 6px; }
  .section { background: #13211f; border: 1px solid #1f3331; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .section-title { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #91a0ac; margin-bottom: 14px; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .bar-label { font-size: 13px; color: #91a0ac; width: 190px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 8px; background: #1f3331; border-radius: 4px; }
  .bar-fill { height: 100%; border-radius: 4px; background: #0b9e8e; }
  .bar-value { font-size: 13px; color: #f7f7f7; font-weight: 600; width: 60px; text-align: right; }
  .disclaimer { font-size: 11px; color: #91a0ac; line-height: 1.7; padding: 14px 16px; background: rgba(200,167,75,0.04); border: 1px solid rgba(200,167,75,0.15); border-radius: 8px; margin-top: 24px; }
</style>
</head>
<body>
<div style="margin-bottom:28px;">
  <div class="kicker">Hunter's Holistic Health</div>
  <h1>Program Outcomes Report</h1>
  <div class="sub">Week of ${weekStartStr} to ${weekEndStr} &middot; Generated ${dateStr} &middot; ${stats.total} participants &middot; De-identified aggregate data</div>
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-val">${stats.total}</div>
    <div class="stat-label">Total Participants</div>
  </div>
  <div class="stat">
    <div class="stat-val">${cohortStats.avgProjectedScore}%</div>
    <div class="stat-label">Avg Consistency Score</div>
  </div>
  <div class="stat">
    <div class="stat-val">${cohortStats.topGradeCount}</div>
    <div class="stat-label">On Track (A or A+)</div>
  </div>
  <div class="stat">
    <div class="stat-val">${stats.active}</div>
    <div class="stat-label">Active Streaks</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Habit Compliance (This Week)</div>
  <div class="bar-row">
    <div class="bar-label">Morning Fast</div>
    <div class="bar-track"><div class="bar-fill" style="width:${cohortStats.fastingPct}%"></div></div>
    <div class="bar-value">${cohortStats.fastingPct}%</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">Avg Daily Steps</div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.round(cohortStats.avgSteps / 8000 * 100))}%"></div></div>
    <div class="bar-value">${cohortStats.avgSteps.toLocaleString()}</div>
  </div>
  ${cohortStats.avgEnergy > 0 ? `<div class="bar-row">
    <div class="bar-label">Avg Energy Level</div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.round(cohortStats.avgEnergy / 10 * 100)}%"></div></div>
    <div class="bar-value">${cohortStats.avgEnergy}/10</div>
  </div>` : ''}
</div>

<div class="disclaimer">
  <strong style="color:#c8a74b;">Educational Purposes Only.</strong> This report contains de-identified, aggregated data from the Hunter's Holistic Health educational program. No individual participant data is included. This document is not a medical record and does not constitute clinical monitoring, medical advice, or treatment. Dr. Shallanda Hunter, PharmD operates as a Functional Medicine Educator.
</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HHH_Outcomes_Report_${format(new Date(), 'yyyy-MM-dd')}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Outcomes report downloaded!')
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Users size={22} color="var(--gold)" /> Educator Dashboard
        </h1>
        <p className={styles.pageTopDate}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')} · Participant Overview
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statIconGrid}>
        {[
          { label: 'Total Participants', value: stats.total, icon: Users, color: 'var(--gold)' },
          { label: 'Active Streaks', value: stats.active, icon: Activity, color: 'var(--teal)' },
          { label: 'Needs Attention', value: stats.needsAttention, icon: AlertTriangle, color: '#e0b84b' },
          { label: 'Elevated BP', value: stats.highBP, icon: TrendingUp, color: '#e05c5c' },
          { label: 'At Risk This Week', value: stats.atRisk, icon: TrendingDown, color: '#e05c5c' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={styles.statIconCard}>
            <Icon size={20} color={color} />
            {/* Stat accent color is data-driven, so it stays inline */}
            <div className={styles.statIconValue} style={{ color }}>{value}</div>
            <div className={styles.statIconLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search participants by name or handle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Client list */}
      {loading ? (
        <div className={styles.loadingText}>Loading participants...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.loadingText}>
          {clients.length === 0 ? 'No participants enrolled yet.' : 'No participants match your search.'}
        </div>
      ) : (
        <div className={styles.clientList}>
          {filtered.map(client => {
            const bpZone = client.latest_bp
              ? (client.latest_bp.systolic >= 140 || client.latest_bp.diastolic >= 90 ? 'high' :
                 client.latest_bp.systolic >= 130 || client.latest_bp.diastolic >= 80 ? 'elevated' : 'normal')
              : null
            const bpColor = bpZone === 'high' ? '#e05c5c' : bpZone === 'elevated' ? '#e0b84b' : '#4be08a'
            const completionColor = client.today_completion >= 70 ? '#4be08a' : client.today_completion >= 40 ? '#e0b84b' : '#e05c5c'

            return (
              <Link key={client.id} to={`/coach/client/${client.id}`}>
                {/* At-risk left border stays inline because it is data-driven */}
                <div
                  className={styles.clientCard}
                  style={client.at_risk ? { borderLeft: '3px solid rgba(224,92,92,0.55)' } : undefined}
                >
                  <div className={styles.clientCardInner}>
                    <div className={styles.clientAvatarLg}>
                      {client.first_name[0]}{client.last_name[0]}
                    </div>

                    <div className={styles.clientInfo}>
                      <div className={styles.clientFullName}>
                        {client.first_name} {client.last_name}
                        {client.age && <span className={styles.clientAgeInline}>Age {client.age}</span>}
                        {client.at_risk && <span className={styles.atRiskTag}>At Risk</span>}
                        {client.low_adherence && <span className={styles.lowAdherenceBadge}>Low Adherence</span>}
                      </div>
                      {client.display_handle && (
                        <div className={styles.clientHandle}>@{client.display_handle}</div>
                      )}
                    </div>

                    {/* Today's completion */}
                    <div className={styles.metricCol}>
                      {/* Color is computed from live data, so it stays inline */}
                      <div className={styles.metricValue} style={{ color: completionColor }}>
                        {client.today_completion}%
                      </div>
                      <div className={styles.metricLabel}>Today</div>
                    </div>

                    {/* Streak */}
                    <div className={styles.metricCol}>
                      <div className={styles.metricValueGold}>🔥{client.streak}</div>
                      <div className={styles.metricLabel}>Streak</div>
                    </div>

                    {/* Projected Grade */}
                    <div className={styles.metricCol}>
                      {/* Color is computed from live projected score, so it stays inline */}
                      <div className={styles.metricValue} style={{ color: client.projected_grade_color }}>
                        {client.projected_grade}
                      </div>
                      <div className={styles.metricLabel}>Projected</div>
                    </div>

                    {/* BP */}
                    <div className={styles.metricCol}>
                      {client.latest_bp ? (
                        <>
                          <div className={styles.metricValue} style={{ color: bpColor }}>
                            {client.latest_bp.systolic}/{client.latest_bp.diastolic}
                          </div>
                          <div className={styles.metricLabel}>BP</div>
                        </>
                      ) : (
                        <div className={styles.metricEmpty}>No BP</div>
                      )}
                    </div>

                    <div className={styles.statusDot} style={{ background: client.streak > 0 ? '#4be08a' : '#e05c5c' }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Cohort Management */}
      <div className={styles.cohortsSection}>
        <div className={styles.cohortsSectionHeader}>
          <h3 className={styles.cohortsSectionTitle}>Cohorts</h3>
          {!showCohortForm && (
            <button className={shared.btnSecondary} onClick={() => setShowCohortForm(true)}>
              + New Cohort
            </button>
          )}
        </div>

        {programCohorts.length === 0 && !showCohortForm && (
          <p className={styles.cohortsEmpty}>No cohorts created yet.</p>
        )}

        {programCohorts.length > 0 && (
          <div className={styles.cohortsList}>
            {programCohorts.map(c => (
              <div key={c.id} className={styles.cohortsListRow}>
                <div>
                  <div className={styles.cohortsListName}>{c.name}</div>
                  <div className={styles.cohortsListMeta}>
                    {format(new Date(c.starts_on + 'T12:00:00'), 'MMM d')} to {format(new Date(c.ends_on + 'T12:00:00'), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className={styles.cohortsListCount}>
                  {c.cohort_members.length} member{c.cohort_members.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCohortForm && (
          <div className={styles.cohortsFormCard}>
            <h4 className={styles.cohortsFormTitle}>Create New Cohort</h4>
            <form onSubmit={createCohort}>
              <div className={styles.cohortsFormFields}>
                <div>
                  <label className={styles.cohortsFormLabel}>Cohort Name</label>
                  <input
                    className={styles.cohortsInput}
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Week 1 Group"
                    value={cohortForm.name}
                    onChange={e => setCohortForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={styles.cohortsFormLabel}>Start Date</label>
                  <input
                    className={styles.cohortsInput}
                    type="date"
                    required
                    value={cohortForm.starts_on}
                    onChange={e => setCohortForm(f => ({ ...f, starts_on: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={styles.cohortsFormLabel}>End Date</label>
                  <input
                    className={styles.cohortsInput}
                    type="date"
                    required
                    value={cohortForm.ends_on}
                    onChange={e => setCohortForm(f => ({ ...f, ends_on: e.target.value }))}
                  />
                </div>
              </div>

              {clients.length > 0 && (
                <>
                  <label className={styles.cohortsCheckboxLabel}>
                    Assign Participants ({cohortMemberIds.length} selected)
                  </label>
                  <div className={styles.cohortsCheckboxList}>
                    {clients.map(c => (
                      <label key={c.id} className={styles.cohortsCheckboxItem}>
                        <input
                          type="checkbox"
                          checked={cohortMemberIds.includes(c.id)}
                          onChange={() => {
                            setCohortMemberIds(ids =>
                              ids.includes(c.id)
                                ? ids.filter(id => id !== c.id)
                                : [...ids, c.id]
                            )
                          }}
                        />
                        <span className={styles.cohortsCheckboxItemLabel}>
                          {c.first_name} {c.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.cohortsFormActions}>
                <button type="submit" className={shared.btnPrimary} disabled={savingCohort}>
                  {savingCohort ? 'Creating...' : 'Create Cohort'}
                </button>
                <button
                  type="button"
                  className={shared.btnSecondary}
                  onClick={() => {
                    setShowCohortForm(false)
                    setCohortForm({ name: '', starts_on: '', ends_on: '' })
                    setCohortMemberIds([])
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cohort Outcomes Card */}
      {!loading && cohortStats && clients.length > 0 && (
        <div className={styles.cohortCard}>
          <div className={styles.cohortCardHeader}>
            <div>
              <div className={styles.cohortCardKicker}>De-identified Program Data</div>
              <h3 className={styles.cohortCardTitle}>Program Outcomes: This Week</h3>
            </div>
            <button className={shared.btnSecondary} onClick={downloadOutcomesReport}>
              <Download size={15} /> Download Outcomes Report
            </button>
          </div>
          <div className={styles.cohortGrid}>
            {[
              { label: 'Avg Consistency Score', value: `${cohortStats.avgProjectedScore}%` },
              { label: 'Fasting Compliance', value: `${cohortStats.fastingPct}%` },
              { label: 'Avg Daily Steps', value: cohortStats.avgSteps.toLocaleString() },
              { label: 'On Track (A or A+)', value: `${cohortStats.topGradeCount} of ${clients.length}` },
            ].map(({ label, value }) => (
              <div key={label} className={styles.cohortStat}>
                <div className={styles.cohortStatValue}>{value}</div>
                <div className={styles.cohortStatLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimerBox}>
        <p className={styles.disclaimerText}>
          <strong>Educator View:</strong> Participant data is displayed for educational program monitoring purposes only. This dashboard does not constitute clinical monitoring or medical record-keeping. All data is used solely to support the educational program.
        </p>
      </div>
    </div>
  )
}

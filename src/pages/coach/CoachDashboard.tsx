import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'
import styles from './Coach.module.css'

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
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    // Fetch all client profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('last_name')

    if (!profiles) { setLoading(false); return }

    const today = format(new Date(), 'yyyy-MM-dd')
    const summaries: ClientSummary[] = await Promise.all(
      profiles.map(async (p) => {
        const [bpRes, logRes, streakRes] = await Promise.all([
          supabase.from('blood_pressure_logs').select('systolic,diastolic').eq('user_id', p.id).order('logged_at', { ascending: false }).limit(1).single(),
          supabase.from('daily_logs').select('*').eq('user_id', p.id).eq('log_date', today).single(),
          supabase.from('daily_logs').select('log_date').eq('user_id', p.id).order('log_date', { ascending: false }).limit(30),
        ])

        // Calculate streak
        let streak = 0
        if (streakRes.data) {
          const dates = streakRes.data.map((d: { log_date: string }) => d.log_date)
          for (let i = 0; i < 30; i++) {
            const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd')
            if (dates.includes(checkDate)) streak++
            else break
          }
        }

        // Calculate today's completion
        let completion = 0
        if (logRes.data) {
          const l = logRes.data
          const items = [l.morning_fast_done, l.meal1_logged, l.meal2_logged, l.supplement_am_done, l.supplement_pm_done, (l.steps ?? 0) >= 5000, (l.water_oz ?? 0) >= 64]
          completion = Math.round((items.filter(Boolean).length / items.length) * 100)
        }

        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          age: p.age,
          display_handle: p.display_handle,
          latest_bp: bpRes.data ? { systolic: bpRes.data.systolic, diastolic: bpRes.data.diastolic } : null,
          today_completion: completion,
          streak,
          last_active: streakRes.data?.[0]?.log_date ?? null,
        }
      })
    )

    setClients(summaries)
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.display_handle ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.streak > 0).length,
    needsAttention: clients.filter(c => c.today_completion < 40).length,
    highBP: clients.filter(c => c.latest_bp && (c.latest_bp.systolic >= 140 || c.latest_bp.diastolic >= 90)).length,
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
          { label: 'Active Today', value: stats.active, icon: Activity, color: 'var(--teal)' },
          { label: 'Needs Attention', value: stats.needsAttention, icon: AlertTriangle, color: '#e0b84b' },
          { label: 'Elevated BP', value: stats.highBP, icon: TrendingUp, color: '#e05c5c' },
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
                <div className={styles.clientCard}>
                  <div className={styles.clientCardInner}>
                    {/* Avatar */}
                    <div className={styles.clientAvatarLg}>
                      {client.first_name[0]}{client.last_name[0]}
                    </div>

                    {/* Name + handle */}
                    <div className={styles.clientInfo}>
                      <div className={styles.clientFullName}>
                        {client.first_name} {client.last_name}
                        {client.age && <span className={styles.clientAgeInline}>Age {client.age}</span>}
                      </div>
                      {client.display_handle && (
                        <div className={styles.clientHandle}>@{client.display_handle}</div>
                      )}
                    </div>

                    {/* Today's completion */}
                    <div className={styles.metricCol}>
                      {/* Completion color is computed from live data, so it stays inline */}
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

                    {/* Status indicator */}
                    <div className={styles.statusDot} style={{ background: client.streak > 0 ? '#4be08a' : '#e05c5c' }} />
                  </div>
                </div>
              </Link>
            )
          })}
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

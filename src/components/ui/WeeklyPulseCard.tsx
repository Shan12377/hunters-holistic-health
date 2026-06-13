import { useEffect, useState } from 'react'
import { startOfWeek, format, subDays } from 'date-fns'
import { Sparkles, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { sanitizeForPulse, type RawPulseData } from '@/lib/deidSanitizer'
import styles from '@/pages/client/Client.module.css'

interface PulseResult {
  headline: string
  insights: string[]
}

function getWeekKey(): string {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

export default function WeeklyPulseCard() {
  const { profile, user } = useAuthStore()
  const [pulse, setPulse] = useState<PulseResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) loadPulse()
  }, [user?.id])

  async function loadPulse(forceRefresh = false) {
    if (!user?.id) return
    setStatus('loading')

    const weekKey = getWeekKey()

    // Check cache first (skipped on force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('pulse_cache')
        .select('headline, insights, generated_at')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .single()

      if (cached) {
        setPulse({ headline: cached.headline, insights: cached.insights as string[] })
        setGeneratedAt(cached.generated_at as string)
        setStatus('done')
        return
      }
    }

    // Gather the last 7 days of data
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const sevenDaysAgoISO = new Date(Date.now() - 7 * 86400000).toISOString()

    const [logsRes, bpRes, bsRes] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('steps, energy_level, water_oz, morning_fast_done, supplement_am_done')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo),
      supabase
        .from('blood_pressure_logs')
        .select('systolic, diastolic')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgoISO),
      supabase
        .from('blood_sugar_logs')
        .select('glucose_mg_dl, reading_context')
        .eq('user_id', user.id)
        .gte('logged_at', sevenDaysAgoISO),
    ])

    const logs = logsRes.data ?? []

    const avgOf = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    const rawData: RawPulseData = {
      firstName: profile?.first_name ?? 'Participant',
      primaryGoal: (profile?.wellness_goals as { primary_goal?: string } | null)?.primary_goal ?? '',
      logsCompleted: logs.length,
      totalDays: 7,
      avgSteps: avgOf(logs.map(l => l.steps ?? 0).filter(n => n > 0)),
      avgWaterOz: avgOf(logs.map(l => l.water_oz ?? 0).filter(n => n > 0)),
      avgEnergy: avgOf(logs.map(l => l.energy_level ?? 0).filter(n => n > 0)),
      fastingDays: logs.filter(l => l.morning_fast_done).length,
      supplementDays: logs.filter(l => l.supplement_am_done).length,
      bpReadings: (bpRes.data ?? []).map(r => ({ systolic: r.systolic, diastolic: r.diastolic })),
      bsReadings: (bsRes.data ?? []).map(r => ({
        glucose: r.glucose_mg_dl,
        context: r.reading_context as 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime',
      })),
    }

    // De-identify locally before the data leaves the browser
    const sanitized = sanitizeForPulse(rawData)

    try {
      const apiRes = await fetch('/api/weekly-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      })

      if (!apiRes.ok) throw new Error('API error')
      const result: PulseResult = await apiRes.json()

      // Cache result in Supabase
      await supabase
        .from('pulse_cache')
        .upsert(
          {
            user_id: user.id,
            week_key: weekKey,
            headline: result.headline,
            insights: result.insights,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,week_key' }
        )

      setPulse(result)
      setGeneratedAt(new Date().toISOString())
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className={styles.pulseCard}>
        <div className={styles.pulseHeader}>
          <Sparkles size={16} color="var(--gold)" />
          <span className={styles.pulseTitle}>Weekly Pulse</span>
        </div>
        <div className={styles.pulseLoading}>
          <div className={styles.pulseLoadingSpinner} />
          <span>Analyzing your week...</span>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.pulseCard}>
        <div className={styles.pulseHeader}>
          <Sparkles size={16} color="var(--gold)" />
          <span className={styles.pulseTitle}>Weekly Pulse</span>
        </div>
        <p className={styles.pulseError}>Could not generate your pulse check. Try again later.</p>
      </div>
    )
  }

  if (!pulse) return null

  return (
    <div className={styles.pulseCard}>
      <div className={styles.pulseHeader}>
        <Sparkles size={16} color="var(--gold)" />
        <span className={styles.pulseTitle}>Weekly Pulse</span>
        <button
          className={styles.pulseRefreshBtn}
          onClick={() => loadPulse(true)}
          title="Refresh insights"
          aria-label="Refresh weekly pulse"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <p className={styles.pulseHeadline}>{pulse.headline}</p>

      <ul className={styles.pulseInsights}>
        {pulse.insights.map((insight, i) => (
          <li key={i} className={styles.pulseInsight}>
            {insight}
          </li>
        ))}
      </ul>

      {generatedAt && (
        <p className={styles.pulseFooter}>
          Generated {format(new Date(generatedAt), 'MMM d')} · refreshes each Monday
        </p>
      )}
    </div>
  )
}

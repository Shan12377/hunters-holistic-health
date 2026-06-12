import { useEffect, useState } from 'react'
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import type { DailyLog } from '@/types'
import styles from './Client.module.css'

interface WeekScore {
  weekStart: string
  weekEnd: string
  score: number
  grade: string
  logs: DailyLog[]
  breakdown: { label: string; score: number; max: number; pct: number }[]
}

function calcGrade(score: number): { grade: string; color: string; message: string } {
  if (score >= 90) return { grade: 'A+', color: '#4be08a', message: 'Outstanding! You are crushing your wellness goals.' }
  if (score >= 80) return { grade: 'A', color: '#4be08a', message: 'Excellent work! Consistency is your superpower.' }
  if (score >= 70) return { grade: 'B', color: '#c8a74b', message: 'Great effort! A few more consistent days will get you to an A.' }
  if (score >= 60) return { grade: 'C', color: '#e0b84b', message: 'Good start. Focus on one habit at a time to build momentum.' }
  if (score >= 50) return { grade: 'D', color: '#e08a4b', message: 'Keep going. Progress is not always linear; reflect and reset.' }
  return { grade: 'F', color: '#e05c5c', message: 'This week was tough. Tomorrow is a fresh start. You\'ve got this.' }
}

function scoreWeek(logs: DailyLog[]): { score: number; breakdown: WeekScore['breakdown'] } {
  if (logs.length === 0) return { score: 0, breakdown: [] }

  const days = 7
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const meal1Days = logs.filter(l => l.meal1_logged).length
  const suppAmDays = logs.filter(l => l.supplement_am_done).length
  const suppPmDays = logs.filter(l => l.supplement_pm_done).length
  const stepsDays = logs.filter(l => (l.steps ?? 0) >= 8000).length
  const waterDays = logs.filter(l => (l.water_oz ?? 0) >= 64).length
  const loggedDays = logs.length

  const breakdown = [
    { label: 'Days Logged', score: loggedDays, max: days, pct: Math.round((loggedDays / days) * 100) },
    { label: 'Morning Fast', score: fastDays, max: days, pct: Math.round((fastDays / days) * 100) },
    { label: 'Meal 1 Logged', score: meal1Days, max: days, pct: Math.round((meal1Days / days) * 100) },
    { label: 'AM Supplements', score: suppAmDays, max: days, pct: Math.round((suppAmDays / days) * 100) },
    { label: 'PM Supplements', score: suppPmDays, max: days, pct: Math.round((suppPmDays / days) * 100) },
    { label: '8,000+ Steps', score: stepsDays, max: days, pct: Math.round((stepsDays / days) * 100) },
    { label: '64oz Water', score: waterDays, max: days, pct: Math.round((waterDays / days) * 100) },
  ]

  const score = Math.round(breakdown.reduce((a, b) => a + b.pct, 0) / breakdown.length)
  return { score, breakdown }
}

export default function WeeklyGradePage() {
  const [weeks, setWeeks] = useState<WeekScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch last 4 weeks of logs
    const fourWeeksAgo = format(subDays(new Date(), 28), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', fourWeeksAgo)
      .order('log_date')

    const allLogs = (data as DailyLog[]) ?? []

    // Group by week
    const weekScores: WeekScore[] = []
    for (let w = 0; w < 4; w++) {
      const weekStart = startOfWeek(subDays(new Date(), w * 7), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(subDays(new Date(), w * 7), { weekStartsOn: 1 })
      const weekStartStr = format(weekStart, 'yyyy-MM-dd')
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd')
      const weekLogs = allLogs.filter(l => l.log_date >= weekStartStr && l.log_date <= weekEndStr)
      const { score, breakdown } = scoreWeek(weekLogs)
      weekScores.push({ weekStart: weekStartStr, weekEnd: weekEndStr, score, grade: calcGrade(score).grade, logs: weekLogs, breakdown })
    }

    setWeeks(weekScores)
    setLoading(false)
  }

  const currentWeek = weeks[0]
  const lastWeek = weeks[1]
  const trend = currentWeek && lastWeek ? currentWeek.score - lastWeek.score : 0

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Award size={22} color="#c8a74b" /> Weekly Report Card
        </h1>
        <p className={styles.pageTopDate}>Your wellness consistency score for the past 4 weeks</p>
      </div>

      {loading ? (
        <div className={styles.loadingText}>Calculating your grades...</div>
      ) : (
        <>
          {/* Current week hero */}
          {currentWeek && (() => {
            const { grade, color, message } = calcGrade(currentWeek.score)
            return (
              <div className={styles.gradeHero}>
                <div className={styles.gradeHeroLabel}>This Week</div>
                {/* Grade color is derived from the live score, so it stays inline */}
                <div className={styles.gradeHeroLetter} style={{ color }}>{grade}</div>
                <div className={styles.gradeHeroScore}>{currentWeek.score}%</div>
                <p className={styles.gradeHeroMsg}>{message}</p>
                {lastWeek && (
                  <div className={styles.trendPill}>
                    {trend > 0 ? <TrendingUp size={16} color="#4be08a" /> : trend < 0 ? <TrendingDown size={16} color="#e05c5c" /> : <Minus size={16} color="#91a0ac" />}
                    <span style={{ color: trend > 0 ? '#4be08a' : trend < 0 ? '#e05c5c' : '#91a0ac' }}>
                      {trend > 0 ? `+${trend}` : trend}% vs last week
                    </span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Breakdown */}
          {currentWeek && currentWeek.breakdown.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitleSolo}>This Week's Breakdown</h3>
              <div className={styles.breakdownList}>
                {currentWeek.breakdown.map(({ label, score, max, pct }) => {
                  const barColor = pct >= 70 ? '#4be08a' : pct >= 50 ? '#e0b84b' : '#e05c5c'
                  return (
                    <div key={label}>
                      <div className={styles.breakdownHeader}>
                        <span className={styles.breakdownLabel}>{label}</span>
                        <span className={styles.breakdownScore} style={{ color: barColor }}>{score}/{max} days ({pct}%)</span>
                      </div>
                      <div className={styles.breakdownTrack}>
                        {/* Width and color are computed from live scores, so they stay inline */}
                        <div className={styles.breakdownFill} style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4-week history */}
          <div className={styles.card}>
            <h3 className={styles.cardTitleSolo}>4-Week History</h3>
            <div className={styles.breakdownList}>
              {weeks.map((week, i) => {
                const { grade, color } = calcGrade(week.score)
                return (
                  <div key={week.weekStart} className={styles.historyRow}>
                    <div className={styles.historyGrade} style={{ color }}>{grade}</div>
                    <div className={styles.historyBody}>
                      <div className={styles.historyTitle}>
                        {i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} Weeks Ago`}
                      </div>
                      <div className={styles.historyMeta}>
                        {format(new Date(week.weekStart), 'MMM d')} to {format(new Date(week.weekEnd), 'MMM d')} · {week.logs.length} days logged
                      </div>
                    </div>
                    <div className={styles.historyScore} style={{ color }}>{week.score}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

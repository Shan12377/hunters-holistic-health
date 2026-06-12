import { useEffect, useState } from 'react'
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import type { DailyLog } from '@/types'
import type { WeekBreakdown } from '@/lib/grading'
import { calcGrade, scoreWeek } from '@/lib/grading'
import styles from './Client.module.css'

interface WeekScore {
  weekStart: string
  weekEnd: string
  score: number
  grade: string
  logs: DailyLog[]
  breakdown: WeekBreakdown[]
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

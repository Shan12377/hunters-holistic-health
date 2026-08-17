import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'
import { withTimeout } from '@/lib/withTimeout'
import type { NutritionGoals } from '@/pages/client/NutritionGoalsTab'
import styles from '@/pages/client/Client.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Props {
  userId: string
  goals: NutritionGoals | null
}

interface DayTotal {
  date: string
  calories: number
  protein: number
}

const TREND_TIMEOUT_MS = 15000

export default function NutritionTrendsChart({ userId, goals }: Props) {
  const [days, setDays] = useState<DayTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => { fetchTrend() }, [userId])

  const fetchTrend = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const windowStart = format(subDays(new Date(), 29), 'yyyy-MM-dd')
      const { data } = await withTimeout(
        supabase
          .from('meal_logs')
          .select('logged_at, calories, protein')
          .eq('user_id', userId)
          .gte('logged_at', windowStart + 'T00:00:00'),
        TREND_TIMEOUT_MS,
        'Nutrition trend'
      )
      const byDay = new Map<string, { calories: number; protein: number }>()
      for (const row of data ?? []) {
        const day = row.logged_at.slice(0, 10)
        const existing = byDay.get(day) ?? { calories: 0, protein: 0 }
        existing.calories += row.calories ?? 0
        existing.protein += row.protein ?? 0
        byDay.set(day, existing)
      }
      const sorted = Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, totals]) => ({ date, ...totals }))
      setDays(sorted)
    } catch (err) {
      console.error('[nutrition-trends] fetch failed:', err)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.chartEmpty}>Loading trend...</div>

  if (loadError) {
    return (
      <div className={styles.chartEmpty}>
        <p>Could not load your trend. Check your connection and try again.</p>
        <button className={styles.tabBtn} onClick={fetchTrend}>Retry</button>
      </div>
    )
  }

  if (days.length < 2) {
    return (
      <div className={styles.chartEmpty}>
        <p>Log meals on at least 2 different days to see a trend here.</p>
      </div>
    )
  }

  const labels = days.map(d => format(new Date(`${d.date}T12:00:00`), 'MMM d'))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Calories',
        data: days.map(d => d.calories),
        borderColor: '#c8a74b',
        backgroundColor: 'rgba(200,167,75,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Protein (g)',
        data: days.map(d => d.protein),
        borderColor: '#0b9e8e',
        backgroundColor: 'rgba(11,158,142,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        yAxisID: 'y1',
      },
      ...(goals ? [{
        label: 'Calorie goal',
        data: days.map(() => goals.calories_goal),
        borderColor: 'rgba(200,167,75,0.35)',
        borderWidth: 1,
        borderDash: [6, 4] as [number, number],
        pointRadius: 0,
        yAxisID: 'y',
      }] : []),
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#91a0ac', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#182a28',
        borderColor: '#1f3331',
        borderWidth: 1,
        titleColor: '#f7f7f7',
        bodyColor: '#91a0ac',
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        type: 'linear' as const, position: 'left' as const,
        ticks: { color: '#c8a74b', font: { size: 11 } }, grid: { color: '#1f3331' },
        title: { display: true, text: 'Calories', color: '#c8a74b' },
      },
      y1: {
        type: 'linear' as const, position: 'right' as const,
        ticks: { color: '#0b9e8e', font: { size: 11 } }, grid: { display: false },
        title: { display: true, text: 'Protein (g)', color: '#0b9e8e' },
      },
    },
  }

  return (
    <div className={styles.chartWrap}>
      <Line data={chartData} options={chartOptions as never} />
    </div>
  )
}

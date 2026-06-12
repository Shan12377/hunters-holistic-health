import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import type { BSReading } from '@/types'
import { getBSZone, BS_ZONE_LABELS, BS_ZONE_COLORS } from '@/types'
import toast from 'react-hot-toast'
import { Droplet, Plus, Info } from 'lucide-react'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CONTEXT_LABELS: Record<string, string> = {
  fasting: 'Fasting',
  before_meal: 'Before Meal',
  post_meal_2hr: 'Post-Meal (2 hr)',
  bedtime: 'Bedtime',
}

export default function BloodSugarPage() {
  const [readings, setReadings] = useState<BSReading[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ glucose: '', context: 'fasting', notes: '' })

  useEffect(() => { fetchReadings() }, [])

  const fetchReadings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('blood_sugar_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(60)
    setReadings((data as BSReading[]) ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const glucose = parseInt(form.glucose)
    if (isNaN(glucose) || glucose < 20 || glucose > 600) {
      toast.error('Please enter a valid glucose value (20 to 600 mg/dL)')
      return
    }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('blood_sugar_logs').insert({
      user_id: user.id,
      glucose_mg_dl: glucose,
      reading_context: form.context,
      notes: form.notes || null,
      logged_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save reading')
    } else {
      toast.success('Blood sugar reading saved!')
      setForm({ glucose: '', context: 'fasting', notes: '' })
      setShowForm(false)
      fetchReadings()
    }
    setSubmitting(false)
  }

  const latest = readings[readings.length - 1]
  const latestZone = latest ? getBSZone(latest.glucose_mg_dl, latest.reading_context) : null

  const labels = readings.map(r => format(parseISO(r.logged_at), 'MMM d'))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Blood Sugar (mg/dL)',
        data: readings.map(r => r.glucose_mg_dl),
        borderColor: '#c8a74b',
        backgroundColor: 'rgba(200,167,75,0.08)',
        borderWidth: 2,
        pointBackgroundColor: readings.map(r => BS_ZONE_COLORS[getBSZone(r.glucose_mg_dl, r.reading_context)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Typical Upper (99)',
        data: readings.map(() => 99),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Typical Lower (70)',
        data: readings.map(() => 70),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
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
        callbacks: {
          afterBody: (items: { dataIndex: number }[]) => {
            const idx = items[0]?.dataIndex
            if (idx === undefined) return []
            const r = readings[idx]
            return [
              `Context: ${CONTEXT_LABELS[r.reading_context]}`,
              `Zone: ${BS_ZONE_LABELS[getBSZone(r.glucose_mg_dl, r.reading_context)]}`,
            ]
          }
        }
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        ticks: { color: '#91a0ac', font: { size: 11 } },
        grid: { color: '#1f3331' },
        min: 40, max: 300,
      },
    },
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Droplet size={22} color="#0b9e8e" /> Blood Sugar Tracker
          </h1>
          <p className={styles.pageTopDate}>Log and visualize your readings over time</p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Log Reading
        </button>
      </div>

      {/* Latest reading card */}
      {latest && (
        <div className={styles.bpLatestCard}>
          <div>
            {/* Zone color is derived from the live reading value, so it stays inline */}
            <div className={styles.bpLatestValue} style={{ color: BS_ZONE_COLORS[latestZone!] }}>
              {latest.glucose_mg_dl}
            </div>
            <div className={styles.bpUnit}>mg/dL</div>
          </div>
          <div>
            <div className={styles.bpZoneName} style={{ color: BS_ZONE_COLORS[latestZone!] }}>
              {BS_ZONE_LABELS[latestZone!]}
            </div>
            <div className={styles.bpMeta}>
              {CONTEXT_LABELS[latest.reading_context]} · {format(parseISO(latest.logged_at), 'MMM d, h:mm a')}
            </div>
            {latest.glucose_mg_dl < 70 && (
              <div className={styles.bpCrisisAlert}>
                ⚠️ If you feel shaky, confused, or sweaty, treat low blood sugar now and contact your provider.
              </div>
            )}
            {latest.glucose_mg_dl > 240 && (
              <div className={styles.bpCrisisAlert}>
                ⚠️ Reading is significantly elevated. Contact your healthcare provider.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>New Reading</h3>
          <form onSubmit={handleSubmit} className={styles.logForm}>
            <div className={styles.inputRow}>
              <div className={styles.field}>
                <label className={styles.label}>Blood Sugar (mg/dL) *</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="95"
                  value={form.glucose}
                  onChange={e => setForm(f => ({ ...f, glucose: e.target.value }))}
                  required
                  min={20}
                  max={600}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Reading Context *</label>
                <select
                  className={styles.select}
                  value={form.context}
                  onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                >
                  <option value="fasting">Fasting</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="post_meal_2hr">Post-Meal (2 hr)</option>
                  <option value="bedtime">Bedtime</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Notes (optional)</label>
              <input
                className={styles.input}
                type="text"
                placeholder="After morning walk, skipped breakfast..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Reading'}
              </button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Trend (Last 60 Readings)</h3>
        {loading ? (
          <div className={styles.chartEmpty}>Loading chart...</div>
        ) : readings.length < 2 ? (
          <div className={styles.chartEmpty}>
            <Droplet size={32} color="var(--border)" />
            <p>Log at least 2 readings to see your trend</p>
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )}
      </div>

      {/* Reference card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Info size={16} color="var(--text-secondary)" /> Blood Sugar Reference (Educational)
          </h3>
        </div>
        <div className={styles.zoneGrid}>
          {[
            { zone: 'Low (Below Typical Range)', range: 'Below 70 mg/dL', color: '#e08a4b' },
            { zone: 'In Typical Range (Fasting / Before Meal)', range: '70 to 99 mg/dL', color: '#4be08a' },
            { zone: 'Above Typical Range (Fasting / Before Meal)', range: '100 to 125 mg/dL', color: '#e0b84b' },
            { zone: 'Elevated: Discuss With Provider (Fasting)', range: '126 mg/dL or above', color: '#e05c5c' },
            { zone: 'In Typical Range (Post-Meal 2 hr)', range: 'Below 140 mg/dL', color: '#4be08a' },
            { zone: 'Above Typical Range (Post-Meal 2 hr)', range: '140 to 199 mg/dL', color: '#e0b84b' },
            { zone: 'Elevated: Discuss With Provider (Post-Meal 2 hr)', range: '200 mg/dL or above', color: '#e05c5c' },
          ].map(({ zone, range, color }) => (
            <div key={zone} className={styles.zoneItem}>
              {/* Dot color comes from zone data, so it stays inline */}
              <div className={styles.dot} style={{ background: color }} />
              <div>
                <div className={styles.zoneItemName}>{zone}</div>
                <div className={styles.zoneItemRange}>{range}</div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.refNote}>
          These ranges are for educational reference only, based on ADA-aligned reference values for fasting and pre-meal glucose in adults. Post-meal ranges (2 hours after eating) are listed separately above. Individual goals vary. Always consult your healthcare provider for clinical interpretation of your readings.
        </p>
      </div>
    </div>
  )
}

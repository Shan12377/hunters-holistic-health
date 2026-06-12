import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import type { BPReading } from '@/types'
import { getBPZone, BP_ZONE_LABELS, BP_ZONE_COLORS } from '@/types'
import toast from 'react-hot-toast'
import { Heart, Plus, Info } from 'lucide-react'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function BPTrackerPage() {
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ systolic: '', diastolic: '', pulse: '', notes: '' })

  useEffect(() => { fetchReadings() }, [])

  const fetchReadings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('blood_pressure_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(60)
    setReadings((data as BPReading[]) ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sys = parseInt(form.systolic)
    const dia = parseInt(form.diastolic)
    if (isNaN(sys) || isNaN(dia) || sys < 60 || sys > 250 || dia < 40 || dia > 150) {
      toast.error('Please enter valid blood pressure values')
      return
    }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('blood_pressure_logs').insert({
      user_id: user.id,
      systolic: sys,
      diastolic: dia,
      pulse: form.pulse ? parseInt(form.pulse) : null,
      notes: form.notes || null,
      logged_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save reading')
    } else {
      toast.success('Blood pressure reading saved!')
      setForm({ systolic: '', diastolic: '', pulse: '', notes: '' })
      setShowForm(false)
      fetchReadings()
    }
    setSubmitting(false)
  }

  const latest = readings[readings.length - 1]
  const latestZone = latest ? getBPZone(latest.systolic, latest.diastolic) : null

  // Chart data
  const labels = readings.map(r => format(parseISO(r.logged_at), 'MMM d'))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Systolic',
        data: readings.map(r => r.systolic),
        borderColor: '#c8a74b',
        backgroundColor: 'rgba(200,167,75,0.08)',
        borderWidth: 2,
        pointBackgroundColor: readings.map(r => BP_ZONE_COLORS[getBPZone(r.systolic, r.diastolic)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Diastolic',
        data: readings.map(r => r.diastolic),
        borderColor: '#0b9e8e',
        backgroundColor: 'rgba(11,158,142,0.08)',
        borderWidth: 2,
        pointBackgroundColor: readings.map(r => BP_ZONE_COLORS[getBPZone(r.systolic, r.diastolic)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Goal (120)',
        data: readings.map(() => 120),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Goal (80)',
        data: readings.map(() => 80),
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
            return [`Zone: ${BP_ZONE_LABELS[getBPZone(r.systolic, r.diastolic)]}`]
          }
        }
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        ticks: { color: '#91a0ac', font: { size: 11 } },
        grid: { color: '#1f3331' },
        min: 50, max: 180,
      },
    },
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Heart size={22} color="#e05c5c" /> Blood Pressure Tracker
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
            {/* Zone color is derived from the live reading, so it stays inline */}
            <div className={styles.bpLatestValue} style={{ color: BP_ZONE_COLORS[latestZone!] }}>
              {latest.systolic}/{latest.diastolic}
            </div>
            <div className={styles.bpUnit}>mmHg</div>
          </div>
          <div>
            <div className={styles.bpZoneName} style={{ color: BP_ZONE_COLORS[latestZone!] }}>
              {BP_ZONE_LABELS[latestZone!]}
            </div>
            <div className={styles.bpMeta}>
              {latest.pulse && `Pulse: ${latest.pulse} bpm · `}
              {format(parseISO(latest.logged_at), 'MMM d, h:mm a')}
            </div>
            {latestZone === 'crisis' && (
              <div className={styles.bpCrisisAlert}>
                ⚠️ This reading is above 180/120. Please contact your healthcare provider immediately.
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
            <div className={styles.inputRow3}>
              <div className={styles.field}>
                <label className={styles.label}>Systolic (top) *</label>
                <input className={styles.input} type="number" placeholder="120" value={form.systolic} onChange={e => setForm(f => ({...f, systolic: e.target.value}))} required min={60} max={250} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Diastolic (bottom) *</label>
                <input className={styles.input} type="number" placeholder="80" value={form.diastolic} onChange={e => setForm(f => ({...f, diastolic: e.target.value}))} required min={40} max={150} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pulse (bpm)</label>
                <input className={styles.input} type="number" placeholder="72" value={form.pulse} onChange={e => setForm(f => ({...f, pulse: e.target.value}))} min={30} max={220} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Notes (optional)</label>
              <input className={styles.input} type="text" placeholder="After morning walk, before coffee..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} maxLength={200} />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={submitting}>{submitting ? 'Saving...' : 'Save Reading'}</button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
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
            <Heart size={32} color="var(--border)" />
            <p>Log at least 2 readings to see your trend</p>
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )}
      </div>

      {/* BP Zone Reference */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Info size={16} color="var(--text-secondary)" /> Blood Pressure Reference (Educational)
          </h3>
        </div>
        <div className={styles.zoneGrid}>
          {[
            { zone: 'Normal', range: 'Below 120/80', color: '#4be08a' },
            { zone: 'Elevated', range: '120-129 / below 80', color: '#e0b84b' },
            { zone: 'High Stage 1', range: '130-139 / 80-89', color: '#e08a4b' },
            { zone: 'High Stage 2', range: '140+ / 90+', color: '#e05c5c' },
            { zone: 'Hypertensive Crisis', range: 'Above 180 / above 120', color: '#c0392b' },
          ].map(({ zone, range, color }) => (
            <div key={zone} className={styles.zoneItem}>
              {/* Dot color comes from the zone data, so it stays inline */}
              <div className={styles.dot} style={{ background: color }} />
              <div>
                <div className={styles.zoneItemName}>{zone}</div>
                <div className={styles.zoneItemRange}>{range}</div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.refNote}>
          This reference is for educational purposes only. Blood pressure classifications are based on AHA/ACC guidelines. Always consult your healthcare provider for clinical interpretation of your readings.
        </p>
      </div>
    </div>
  )
}

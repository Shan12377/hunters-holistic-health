import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Heart, Activity } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, parseISO, subDays } from 'date-fns'
import type { BPReading, DailyLog, Profile } from '@/types'
import { getBPZone, BP_ZONE_COLORS } from '@/types'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bpReadings, setBpReadings] = useState<BPReading[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => { if (clientId) fetchClientData(clientId) }, [clientId])

  const fetchClientData = async (id: string) => {
    const [profileRes, bpRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('blood_pressure_logs').select('*').eq('user_id', id).order('logged_at', { ascending: true }).limit(30),
      supabase.from('daily_logs').select('*').eq('user_id', id).order('log_date', { ascending: false }).limit(30),
    ])
    if (profileRes.data) setProfile(profileRes.data as Profile)
    setBpReadings((bpRes.data as BPReading[]) ?? [])
    setDailyLogs((logsRes.data as DailyLog[]) ?? [])
    setLoading(false)
  }

  const generateShareableReport = async () => {
    if (!profile) return
    setGeneratingReport(true)

    const avgSys = bpReadings.length ? Math.round(bpReadings.reduce((a, b) => a + b.systolic, 0) / bpReadings.length) : null
    const avgDia = bpReadings.length ? Math.round(bpReadings.reduce((a, b) => a + b.diastolic, 0) / bpReadings.length) : null
    const avgSteps = dailyLogs.length ? Math.round(dailyLogs.reduce((a, b) => a + (b.steps ?? 0), 0) / dailyLogs.length) : null
    const avgEnergy = dailyLogs.length ? (dailyLogs.reduce((a, b) => a + (b.energy_level ?? 5), 0) / dailyLogs.length).toFixed(1) : null
    const streak = (() => {
      let s = 0
      const dates = dailyLogs.map(l => l.log_date)
      for (let i = 0; i < 30; i++) {
        if (dates.includes(format(subDays(new Date(), i), 'yyyy-MM-dd'))) s++
        else break
      }
      return s
    })()

    const bpChartData = bpReadings.map(r => ({ date: format(parseISO(r.logged_at), 'MMM d'), sys: r.systolic, dia: r.diastolic }))
    const stepsData = [...dailyLogs].reverse().slice(-14).map(l => ({ date: l.log_date, steps: l.steps ?? 0 }))

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Progress Report: ${profile.first_name} ${profile.last_name}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0e1c1b; color: #f7f7f7; padding: 24px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 700; color: #c8a74b; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 600; color: #91a0ac; margin-bottom: 16px; }
  h3 { font-size: 14px; font-weight: 600; color: #91a0ac; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .card { background: #13211f; border: 1px solid #1f3331; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .stat { background: #182a28; border: 1px solid #1f3331; border-radius: 10px; padding: 16px; text-align: center; }
  .stat-val { font-size: 28px; font-weight: 700; color: #c8a74b; }
  .stat-label { font-size: 12px; color: #91a0ac; margin-top: 4px; }
  .disclaimer { font-size: 11px; color: #91a0ac; line-height: 1.6; padding: 12px 16px; background: rgba(200,167,75,0.04); border: 1px solid rgba(200,167,75,0.15); border-radius: 8px; margin-top: 20px; }
  canvas { max-height: 250px; }
</style>
</head>
<body>
<div style="display:flex;align-items:center;gap:16;margin-bottom:24px;">
  <div>
    <div style="font-size:11px;color:#c8a74b;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Hunter's Holistic Health</div>
    <h1>Progress Report</h1>
    <h2>${profile.first_name} ${profile.last_name}${profile.age ? ` · Age ${profile.age}` : ''} · Generated ${format(new Date(), 'MMMM d, yyyy')}</h2>
  </div>
</div>

<div class="stats">
  ${avgSys ? `<div class="stat"><div class="stat-val">${avgSys}/${avgDia}</div><div class="stat-label">Avg Blood Pressure</div></div>` : ''}
  ${avgSteps ? `<div class="stat"><div class="stat-val">${avgSteps.toLocaleString()}</div><div class="stat-label">Avg Daily Steps</div></div>` : ''}
  ${avgEnergy ? `<div class="stat"><div class="stat-val">${avgEnergy}/10</div><div class="stat-label">Avg Energy Level</div></div>` : ''}
  <div class="stat"><div class="stat-val">🔥${streak}</div><div class="stat-label">Current Streak</div></div>
</div>

${bpChartData.length >= 2 ? `
<div class="card">
  <h3>Blood Pressure Trend</h3>
  <canvas id="bpChart"></canvas>
</div>` : ''}

${stepsData.length >= 2 ? `
<div class="card">
  <h3>Daily Steps (Last 14 Days)</h3>
  <canvas id="stepsChart"></canvas>
</div>` : ''}

<div class="disclaimer">
  <strong style="color:#c8a74b;">Educational Purposes Only.</strong> This report is generated by Hunter's Holistic Health educational platform. It is not a medical record and does not constitute medical advice, diagnosis, or treatment. Dr. Shallanda Hunter, PharmD operates as a Functional Medicine Educator. All data is self-reported by the participant. Always consult a licensed healthcare provider for clinical interpretation of health metrics.
</div>

<script>
const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#91a0ac' } } },
  scales: {
    x: { ticks: { color: '#91a0ac' }, grid: { color: '#1f3331' } },
    y: { ticks: { color: '#91a0ac' }, grid: { color: '#1f3331' } }
  }
};

${bpChartData.length >= 2 ? `
new Chart(document.getElementById('bpChart'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(bpChartData.map(d => d.date))},
    datasets: [
      { label: 'Systolic', data: ${JSON.stringify(bpChartData.map(d => d.sys))}, borderColor: '#c8a74b', tension: 0.3, pointRadius: 4 },
      { label: 'Diastolic', data: ${JSON.stringify(bpChartData.map(d => d.dia))}, borderColor: '#0b9e8e', tension: 0.3, pointRadius: 4 },
      { label: 'Goal (120)', data: ${JSON.stringify(bpChartData.map(() => 120))}, borderColor: 'rgba(75,224,138,0.4)', borderDash: [6,4], pointRadius: 0 },
      { label: 'Goal (80)', data: ${JSON.stringify(bpChartData.map(() => 80))}, borderColor: 'rgba(75,224,138,0.4)', borderDash: [6,4], pointRadius: 0 },
    ]
  },
  options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 50, max: 180 } } }
});` : ''}

${stepsData.length >= 2 ? `
new Chart(document.getElementById('stepsChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(stepsData.map(d => d.date))},
    datasets: [{ label: 'Steps', data: ${JSON.stringify(stepsData.map(d => d.steps))}, backgroundColor: 'rgba(11,158,142,0.6)', borderColor: '#0b9e8e', borderWidth: 1 }]
  },
  options: chartDefaults
});` : ''}
</script>
</body>
</html>`

    // Download the HTML report
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HHH_Report_${profile.first_name}_${profile.last_name}_${format(new Date(), 'yyyy-MM-dd')}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Progress report downloaded!')
    setGeneratingReport(false)
  }

  if (loading) return <div className={styles.loadingText}>Loading participant data...</div>
  if (!profile) return <div className={styles.loadingText}>Participant not found.</div>

  const bpChartData = {
    labels: bpReadings.map(r => format(parseISO(r.logged_at), 'MMM d')),
    datasets: [
      { label: 'Systolic', data: bpReadings.map(r => r.systolic), borderColor: '#c8a74b', pointBackgroundColor: bpReadings.map(r => BP_ZONE_COLORS[getBPZone(r.systolic, r.diastolic)]), tension: 0.3, pointRadius: 5, fill: false },
      { label: 'Diastolic', data: bpReadings.map(r => r.diastolic), borderColor: '#0b9e8e', tension: 0.3, pointRadius: 5, fill: false },
    ],
  }

  const stepsChartData = {
    labels: [...dailyLogs].reverse().slice(-14).map(l => l.log_date),
    datasets: [{ label: 'Steps', data: [...dailyLogs].reverse().slice(-14).map(l => l.steps ?? 0), backgroundColor: 'rgba(11,158,142,0.5)', borderColor: '#0b9e8e', borderWidth: 1 }],
  }

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#91a0ac', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#91a0ac', font: { size: 10 } }, grid: { color: '#1f3331' } }, y: { ticks: { color: '#91a0ac', font: { size: 10 } }, grid: { color: '#1f3331' } } } }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderLeft}>
          <Link to="/coach" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div>
            <h1 className={styles.detailName}>{profile.first_name} {profile.last_name}</h1>
            <p className={styles.detailMeta}>
              {profile.age ? `Age ${profile.age}` : ''}
              {profile.display_handle ? ` · @${profile.display_handle}` : ''}
            </p>
          </div>
        </div>
        <button className={shared.btnPrimary} onClick={generateShareableReport} disabled={generatingReport}>
          <Download size={16} /> {generatingReport ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      {/* BP Chart */}
      {bpReadings.length >= 2 && (
        <div className={styles.card}>
          <h3 className={styles.cardSubTitle}>
            <Heart size={16} color="#e05c5c" /> Blood Pressure Trend
          </h3>
          <div className={styles.chartWrap}>
            <Line data={bpChartData} options={chartOpts as never} />
          </div>
        </div>
      )}

      {/* Steps Chart */}
      {dailyLogs.length >= 2 && (
        <div className={styles.card}>
          <h3 className={styles.cardSubTitle}>
            <Activity size={16} color="var(--teal)" /> Daily Steps (Last 14 Days)
          </h3>
          <div className={styles.chartWrapSm}>
            <Bar data={stepsChartData} options={chartOpts as never} />
          </div>
        </div>
      )}

      {/* Recent Daily Logs */}
      <div className={styles.card}>
        <h3 className={styles.cardSubTitle}>Recent Daily Logs</h3>
        {dailyLogs.length === 0 ? (
          <p className={styles.emptyText}>No logs yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.logTable}>
              <thead>
                <tr>
                  {['Date', 'Steps', 'Water', 'Energy', 'Fast', 'Meal 1', 'Supps AM', 'Late Slip'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyLogs.slice(0, 14).map(log => (
                  <tr key={log.id}>
                    <td className={styles.cellPrimary}>{log.log_date}</td>
                    <td className={(log.steps ?? 0) >= 8000 ? styles.cellMet : undefined}>{(log.steps ?? 0).toLocaleString()}</td>
                    <td className={(log.water_oz ?? 0) >= 64 ? styles.cellMet : undefined}>{log.water_oz ?? 0} oz</td>
                    <td className={styles.cellGold}>{log.energy_level ?? '-'}/10</td>
                    <td>{log.morning_fast_done ? '✅' : '⬜'}</td>
                    <td>{log.meal1_logged ? '✅' : '⬜'}</td>
                    <td>{log.supplement_am_done ? '✅' : '⬜'}</td>
                    <td className={styles.cellTruncate}>{log.late_slip_reason ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reflection Patterns (Educational) */}
      {(() => {
        const lateSlips = dailyLogs.filter(l => l.late_slip_reason !== null)
        if (lateSlips.length === 0) return null

        const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dowCounts = DOW_LABELS.map((_, i) =>
          lateSlips.filter(l => new Date(l.log_date + 'T12:00:00').getDay() === i).length
        )

        const dowChartData = {
          labels: DOW_LABELS,
          datasets: [{
            label: 'Reflections',
            data: dowCounts,
            backgroundColor: 'rgba(200,167,75,0.45)',
            borderColor: '#c8a74b',
            borderWidth: 1,
          }],
        }

        const dowChartOpts = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#91a0ac', font: { size: 10 } }, grid: { color: '#1f3331' } },
            y: { ticks: { color: '#91a0ac', font: { size: 10 }, stepSize: 1 }, grid: { color: '#1f3331' }, min: 0 },
          },
        }

        return (
          <div className={styles.card}>
            <h3 className={styles.cardSubTitle}>Reflection Patterns (Educational)</h3>
            <p className={styles.slipPatternDesc}>
              Late slip entries from the most recent 30 logs. For educational program awareness only.
            </p>
            <div className={styles.slipPatternMeta}>
              <span className={styles.slipCount}>{lateSlips.length}</span>
              <span className={styles.slipCountLabel}>
                {lateSlips.length === 1 ? 'reflection entry' : 'reflection entries'} in last 30 logs
              </span>
            </div>
            <div className={styles.chartWrapSm} style={{ marginBottom: 'var(--space-5)' }}>
              <Bar data={dowChartData} options={dowChartOpts as never} />
            </div>
            <div className={styles.slipList}>
              {lateSlips.slice(0, 10).map(l => (
                <div key={l.id} className={styles.slipItem}>
                  <span className={styles.slipDate}>{l.log_date}</span>
                  <span className={styles.slipReason}>{l.late_slip_reason}</span>
                </div>
              ))}
              {lateSlips.length > 10 && (
                <div className={styles.slipMore}>+{lateSlips.length - 10} more entries</div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

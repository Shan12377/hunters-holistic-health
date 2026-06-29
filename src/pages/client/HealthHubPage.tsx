import { useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { BPReading, BSReading, DailyLog } from '@/types'
import { getBPZone, getBSZone, BS_ZONE_LABELS } from '@/types'

// ─── Local types ──────────────────────────────────────────────────────────────

interface Session {
  id: string
  session_date: string
  session_time: string
  session_type: string
}

interface SymptomLog {
  id: string
  user_id: string
  log_date: string
  symptoms: string[]
  note: string | null
}

export interface LabZoneAssessment {
  id: string
  marker_key: string
  marker_label: string
  marker_group: string
  zone: 'optimal' | 'suboptimal' | 'low' | 'high' | 'pending'
  functional_target: string | null
  educator_note: string | null
  priority: number
  reviewed_by: string
  reviewed_at: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMPTOM_OPTIONS = [
  'Fatigue', 'Brain fog', 'Bloating', 'Irritability', 'Headache',
  'Hot flash', 'Poor sleep', 'Breast tenderness', 'Cramping',
  'Anxiety', 'Dizziness', 'Low mood',
]

const DOC_TYPES = [
  { value: 'lab_results',   label: 'New lab results',               sub: 'LabCorp, Quest, hospital panel, specialty test' },
  { value: 'visit_summary', label: "Doctor's visit summary",        sub: 'After-visit summary, referral notes, specialist report' },
  { value: 'imaging',       label: 'Imaging or pathology report',   sub: 'Ultrasound, MRI, biopsy result' },
  { value: 'other',         label: 'Something else',                sub: 'Medication change, insurance EOB, prescription question' },
]

const PROGRESS_OPTIONS = [
  'Moving in the right direction',
  'Mixed: some things better, some stalled',
  'Not seeing changes yet',
  'Something feels off and I need help understanding it',
]

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function fmtDate(d: string) { return format(new Date(d + 'T12:00:00'), 'MMMM d, yyyy') }
function fmtTime(t: string) { return format(new Date(`1970-01-01T${t}`), 'h:mm a') }

function weekAvg(logs: DailyLog[], key: keyof DailyLog): number {
  const vals = logs.map(l => l[key]).filter((v): v is number => typeof v === 'number' && v > 0)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
}

function weekBoolCount(logs: DailyLog[], key: keyof DailyLog): number {
  return logs.filter(l => l[key] === true).length
}

function topSymptoms(logs: SymptomLog[]): string | null {
  if (logs.length < 3) return null
  const freq: Record<string, number> = {}
  for (const log of logs) for (const s of log.symptoms) freq[s] = (freq[s] || 0) + 1
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 2)
  if (!top.length) return null
  return top.map(([s, n]) => `${s.toLowerCase()} (${n} of ${logs.length} days)`).join(', and ')
}

function zoneColor(zone: string): string {
  if (zone === 'optimal') return '#4caf7d'
  if (zone === 'suboptimal') return '#f59e0b'
  if (zone === 'low' || zone === 'high') return '#e05c5c'
  return '#4a7c7e'
}

function zoneLabel(zone: string): string {
  if (zone === 'optimal') return 'Optimal'
  if (zone === 'suboptimal') return 'Suboptimal'
  if (zone === 'low') return 'Low'
  if (zone === 'high') return 'High'
  return 'Pending'
}

function zoneMarkerLeft(zone: string): string {
  if (zone === 'low') return '10%'
  if (zone === 'suboptimal') return '30%'
  if (zone === 'optimal') return '58%'
  if (zone === 'high') return '85%'
  return '50%'
}

// ─── Presentational sub-components ───────────────────────────────────────────

function BPSparkline({ readings }: { readings: BPReading[] }) {
  if (!readings.length) return null
  const vals = readings.map(r => r.systolic)
  const min = Math.min(...vals) - 8
  const max = Math.max(...vals) + 8
  const H = 36
  const barW = 22
  const gap = 4
  const totalW = readings.length * (barW + gap) - gap
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${H}`}>
      {readings.map((r, i) => {
        const barH = Math.max(4, ((r.systolic - min) / (max - min)) * H)
        const zone = getBPZone(r.systolic, r.diastolic)
        const fill = i === readings.length - 1 ? '#0B9E8E'
          : zone === 'normal' ? 'rgba(76,175,125,.4)' : 'rgba(224,92,92,.5)'
        return <rect key={i} x={i * (barW + gap)} y={H - barH} width={barW} height={barH} rx={3} fill={fill} />
      })}
    </svg>
  )
}

function ZoneCard({ z }: { z: LabZoneAssessment }) {
  const col = zoneColor(z.zone)
  return (
    <div style={{ borderRadius: 16, marginBottom: 9, overflow: 'hidden', border: `1px solid ${col}44`, background: `${col}0d` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px 0' }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}88` }} />
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, flex: 1, color: '#fff' }}>{z.marker_label}</div>
        <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${col}30`, color: col, textTransform: 'uppercase', letterSpacing: '.5px' }}>{zoneLabel(z.zone)}</div>
      </div>
      {z.zone !== 'pending' && (
        <div style={{ padding: '0 14px 0 33px' }}>
          <div style={{ position: 'relative', height: 6, borderRadius: 99, margin: '8px 0 4px', background: 'linear-gradient(90deg,rgba(224,92,92,.4) 0%,rgba(245,158,11,.4) 25%,rgba(76,175,125,.5) 45%,rgba(76,175,125,.5) 70%,rgba(245,158,11,.4) 85%,rgba(224,92,92,.4) 100%)' }}>
            <div style={{ position: 'absolute', top: '50%', left: zoneMarkerLeft(z.zone), transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: col, border: '2px solid #1c5253' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'hsl(181,15%,48%)', marginBottom: 8 }}>
            <span>Deficient</span><span>Low</span><span>Functional</span><span>Optimal</span><span>High</span>
          </div>
        </div>
      )}
      <div style={{ padding: z.zone === 'pending' ? '8px 14px 13px 33px' : '0 14px 13px 33px' }}>
        {z.functional_target && (
          <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginBottom: 5 }}>
            Functional target: <strong style={{ color: 'hsl(181,20%,68%)' }}>{z.functional_target}</strong>
          </div>
        )}
        {z.educator_note && (
          <div style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55 }}>{z.educator_note}</div>
        )}
        {z.reviewed_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10, color: 'hsl(181,15%,48%)' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0B9E8E' }} />
            Reviewed by {z.reviewed_by} · {format(new Date(z.reviewed_at), 'MMMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
      <div style={{ flex: 1, height: 1, background: '#1b4e4f' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', letterSpacing: '.7px' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#1b4e4f' }} />
    </div>
  )
}

// ─── Shared style objects ─────────────────────────────────────────────────────

const CSS = {
  page:     { maxWidth: 680, padding: '24px 16px 80px' } as React.CSSProperties,
  card:     { background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 16, padding: 15, marginBottom: 11 } as React.CSSProperties,
  sl:       { fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase' as const, letterSpacing: '.7px', margin: '18px 0 9px' } as React.CSSProperties,
  lbl:      { fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase' as const, letterSpacing: '.6px', marginBottom: 11 } as React.CSSProperties,
  tealBox:  { background: 'linear-gradient(135deg,rgba(11,158,142,.12) 0%,rgba(11,158,142,.04) 100%)', border: '1px solid rgba(11,158,142,.25)', borderRadius: 16, padding: '14px 15px', marginBottom: 12, position: 'relative' as const, overflow: 'hidden' as const } as React.CSSProperties,
  warnBox:  { display: 'flex', gap: 10, padding: '11px 13px', borderRadius: 10, marginBottom: 11, fontSize: 12, lineHeight: 1.5, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', color: 'hsl(38,90%,68%)' } as React.CSSProperties,
  infoBox:  { display: 'flex', gap: 10, padding: '11px 13px', borderRadius: 10, marginBottom: 11, fontSize: 12, lineHeight: 1.5, background: 'rgba(11,158,142,.08)', border: '1px solid rgba(11,158,142,.2)', color: 'hsl(181,20%,68%)' } as React.CSSProperties,
  goldBtn:  { width: '100%', padding: 12, border: 'none', borderRadius: 16, background: 'linear-gradient(135deg,#dcbd6a 0%,#c8a74b 45%,#a8893a 100%)', color: '#0f3334', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 4, boxShadow: '0 0 12px rgba(200,167,75,0.35)' } as React.CSSProperties,
  tealBtn:  { width: '100%', padding: 10, border: '1px solid #0B9E8E', borderRadius: 16, background: 'transparent', color: '#0B9E8E', fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 } as React.CSSProperties,
  textarea: { width: '100%', marginTop: 8, padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid #2a6d6f', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#fff', resize: 'none' as const, outline: 'none', lineHeight: 1.5 } as React.CSSProperties,
  sessChip: { display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(11,158,142,.08)', border: '1px solid rgba(11,158,142,.2)', borderRadius: 10, padding: '10px 13px', marginBottom: 9 } as React.CSSProperties,
  vbox:     { flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid #1b4e4f', borderRadius: 10, padding: 11, textAlign: 'center' as const } as React.CSSProperties,
}

function chip(sel: boolean): React.CSSProperties {
  return { padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: sel ? 'rgba(11,158,142,.2)' : 'rgba(255,255,255,.04)', color: sel ? '#0B9E8E' : 'hsl(181,15%,48%)', borderColor: sel ? 'rgba(11,158,142,.4)' : '#1b4e4f' }
}

function radioOpt(sel: boolean): React.CSSProperties {
  return { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 13px', border: `1px solid ${sel ? '#c8a74b' : '#1b4e4f'}`, background: sel ? 'rgba(200,167,75,.07)' : 'transparent', borderRadius: 10, cursor: 'pointer', marginBottom: 7 }
}

function radioDot(sel: boolean) {
  return (
    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? '#c8a74b' : '#2a6d6f'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? '#c8a74b' : 'transparent', marginTop: 1 }}>
      {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f3334' }} />}
    </div>
  )
}

function stepNum(state: 'done' | 'next' | 'wait', n: number) {
  const bg = state === 'done' ? 'rgba(76,175,125,.2)' : state === 'next' ? 'linear-gradient(135deg,#dcbd6a,#c8a74b)' : 'rgba(255,255,255,.06)'
  const col = state === 'done' ? '#4caf7d' : state === 'next' ? '#0f3334' : 'hsl(181,15%,48%)'
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 800, background: bg, color: col }}>
      {state === 'done' ? '✓' : n}
    </div>
  )
}

function tealAccent() {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#0B9E8E,#c8a74b)' }} />
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'wellness' | 'symptoms' | 'labs' | 'prep' | 'request'

export default function HealthHubPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState<Tab>('labs')
  const today = format(new Date(), 'yyyy-MM-dd')
  const [loading, setLoading] = useState(true)

  // Wellness data
  const [nextSession, setNextSession] = useState<Session | null>(null)
  const [todayLog, setTodayLog]         = useState<DailyLog | null>(null)
  const [latestBP, setLatestBP]         = useState<BPReading | null>(null)
  const [latestBS, setLatestBS]         = useState<BSReading | null>(null)
  const [bpHistory, setBpHistory]       = useState<BPReading[]>([])
  const [weekLogs, setWeekLogs]         = useState<DailyLog[]>([])

  // Symptoms
  const [symptomHistory, setSymptomHistory] = useState<SymptomLog[]>([])
  const [todaySymptoms, setTodaySymptoms]   = useState<string[]>([])
  const [symptomNote, setSymptomNote]       = useState('')
  const [savingSymptoms, setSavingSymptoms] = useState(false)

  // Labs
  const [labZones, setLabZones] = useState<LabZoneAssessment[]>([])

  // Session prep
  const [prepForm, setPrepForm] = useState({ whatChanged: '', topConcern: '', progressFeeling: '' })
  const [prepStatus, setPrepStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  // Review request
  const [reviewForm, setReviewForm] = useState({ docType: 'lab_results', mainQuestion: '', urgency: 'standard' })
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  // Protocol goals (from educator)
  type ClientProtocol = { goal_1: string | null; goal_2: string | null; active_phase: string | null; supplement_link: string | null; protocol_start_date: string | null }
  const [clientProtocol, setClientProtocol] = useState<ClientProtocol | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const weekStart = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const bpStart   = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const symStart  = format(subDays(new Date(), 14), 'yyyy-MM-dd')

    const [sessR, logR, bpR, bsR, bpHistR, weekR, symR, labR, prepR, protocolR] = await Promise.all([
      supabase.from('sessions').select('id,session_date,session_time,session_type').eq('user_id', user.id).eq('status', 'scheduled').gte('session_date', today).order('session_date').order('session_time').limit(1).maybeSingle(),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
      supabase.from('blood_pressure_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('blood_sugar_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('blood_pressure_logs').select('*').eq('user_id', user.id).gte('logged_at', bpStart).order('logged_at', { ascending: true }).limit(10),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', weekStart).order('log_date', { ascending: false }),
      supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('log_date', symStart).order('log_date', { ascending: false }),
      supabase.from('lab_zone_assessments').select('*').eq('user_id', user.id).order('priority').order('marker_group'),
      supabase.from('session_prep').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('client_protocols').select('goal_1,goal_2,active_phase,supplement_link,protocol_start_date').eq('user_id', user.id).maybeSingle(),
    ])

    if (sessR.data) setNextSession(sessR.data as Session)
    if (logR.data)  setTodayLog(logR.data as DailyLog)
    if (bpR.data)   setLatestBP(bpR.data as BPReading)
    if (bsR.data)   setLatestBS(bsR.data as BSReading)
    setBpHistory((bpHistR.data ?? []) as BPReading[])
    setWeekLogs((weekR.data ?? []) as DailyLog[])

    const symLogs = (symR.data ?? []) as SymptomLog[]
    setSymptomHistory(symLogs)
    setLabZones((labR.data ?? []) as LabZoneAssessment[])

    const todaySym = symLogs.find(l => l.log_date === today)
    if (todaySym) { setTodaySymptoms(todaySym.symptoms); setSymptomNote(todaySym.note ?? '') }

    if (prepR.data) {
      setPrepForm({
        whatChanged: prepR.data.what_changed ?? '',
        topConcern: prepR.data.top_concern ?? '',
        progressFeeling: prepR.data.progress_feeling ?? '',
      })
    }
    if (protocolR.data) setClientProtocol(protocolR.data as ClientProtocol)
    setLoading(false)
  }

  async function saveSymptoms() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSavingSymptoms(true)
    const { error } = await supabase.from('symptom_logs').upsert(
      { user_id: user.id, log_date: today, symptoms: todaySymptoms, note: symptomNote || null },
      { onConflict: 'user_id,log_date' }
    )
    setSavingSymptoms(false)
    if (error) { toast.error('Could not save. Try again.'); return }
    toast.success('Symptom log saved.')
    const symStart = format(subDays(new Date(), 14), 'yyyy-MM-dd')
    const { data } = await supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('log_date', symStart).order('log_date', { ascending: false })
    setSymptomHistory((data ?? []) as SymptomLog[])
  }

  async function submitPrep() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setPrepStatus('submitting')
    const record = { user_id: user.id, session_id: nextSession?.id ?? null, what_changed: prepForm.whatChanged || null, top_concern: prepForm.topConcern || null, progress_feeling: prepForm.progressFeeling || null }
    const { error } = await supabase.from('session_prep').insert(record)
    if (error) { toast.error('Could not save prep. Try again.'); setPrepStatus('idle'); return }
    const url = import.meta.env.VITE_N8N_SESSION_PREP_WEBHOOK_URL
    if (url) fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '' }, body: JSON.stringify({ submissionType: 'session_prep', userId: user.id, clientName: profile ? `${profile.first_name} ${profile.last_name}` : '', sessionDate: nextSession?.session_date ?? null, ...record }) }).catch(() => {})
    setPrepStatus('success')
  }

  async function submitReview() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setReviewStatus('submitting')
    const record = { user_id: user.id, doc_type: reviewForm.docType, main_question: reviewForm.mainQuestion || null, urgency: reviewForm.urgency, status: 'submitted' }
    const { error } = await supabase.from('clinical_review_requests').insert(record)
    if (error) { toast.error('Could not submit request. Try again.'); setReviewStatus('idle'); return }
    const url = import.meta.env.VITE_N8N_CLINICAL_REVIEW_WEBHOOK_URL
    if (url) fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '' }, body: JSON.stringify({ submissionType: 'clinical_review_request', userId: user.id, clientName: profile ? `${profile.first_name} ${profile.last_name}` : '', clientEmail: user.email, ...record }) }).catch(() => {})
    setReviewStatus('success')
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const weekSteps  = weekAvg(weekLogs, 'steps')
  const weekWater  = weekAvg(weekLogs, 'water_oz')
  const weekEnergy = weekAvg(weekLogs, 'energy_level')
  const suppDays   = weekBoolCount(weekLogs, 'supplement_am_done')

  const reviewed   = labZones.filter(z => z.zone !== 'pending')
  const optimal    = labZones.filter(z => z.zone === 'optimal').length
  const subopt     = labZones.filter(z => z.zone === 'suboptimal').length
  const lowhigh    = labZones.filter(z => z.zone === 'low' || z.zone === 'high').length
  const pending    = labZones.filter(z => z.zone === 'pending').length
  const priorities = labZones.filter(z => z.priority > 0 && z.zone !== 'pending').sort((a, b) => a.priority - b.priority).slice(0, 3)

  const byGroup = (g: string) => labZones.filter(z => z.marker_group === g && z.zone !== 'pending')
  const prepComplete = !!(prepForm.whatChanged && prepForm.topConcern && prepForm.progressFeeling)

  const ringC = 264
  const ringFill = labZones.length > 0 ? (reviewed.length / labZones.length) * ringC : 0

  // ─── Session banner (reused across tabs) ──────────────────────────────────

  const SessionBanner = () => nextSession ? (
    <div style={CSS.sessChip}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0B9E8E', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 12, color: 'hsl(181,20%,68%)' }}>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 1 }}>
          Next: Dr. Hunter — {fmtDate(nextSession.session_date)} at {fmtTime(nextSession.session_time)}
        </div>
        {nextSession.session_type}
      </div>
    </div>
  ) : null

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={CSS.page}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#fff' }}>My Health Hub</h1>
        <p style={{ fontSize: 13, color: 'hsl(181,20%,68%)', lineHeight: 1.5 }}>Your wellness picture, built from what you track. Lab interpretation comes from Dr. Hunter's clinical review.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 16, padding: 4, marginBottom: 20, overflowX: 'auto' }}>
        {(['wellness', 'symptoms', 'labs', 'prep', 'request'] as Tab[]).map(t => {
          const labels: Record<Tab, string> = { wellness: 'Wellness', symptoms: 'Symptoms', labs: 'Labs', prep: 'Session Prep', request: 'Request' }
          const on = tab === t
          return (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, minWidth: 64, padding: '7px 6px', border: 'none', borderRadius: 10, background: on ? 'linear-gradient(135deg,#dcbd6a 0%,#c8a74b 45%,#a8893a 100%)' : 'transparent', color: on ? '#0f3334' : 'hsl(181,15%,48%)', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: on ? '0 0 12px rgba(200,167,75,0.35)' : 'none' }}>
              {labels[t]}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'hsl(181,15%,48%)' }}>Loading your health data...</div>
      ) : (
        <>

          {/* ═══ WELLNESS ═══════════════════════════════════════════════════ */}
          {tab === 'wellness' && (() => {
            const bpZone = latestBP ? getBPZone(latestBP.systolic, latestBP.diastolic) : null
            const bsZone = latestBS ? getBSZone(latestBS.glucose_mg_dl, latestBS.reading_context) : null
            const bpCol  = bpZone === 'normal' ? '#4caf7d' : bpZone === 'elevated' ? '#f59e0b' : '#e05c5c'
            const bsCol  = bsZone === 'normal' ? '#4caf7d' : bsZone === 'above_typical' ? '#f59e0b' : '#e05c5c'
            const bpTrend = bpHistory.length > 1
              ? (bpHistory[bpHistory.length - 1].systolic < bpHistory[0].systolic ? 'Improving' : bpHistory[bpHistory.length - 1].systolic === bpHistory[0].systolic ? 'Stable' : 'Rising')
              : null
            const phaseLabels: Record<string, { label: string; color: string }> = {
              phase_0: { label: 'Phase 0: Open Drainage', color: '#0B9E8E' },
              phase_1: { label: 'Phase 1: Kill Phase', color: '#e05c5c' },
              phase_2: { label: 'Phase 2: Gut Healing', color: '#4caf7d' },
              phase_3: { label: 'Phase 3: Microbiome Restore', color: '#c8a74b' },
            }
            const phase = clientProtocol?.active_phase ? (phaseLabels[clientProtocol.active_phase] ?? null) : null

            return (
              <>
                <SessionBanner />

                {/* Protocol Goals Card */}
                {clientProtocol && (clientProtocol.goal_1 || clientProtocol.goal_2) && (
                  <div style={{ ...CSS.card, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                    {tealAccent()}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#c8a74b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Protocol Goals</div>
                      {phase && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: phase.color, background: `${phase.color}18`, border: `1px solid ${phase.color}40`, borderRadius: 20, padding: '3px 9px' }}>
                          {phase.label}
                        </div>
                      )}
                    </div>
                    {clientProtocol.goal_1 && (
                      <div style={{ marginBottom: clientProtocol.goal_2 ? 10 : 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', marginBottom: 3 }}>Goal 1</div>
                        <div style={{ fontSize: 13, color: 'hsl(181,20%,68%)', lineHeight: 1.5 }}>{clientProtocol.goal_1}</div>
                      </div>
                    )}
                    {clientProtocol.goal_2 && (
                      <div style={{ marginBottom: clientProtocol.supplement_link ? 12 : 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', marginBottom: 3, marginTop: clientProtocol.goal_1 ? 0 : 0 }}>Goal 2</div>
                        <div style={{ fontSize: 13, color: 'hsl(181,20%,68%)', lineHeight: 1.5 }}>{clientProtocol.goal_2}</div>
                      </div>
                    )}
                    {clientProtocol.supplement_link && (
                      <a
                        href={clientProtocol.supplement_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12, fontWeight: 600, color: '#c8a74b', textDecoration: 'none', border: '1px solid rgba(200,167,75,0.3)', borderRadius: 8, padding: '6px 12px', background: 'rgba(200,167,75,0.07)' }}
                      >
                        View Supplement Protocol
                        <span style={{ fontSize: 11 }}>&#8599;</span>
                      </a>
                    )}
                  </div>
                )}

                <div style={CSS.sl}>Today</div>
                <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
                  <div style={CSS.vbox}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', marginBottom: 3 }}>Blood Pressure</div>
                    {latestBP ? <>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19, fontWeight: 800, color: bpCol }}>{latestBP.systolic}<span style={{ fontSize: 10, color: 'hsl(181,15%,48%)' }}>/{latestBP.diastolic}</span></div>
                      <div style={{ fontSize: 10, marginTop: 3, color: bpCol }}>{bpZone === 'normal' ? 'Optimal' : bpZone === 'elevated' ? 'Elevated' : 'High'}</div>
                    </> : <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginTop: 4 }}>No reading</div>}
                  </div>
                  <div style={CSS.vbox}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', marginBottom: 3 }}>Glucose</div>
                    {latestBS ? <>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19, fontWeight: 800, color: bsCol }}>{latestBS.glucose_mg_dl}<span style={{ fontSize: 10, color: 'hsl(181,15%,48%)' }}> mg/dL</span></div>
                      <div style={{ fontSize: 10, marginTop: 3, color: bsCol }}>{BS_ZONE_LABELS[bsZone ?? 'normal'].split(':')[0]}</div>
                    </> : <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginTop: 4 }}>No reading</div>}
                  </div>
                  <div style={CSS.vbox}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', marginBottom: 3 }}>Energy</div>
                    {todayLog?.energy_level ? <>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 19, fontWeight: 800, color: '#c8a74b' }}>{todayLog.energy_level}<span style={{ fontSize: 10, color: 'hsl(181,15%,48%)' }}>/5</span></div>
                      <div style={{ fontSize: 10, marginTop: 3, color: '#c8a74b' }}>{todayLog.energy_level >= 4 ? 'Good' : todayLog.energy_level >= 3 ? 'Moderate' : 'Low'}</div>
                    </> : <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginTop: 4 }}>Not logged</div>}
                  </div>
                </div>

                {bpHistory.length > 0 && <>
                  <div style={CSS.sl}>Blood pressure trend</div>
                  <div style={{ ...CSS.card, padding: '13px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'hsl(181,15%,48%)' }}>Systolic — last {bpHistory.length} readings</span>
                      {bpTrend && <span style={{ fontSize: 12, color: bpTrend === 'Improving' ? '#4caf7d' : bpTrend === 'Stable' ? '#f59e0b' : '#e05c5c' }}>{bpTrend}</span>}
                    </div>
                    <BPSparkline readings={bpHistory} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'hsl(181,15%,48%)' }}>
                      <span>{format(new Date(bpHistory[0].logged_at), 'MMM d')}</span>
                      <span>Today</span>
                    </div>
                  </div>
                </>}

                <div style={CSS.sl}>This week</div>
                <div style={{ ...CSS.card, padding: '13px 14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { icon: '💧', label: 'Hydration', val: weekWater > 0 ? `${weekWater} oz avg` : 'No data', col: '#4caf7d' },
                      { icon: '🚶', label: 'Steps',     val: weekSteps > 0 ? `${weekSteps.toLocaleString()} avg` : 'No data', col: '#c8a74b' },
                      { icon: '💊', label: 'Supplements', val: `${suppDays} of 7 days`, col: '#0B9E8E' },
                      { icon: '⚡', label: 'Energy avg',  val: weekEnergy > 0 ? `${weekEnergy}/5` : 'No data', col: '#c8a74b' },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center', padding: 8, background: `${item.col}12`, borderRadius: 10, border: `1px solid ${item.col}28` }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>{item.icon}</div>
                        <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)' }}>{item.label}</div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, color: item.col }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={CSS.infoBox}>
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <div>Clinical labs and visit summaries live in the secure clinical lane. Dr. Hunter reviews them there and brings her interpretation to your session. Go to <strong style={{ color: '#fff' }}>Labs</strong> to see zone assessments, or <strong style={{ color: '#fff' }}>Request</strong> to submit new documents.</div>
                </div>
              </>
            )
          })()}

          {/* ═══ SYMPTOMS ════════════════════════════════════════════════════ */}
          {tab === 'symptoms' && (() => {
            const pattern = topSymptoms(symptomHistory.slice(0, 7))
            const todayEntry = symptomHistory.find(l => l.log_date === today)
            return (
              <>
                {pattern && (
                  <div style={CSS.tealBox}>
                    {tealAccent()}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#0B9E8E', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0B9E8E' }} />
                      Pattern — last 7 days
                    </div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#fff' }}>Most frequent: {pattern}</div>
                    <div style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55 }}>Dr. Hunter will see this pattern in your session prep report.</div>
                  </div>
                )}

                <div style={CSS.sl}>How are you feeling today?</div>
                <div style={{ ...CSS.card, padding: '13px 14px' }}>
                  <div style={CSS.lbl}>Select everything that applies</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SYMPTOM_OPTIONS.map(sym => (
                      <button key={sym} onClick={() => setTodaySymptoms(p => p.includes(sym) ? p.filter(x => x !== sym) : [...p, sym])} style={chip(todaySymptoms.includes(sym))}>
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ ...CSS.card, padding: '13px 14px' }}>
                  <div style={CSS.lbl}>Add a note (optional)</div>
                  <textarea style={CSS.textarea} rows={3} placeholder="Anything else worth logging: what you ate, what was different today, how intense things feel..." value={symptomNote} onChange={e => setSymptomNote(e.target.value)} />
                </div>

                {symptomHistory.filter(l => l.log_date !== today).length > 0 && <>
                  <div style={CSS.sl}>Recent history</div>
                  <div style={{ ...CSS.card, padding: '11px 13px' }}>
                    {symptomHistory.filter(l => l.log_date !== today).slice(0, 6).map((log, i, arr) => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #1b4e4f' : 'none' }}>
                        <span style={{ fontSize: 13 }}>{format(new Date(log.log_date + 'T12:00:00'), 'MMM d')}</span>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {log.symptoms.length === 0
                            ? <span style={{ fontSize: 11, color: 'hsl(181,15%,48%)' }}>None logged</span>
                            : log.symptoms.slice(0, 3).map(sym => (
                              <span key={sym} style={{ fontSize: 11, background: 'rgba(11,158,142,.12)', color: '#0B9E8E', padding: '2px 7px', borderRadius: 99 }}>{sym}</span>
                            ))}
                          {log.symptoms.length > 3 && <span style={{ fontSize: 11, color: 'hsl(181,15%,48%)' }}>+{log.symptoms.length - 3}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>}

                <button style={CSS.goldBtn} onClick={saveSymptoms} disabled={savingSymptoms}>
                  {savingSymptoms ? 'Saving...' : todayEntry ? "Update Today's Log" : "Save Today's Log"}
                </button>
              </>
            )
          })()}

          {/* ═══ LABS ════════════════════════════════════════════════════════ */}
          {tab === 'labs' && (
            <>
              <div style={CSS.tealBox}>
                {tealAccent()}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                  <span style={{ fontSize: 18 }}>🔬</span>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>Lab Insights — Dr. Hunter's Interpretation</div>
                </div>
                <div style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55, marginBottom: 10 }}>
                  Raw lab values stay in the secure clinical workspace. What you see here is Dr. Hunter's zone assessment: where each marker sits and what it means for your wellness.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[
                    { label: 'Your labs\nin clinical lane', col: 'gold' },
                    null,
                    { label: 'Dr. Hunter\ninterprets', col: 'gold' },
                    null,
                    { label: 'Zone + note\nsyncs to app', col: 'teal' },
                  ].map((item, i) => item === null
                    ? <span key={i} style={{ color: 'hsl(181,15%,48%)', fontSize: 14 }}>→</span>
                    : <div key={i} style={{ flex: 1, textAlign: 'center', padding: '7px 4px', borderRadius: 10, fontSize: 10, fontWeight: 600, lineHeight: 1.4, background: item.col === 'gold' ? 'rgba(200,167,75,.12)' : 'rgba(11,158,142,.1)', border: `1px solid ${item.col === 'gold' ? 'rgba(200,167,75,.22)' : 'rgba(11,158,142,.22)'}`, color: item.col === 'gold' ? '#c8a74b' : '#0B9E8E' }}>{item.label}</div>
                  )}
                </div>
              </div>

              {labZones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(181,15%,48%)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🧬</div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: 'hsl(181,20%,68%)', marginBottom: 6 }}>No lab zones on file yet</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>Submit your labs for review and Dr. Hunter will post her zone assessment here within 3 business days.</div>
                  <button style={{ ...CSS.goldBtn, marginTop: 0 }} onClick={() => setTab('request')}>Submit Labs for Review</button>
                </div>
              ) : <>
                <div style={{ ...CSS.card, padding: '15px 14px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 4, fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 700, color: 'hsl(181,15%,48%)', textTransform: 'uppercase', letterSpacing: '.7px' }}>Overall Panel</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <div style={{ position: 'relative', width: 96, height: 96 }}>
                      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
                        <circle cx="48" cy="48" r="42" fill="none" stroke="url(#hg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${ringFill} ${ringC}`} />
                        <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#dcbd6a" /><stop offset="100%" stopColor="#c8a74b" /></linearGradient></defs>
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 800, color: '#c8a74b', lineHeight: 1 }}>{reviewed.length}/{labZones.length}</div>
                        <div style={{ fontSize: 10, color: 'hsl(181,15%,48%)', fontWeight: 600, marginTop: 2 }}>Reviewed</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {[['#4caf7d', `Optimal (${optimal})`], ['#f59e0b', `Suboptimal (${subopt})`], ['#e05c5c', `Low/High (${lowhigh})`], ['hsl(181,15%,48%)', `Pending (${pending})`]].map(([col, lbl]) => (
                      <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'hsl(181,15%,48%)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />{lbl}
                      </div>
                    ))}
                  </div>
                </div>

                {priorities.length > 0 && <>
                  <div style={CSS.sl}>Dr. Hunter's priorities</div>
                  <div style={{ ...CSS.card, padding: '12px 14px' }}>
                    {priorities.map((z, i) => (
                      <div key={z.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: i < priorities.length - 1 ? '1px solid #1b4e4f' : 'none' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 800, background: z.priority === 1 ? 'rgba(224,92,92,.2)' : 'rgba(245,158,11,.18)', color: z.priority === 1 ? '#f08080' : '#f59e0b', marginTop: 1 }}>{z.priority}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{z.marker_label} — {zoneLabel(z.zone)}</div>
                          <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', lineHeight: 1.45 }}>{z.educator_note ? z.educator_note.split('.')[0] + '.' : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>}

                {(['hormones', 'nutrients', 'metabolic'] as const).map(group => {
                  const items = byGroup(group)
                  if (!items.length) return null
                  return (
                    <div key={group}>
                      <GroupDivider label={group.charAt(0).toUpperCase() + group.slice(1)} />
                      {items.map(z => <ZoneCard key={z.id} z={z} />)}
                    </div>
                  )
                })}

                {pending > 0 && <>
                  <GroupDivider label="Pending Review" />
                  {labZones.filter(z => z.zone === 'pending').map(z => <ZoneCard key={z.id} z={z} />)}
                </>}

                <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', textAlign: 'center', padding: '12px 0 4px', lineHeight: 1.6 }}>
                  Reviewed by Dr. Shallanda Hunter, PharmD, MBA, CFNMP<br />
                  Raw values are stored in the secure clinical workspace, not in this app.
                </div>
              </>}

              <button style={CSS.goldBtn} onClick={() => setTab('request')}>Submit New Labs for Review</button>
              {labZones.length > 0 && <button style={CSS.tealBtn} onClick={() => setTab('prep')}>Add to Session Prep</button>}
            </>
          )}

          {/* ═══ SESSION PREP ════════════════════════════════════════════════ */}
          {tab === 'prep' && (
            prepStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 800, color: '#4caf7d', marginBottom: 8 }}>Session prep submitted</div>
                <div style={{ fontSize: 13, color: 'hsl(181,20%,68%)', lineHeight: 1.6 }}>Dr. Hunter will review this before your session. If you have new labs to discuss, submit them using the Request tab.</div>
                <button style={{ ...CSS.tealBtn, marginTop: 20 }} onClick={() => setTab('request')}>Submit Labs for Review</button>
              </div>
            ) : <>
              <SessionBanner />
              <div style={CSS.sl}>Session prep checklist</div>
              <div style={{ ...CSS.card, padding: '12px 14px' }}>
                {([
                  { title: 'Wellness summary auto-generated', sub: 'Your BP trend, glucose, energy, and steps from the last 30 days are included automatically.', state: 'done' },
                  { title: 'Symptom log attached', sub: '14-day symptom history will be visible to Dr. Hunter before your session.', state: 'done' },
                  { title: 'Answer 3 session questions', sub: 'Helps Dr. Hunter prepare targeted content for you.', state: prepComplete ? 'done' : 'next' },
                  { title: 'Request lab review (if you have new labs)', sub: 'Trigger a clinical lane review so Dr. Hunter can interpret your results before the session.', state: 'wait' },
                ] as { title: string; sub: string; state: 'done' | 'next' | 'wait' }[]).map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: i < 3 ? '1px solid #1b4e4f' : 'none' }}>
                    {stepNum(step.state, i + 1)}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', lineHeight: 1.4 }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={CSS.sl}>Step 3: Answer these 3 questions</div>

              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                <div style={CSS.lbl}>What has changed since your last session?</div>
                <textarea style={CSS.textarea} rows={2} placeholder="New labs, new symptoms, anything different in how you feel..." value={prepForm.whatChanged} onChange={e => setPrepForm(f => ({ ...f, whatChanged: e.target.value }))} />
              </div>

              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                <div style={CSS.lbl}>What is your top concern or question?</div>
                <textarea style={CSS.textarea} rows={2} placeholder="What do you most want to leave the session understanding?" value={prepForm.topConcern} onChange={e => setPrepForm(f => ({ ...f, topConcern: e.target.value }))} />
              </div>

              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                <div style={{ ...CSS.lbl, marginBottom: 9 }}>How are you feeling about your progress?</div>
                {PROGRESS_OPTIONS.map(opt => (
                  <div key={opt} onClick={() => setPrepForm(f => ({ ...f, progressFeeling: opt }))} style={radioOpt(prepForm.progressFeeling === opt)}>
                    {radioDot(prepForm.progressFeeling === opt)}
                    <div style={{ fontSize: 13 }}>{opt}</div>
                  </div>
                ))}
              </div>

              <button style={{ ...CSS.goldBtn, opacity: prepComplete ? 1 : 0.5 }} onClick={submitPrep} disabled={prepStatus === 'submitting' || !prepComplete}>
                {prepStatus === 'submitting' ? 'Submitting...' : 'Submit Session Prep'}
              </button>
              <button style={CSS.tealBtn} onClick={() => setTab('request')}>I have new labs to discuss</button>
            </>
          )}

          {/* ═══ REVIEW REQUEST ══════════════════════════════════════════════ */}
          {tab === 'request' && (
            reviewStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 800, color: '#4caf7d', marginBottom: 8 }}>Review request submitted</div>
                <div style={{ fontSize: 13, color: 'hsl(181,20%,68%)', lineHeight: 1.6 }}>Watch for a secure upload link at your email address within a few hours. Dr. Hunter will post her zone assessment to your Labs tab after review.</div>
                <button style={{ ...CSS.tealBtn, marginTop: 20 }} onClick={() => setTab('labs')}>View My Labs Tab</button>
              </div>
            ) : <>
              <div style={CSS.warnBox}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <div><strong>Clinical lane handoff.</strong> Lab results, visit summaries, and medical records are handled outside this app in a secure, HIPAA-covered environment. This form routes your request there.</div>
              </div>

              <div style={CSS.tealBox}>
                {tealAccent()}
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#fff' }}>You request. Dr. Hunter interprets. You learn.</div>
                <div style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55 }}>You tell us what you have. Dr. Hunter reviews the document in the secure clinical lane and posts a plain-language zone assessment to your Labs tab. The document never touches this app.</div>
              </div>

              <div style={CSS.sl}>What do you have to discuss?</div>
              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                {DOC_TYPES.map(dt => (
                  <div key={dt.value} onClick={() => setReviewForm(f => ({ ...f, docType: dt.value }))} style={radioOpt(reviewForm.docType === dt.value)}>
                    {radioDot(reviewForm.docType === dt.value)}
                    <div>
                      <div style={{ fontSize: 13 }}>{dt.label}</div>
                      <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginTop: 1 }}>{dt.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                <div style={CSS.lbl}>What is your main question about it?</div>
                <textarea style={CSS.textarea} rows={3} placeholder="What do you want to understand? What confused you? What are you worried about?" value={reviewForm.mainQuestion} onChange={e => setReviewForm(f => ({ ...f, mainQuestion: e.target.value }))} />
              </div>

              <div style={{ ...CSS.card, padding: '13px 14px' }}>
                <div style={{ ...CSS.lbl, marginBottom: 9 }}>When do you need this reviewed?</div>
                {[
                  { value: 'standard', label: nextSession ? `Before my next session (${fmtDate(nextSession.session_date)})` : 'Before my next session', sub: 'Standard — reviewed within 3 business days' },
                  { value: 'urgent',   label: 'As soon as possible', sub: 'Urgent — Dr. Hunter will reach out within 1 business day' },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setReviewForm(f => ({ ...f, urgency: opt.value }))} style={radioOpt(reviewForm.urgency === opt.value)}>
                    {radioDot(reviewForm.urgency === opt.value)}
                    <div>
                      <div style={{ fontSize: 13 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', marginTop: 1 }}>{opt.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#1b4e4f' }} />
                <span style={{ fontSize: 11, color: 'hsl(181,15%,48%)' }}>After you submit</span>
                <div style={{ flex: 1, height: 1, background: '#1b4e4f' }} />
              </div>

              {[
                { title: "You'll receive a secure upload link by email", sub: "Send your document to that link only. Do not email the document directly." },
                { title: "Dr. Hunter reviews it in the secure clinical workspace", sub: "The document stays in the clinical lane. It is never stored in this app." },
                { title: "Your Labs tab updates with her zone assessment", sub: "What the results mean for your wellness goals, what to ask your doctor, and what to focus on in your session." },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: i < 2 ? '1px solid #1b4e4f' : 'none' }}>
                  {stepNum('done', i + 1)}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 11, color: 'hsl(181,15%,48%)', lineHeight: 1.4 }}>{step.sub}</div>
                  </div>
                </div>
              ))}

              <button style={{ ...CSS.goldBtn, marginTop: 16 }} onClick={submitReview} disabled={reviewStatus === 'submitting'}>
                {reviewStatus === 'submitting' ? 'Submitting...' : 'Submit Review Request'}
              </button>
            </>
          )}

        </>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import styles from './MorningProtocolPage.module.css'

interface Step {
  id: string
  label: string
  pillar: string
  pillarIcon: string
  pts: number
}

const STEPS: Step[] = [
  { id: 'water',       label: 'Hydrate 16oz water on wake',       pillar: 'Sleep',        pillarIcon: '◑', pts: 10 },
  { id: 'no_phone',    label: 'No phone for 30 min after wake',    pillar: 'Stress',       pillarIcon: '◷', pts: 5  },
  { id: 'sunlight',    label: 'Morning sunlight 5+ min',           pillar: 'Energy',       pillarIcon: '★', pts: 7  },
  { id: 'weigh',       label: 'Weigh in and log',                  pillar: 'Metabolic',    pillarIcon: '◉', pts: 5  },
  { id: 'supplements', label: 'Take morning supplements',          pillar: 'Supplements',  pillarIcon: '⬡', pts: 10 },
  { id: 'fasting',     label: 'Log fasting window',                pillar: 'Nutrition',    pillarIcon: '⚡', pts: 5  },
  { id: 'bp',          label: 'Blood pressure check (if applicable)', pillar: 'Metabolic', pillarIcon: '◉', pts: 5  },
  { id: 'bs',          label: 'Blood sugar check (if applicable)', pillar: 'Metabolic',    pillarIcon: '◉', pts: 5  },
  { id: 'movement',    label: 'Movement 10+ min',                  pillar: 'Movement',     pillarIcon: '◎', pts: 10 },
  { id: 'protein',     label: 'Protein-first breakfast',           pillar: 'Nutrition',    pillarIcon: '⚡', pts: 8  },
  { id: 'goals',       label: 'Review health goals',               pillar: 'Energy',       pillarIcon: '★', pts: 3  },
  { id: 'cold_water',  label: 'Cold water rinse or face wash',     pillar: 'Stress',       pillarIcon: '◷', pts: 3  },
  { id: 'gratitude',   label: 'Gratitude or intention',            pillar: 'Stress',       pillarIcon: '◷', pts: 4  },
  { id: 'caffeine',    label: 'No caffeine for 90 min after wake', pillar: 'Hormone',      pillarIcon: '◈', pts: 8  },
  { id: 'mood',        label: 'Log mood/energy 1-10',              pillar: 'Energy',       pillarIcon: '★', pts: 12 },
]

const RING_R = 58
const RING_SIZE = 140
const RING_C = 2 * Math.PI * RING_R

function scoreColor(score: number): string {
  if (score >= 80) return '#2be0c8'
  if (score >= 50) return '#0B9E8E'
  if (score >= 30) return '#c8a74b'
  return '#5a9a9b'
}

export default function MorningProtocolPage() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (user?.id) void fetchToday()
  }, [user?.id])

  async function fetchToday() {
    const { data } = await supabase
      .from('morning_logs')
      .select('steps_completed')
      .eq('user_id', user!.id)
      .eq('log_date', today)
      .maybeSingle()
    if (data?.steps_completed) {
      setChecked(data.steps_completed as Record<string, boolean>)
    }
    setLoaded(true)
  }

  async function toggleStep(stepId: string) {
    if (!user?.id) return
    const next = { ...checked, [stepId]: !checked[stepId] }
    setChecked(next)
    setSaving(true)
    const score = STEPS.reduce((s, step) => s + (next[step.id] ? step.pts : 0), 0)
    const { error } = await supabase
      .from('morning_logs')
      .upsert(
        { user_id: user.id, log_date: today, steps_completed: next, score },
        { onConflict: 'user_id,log_date' }
      )
    if (error) {
      setChecked(checked)
      toast.error('Could not save step.')
    }
    setSaving(false)
  }

  const score = STEPS.reduce((s, step) => s + (checked[step.id] ? step.pts : 0), 0)
  const completed = STEPS.filter(s => checked[s.id]).length
  const ringOffset = RING_C * (1 - score / 100)
  const color = scoreColor(score)

  function scoreLabel(s: number): string {
    if (s === 100) return 'Perfect morning.'
    if (s >= 80) return 'Strong start.'
    if (s >= 50) return 'Solid progress.'
    if (s >= 20) return 'Keep going.'
    return 'Start your morning.'
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Morning Protocol Score</h1>
        <p className={styles.sub}>15 steps. 100 points. Every morning is a fresh reset.</p>
      </div>

      {!loaded ? (
        <div className={styles.loading}>Loading today's log...</div>
      ) : (
        <div className={styles.body}>
          {/* Score ring */}
          <div className={styles.ringWrap}>
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className={styles.ring}
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
              />
              <text
                x={RING_SIZE / 2}
                y={RING_SIZE / 2 - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="28"
                fontWeight="800"
              >
                {score}
              </text>
              <text
                x={RING_SIZE / 2}
                y={RING_SIZE / 2 + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="11"
                fontWeight="500"
              >
                / 100
              </text>
            </svg>
            <div className={styles.ringMeta}>
              <div className={styles.ringLabel} style={{ color }}>{scoreLabel(score)}</div>
              <div className={styles.ringCount}>{completed} of {STEPS.length} steps complete</div>
              {saving && <div className={styles.savingDot}>Saving...</div>}
            </div>
          </div>

          {/* Step checklist */}
          <div className={styles.stepList}>
            {STEPS.map(step => {
              const done = !!checked[step.id]
              return (
                <button
                  key={step.id}
                  className={`${styles.stepRow} ${done ? styles.stepRowDone : ''}`}
                  onClick={() => void toggleStep(step.id)}
                >
                  <span className={`${styles.stepCheck} ${done ? styles.stepCheckDone : ''}`}>
                    {done ? '✓' : ''}
                  </span>
                  <span className={styles.stepBody}>
                    <span className={styles.stepLabel}>{step.label}</span>
                    <span className={styles.stepPillar}>
                      <span className={styles.pillarIcon}>{step.pillarIcon}</span>
                      {step.pillar}
                    </span>
                  </span>
                  <span className={styles.stepPts} style={{ color: done ? color : undefined }}>
                    +{step.pts}
                  </span>
                </button>
              )
            })}
          </div>

          <div className={styles.disclaimer}>
            Educational support only, not medical advice. Steps marked "if applicable" are optional based on your protocol.
          </div>
        </div>
      )}
    </div>
  )
}

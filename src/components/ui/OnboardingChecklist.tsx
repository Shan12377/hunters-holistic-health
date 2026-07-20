// First-week onboarding checklist. Shows on the client dashboard until every
// step is complete or the client hides it. Never renders for educators.
// ponytail: progress lives in localStorage (per device); move to a Supabase
// column if cross-device sync starts to matter.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { DailyLog, BPReading, BSReading } from '@/types'
import styles from '@/pages/client/Client.module.css'

const STORE_KEY = 'onboarding_steps_done'
const HIDE_KEY = 'onboarding_hidden'

interface Step {
  id: string
  label: string
  to: string
}

const STEPS: Step[] = [
  { id: 'log', label: 'Log one thing in your Daily Log (water counts)', to: '/app/daily-log' },
  { id: 'reading', label: 'Record a blood pressure or blood sugar reading', to: '/app/blood-pressure' },
  { id: 'roots', label: 'Meet your ROOTS Framework', to: '/app/protocol' },
  { id: 'nourish', label: 'Run one food through the Nourish Log', to: '/app/meal-guard' },
  { id: 'habit', label: 'Set one daily habit', to: '/app/habits' },
  { id: 'feed', label: 'Say hello in the Community Feed', to: '/app/feed' },
  { id: 'grade', label: 'Peek at your Weekly Grade', to: '/app/weekly-grade' },
]

function loadDone(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

interface OnboardingChecklistProps {
  todayLog: DailyLog | null
  latestBP: BPReading | null
  latestBS: BSReading | null
}

export default function OnboardingChecklist({ todayLog, latestBP, latestBS }: OnboardingChecklistProps) {
  const { profile } = useAuthStore()
  const [done, setDone] = useState<Record<string, boolean>>(loadDone)
  const [hidden, setHidden] = useState(() => localStorage.getItem(HIDE_KEY) === '1')

  if (profile?.role === 'educator' || hidden) return null

  // Data-backed steps complete themselves; link steps complete on tap.
  const merged: Record<string, boolean> = {
    ...done,
    log: done.log || !!todayLog,
    reading: done.reading || !!latestBP || !!latestBS,
  }

  const doneCount = STEPS.filter(s => merged[s.id]).length
  if (doneCount === STEPS.length) return null

  const markDone = (id: string) => {
    const next = { ...loadDone(), ...merged, [id]: true }
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
    setDone(next)
  }

  return (
    <div className={styles.onboardCard}>
      <div className={styles.onboardHeader}>
        <Sprout size={16} color="var(--gold)" />
        <span className={styles.onboardTitle}>Your first week, one small step a day</span>
        <span className={styles.onboardCount}>{doneCount} of {STEPS.length}</span>
      </div>
      <div className={styles.onboardList}>
        {STEPS.map(step => (
          merged[step.id] ? (
            <div key={step.id} className={styles.onboardItemDone}>
              ✓ {step.label}
            </div>
          ) : (
            <Link
              key={step.id}
              to={step.to}
              className={styles.onboardItem}
              onClick={() => markDone(step.id)}
            >
              ○ {step.label} →
            </Link>
          )
        ))}
      </div>
      <button
        className={styles.onboardHide}
        onClick={() => {
          localStorage.setItem(HIDE_KEY, '1')
          setHidden(true)
        }}
      >
        Hide this
      </button>
    </div>
  )
}

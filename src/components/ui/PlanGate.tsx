import { Link } from 'react-router-dom'
import { usePlan } from '@/hooks/usePlan'
import type { Plan } from '@/types'

const PLAN_LABELS: Record<Plan, string> = {
  foundation: 'Foundation',
  program:    'The Program',
  vip:        'VIP: The Intensive',
  overhaul:   'The 6-Month Overhaul',
}

interface Props {
  requiredPlan: Plan
  children: React.ReactNode
  label?: string
}

export default function PlanGate({ requiredPlan, children, label }: Props) {
  const { isAtLeast } = usePlan()
  if (isAtLeast(requiredPlan)) return <>{children}</>

  return (
    <div style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      maxWidth: 480,
      margin: '4rem auto',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
        {label ?? `This feature requires ${PLAN_LABELS[requiredPlan]} or higher.`}
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Upgrade your membership to unlock this tool.
      </p>
      <Link
        to="/#pricing"
        style={{
          display: 'inline-block',
          background: 'var(--teal)',
          color: '#0e1c1b',
          fontWeight: 700,
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.95rem',
        }}
      >
        See Membership Options
      </Link>
    </div>
  )
}

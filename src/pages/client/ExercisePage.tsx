import { useState } from 'react'
import { Dumbbell, Activity, BookOpen, FlameKindling } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import BackButton from '@/components/BackButton'
import ActivityLog from '@/components/workout/ActivityLog'
import styles from './Client.module.css'

const LEARN_CARDS = [
  {
    id: 'muscle',
    icon: Dumbbell,
    color: '#c8a74b',
    title: 'The Muscle Preservation Protocol',
    intro: 'Muscle is not just about appearance. It is your primary metabolic organ for glucose disposal. When lean tissue is lost during significant weight change, metabolic rate drops and glucose regulation worsens.',
    points: [
      'Resistance training 2-3 times per week (minimum effective dose). Weights, resistance bands, or bodyweight all qualify if you progressively increase the challenge.',
      'Post-workout protein: 25-30g within 2 hours of your session supports muscle protein synthesis.',
      '10-20 minute post-meal walk daily supports glucose clearance between sessions.',
      'Protein at or above your daily target every day, not just on training days.',
    ],
    note: 'The drug does the metabolic signaling work. But it cannot lift for you.',
  },
  {
    id: 'snacks',
    icon: FlameKindling,
    color: '#4be08a',
    title: 'Movement Snacks for Blood Sugar',
    intro: 'Prolonged sitting disrupts glucose regulation in ways that a single gym session does not fully reverse. Frequent, short bursts of movement throughout the day show compelling evidence.',
    points: [
      '3 minutes of walking OR 10 bodyweight squats every 45 minutes of sitting.',
      'These targeted bursts activate the quadriceps and glutes, which are your largest glucose disposal muscles.',
      'A 2023 study found this approach improved blood sugar regulation better than a single 30-minute walk.',
      'Set a phone reminder every 45 minutes if you have a desk-heavy day.',
    ],
    study: 'Research: doi.org/10.1111/sms.14628',
  },
  {
    id: 'bp',
    icon: Activity,
    color: '#e05c5c',
    title: 'Isometric Training for Blood Pressure',
    intro: 'Among all exercise types, isometric (static hold) training has the most consistent evidence for blood pressure support, according to a 2023 BJSM meta-analysis of 270 clinical trials.',
    points: [
      'Wall Sit Protocol: 4 sets of 2-minute wall sits, 2 minutes of rest between sets, 3 times per week.',
      'You can spread the 4 sets across your day if doing them back-to-back is not practical.',
      'How it works: static holds compress blood vessels briefly. The rebound on release triggers nitric oxide production and vessel dilation.',
      'Average blood pressure reduction: 8.2/4.0 mmHg, compared to 4.5/2.5 for aerobic training.',
    ],
    study: 'Research: bjsm.bmj.com/content/57/20/1317',
  },
  {
    id: 'hit',
    icon: Dumbbell,
    color: '#0b9e8e',
    title: 'Slow Lifting: Time Under Tension',
    intro: 'You do not need heavy weight to build strength. Slowing the movement down keeps the muscle working longer, which is where the adaptation comes from. It is also easier on the joints, so it is a good way back in if you have been away from lifting for a while.',
    points: [
      'Tempo: 3 seconds down (lowering phase), 1 second pause, 2 seconds up. Never rush through a rep.',
      'The tracker starts you at 3 sets of about 12 reps. One hard set still counts on a day when time is short.',
      'Train each muscle group at least twice a week. The sample week in the Workout Tracker shows one way to lay that out.',
      'Build your own routine in the tracker rather than following a fixed list. The one you will actually do beats the one on paper.',
      'Calf raises are worth keeping in. The lower leg works as a pump that helps push blood back up toward the heart.',
      'Slow controlled lifting builds muscle just as well as fast heavy lifting, without the strain of heaving a weight up.',
    ],
    note: 'Rest 2 minutes between exercises. Do not rush. The adaptation happens in the slow, deliberate tension phase, not the momentum phase. Educational only, not medical advice. Talk to your own physician before starting a new exercise routine.',
  },
  {
    id: 'nutrition',
    icon: BookOpen,
    color: '#9b59b6',
    title: 'Exercise and Nutrition Timing',
    intro: 'What you eat around your workouts influences how well your body adapts. The timing window after exercise is when muscle is most receptive to protein.',
    points: [
      'Protein within 2 hours post-workout: 25-30g is the research-supported range for muscle protein synthesis.',
      'On high-sweat training days, electrolytes (sodium, potassium, magnesium) replace what water alone cannot.',
      'Pre-workout: a light protein-forward snack 30-60 minutes before strength training supports performance.',
      'Post-meal movement (10-20 min walk) after your largest meal uses the glucose from that meal as fuel for recovery.',
    ],
    note: 'The Supplement Log inside this app is where you track your daily protocol. Nutrition timing and supplementation work together.',
  },
]

export default function ExercisePage() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [tab, setTab] = useState<'log' | 'learn'>('log')

  return (
    <div className="animate-fade-in">
      <BackButton />
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Dumbbell size={22} color="var(--gold)" /> Movement Log
          </h1>
          <p className={styles.pageTopDate}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.exTabs}>
        <button className={tab === 'log' ? styles.exTabActive : styles.exTab} onClick={() => setTab('log')}>Log Exercise</button>
        <button className={tab === 'learn' ? styles.exTabActive : styles.exTab} onClick={() => setTab('learn')}>Learn</button>
      </div>

      {/* LOG TAB. Shares the exact component and table the Workout Tracker's
          Movement tab uses (activity_sessions), so a walk logged from either
          page shows up on both. This used to be its own form writing to a
          separate exercise_logs table that nothing else read from, which is
          why movement logged here never carried over to the tracker. */}
      {tab === 'log' && <ActivityLog userId={user?.id} today={today} />}

      {/* LEARN TAB */}
      {tab === 'learn' && (
        <div className={styles.exLearnList}>
          {LEARN_CARDS.map(({ id, icon: Icon, color, title, intro, points, note, study }) => (
            <div key={id} className={styles.exLearnCard}>
              <div className={styles.exLearnCardTop}>
                <div className={styles.exLearnIcon} style={{ background: `${color}15`, borderColor: `${color}30` }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 className={styles.exLearnTitle}>{title}</h3>
              </div>
              <p className={styles.exLearnIntro}>{intro}</p>
              <ul className={styles.exLearnPoints}>
                {points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              {note && <div className={styles.exLearnNote}>{note}</div>}
              {study && <div className={styles.exLearnStudy}>{study}</div>}
            </div>
          ))}
          <p className={styles.footerNote}>
            Educational content only. This platform provides functional medicine education, not medical advice. Consult your healthcare provider before starting a new exercise program.
          </p>
        </div>
      )}
    </div>
  )
}

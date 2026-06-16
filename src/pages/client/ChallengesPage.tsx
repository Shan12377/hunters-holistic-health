import { useEffect, useState } from 'react'
import { Zap, CheckCircle, Clock, Users, CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, parseISO, differenceInDays, isAfter, isBefore, isToday } from 'date-fns'
import toast from 'react-hot-toast'
import { awardPoints } from '@/lib/points'
import styles from './Client.module.css'

interface Challenge {
  id: string
  title: string
  description: string | null
  goal_description: string | null
  start_date: string
  end_date: string
  is_active: boolean
}

interface ChallengeLog {
  challenge_id: string
  log_date: string
}

interface ParticipantCount {
  challenge_id: string
  count: number
}

type ChallengeStatus = 'active' | 'upcoming' | 'past'

function getStatus(start: string, end: string): ChallengeStatus {
  const today = new Date()
  const s = parseISO(start)
  const e = parseISO(end)
  if (isAfter(s, today)) return 'upcoming'
  if (isBefore(e, today) && !isToday(e)) return 'past'
  return 'active'
}

export default function ChallengesPage() {
  const { user } = useAuthStore()
  const [challenges, setChallenges]   = useState<Challenge[]>([])
  const [myLogs, setMyLogs]           = useState<ChallengeLog[]>([])
  const [counts, setCounts]           = useState<ParticipantCount[]>([])
  const [loading, setLoading]         = useState(true)
  const [checkingIn, setCheckingIn]   = useState<string | null>(null)

  useEffect(() => { if (user?.id) fetchAll() }, [user?.id])

  const fetchAll = async () => {
    const [{ data: ch }, { data: logs }, { data: cnt }] = await Promise.all([
      supabase.from('challenges').select('*').eq('is_active', true).order('start_date', { ascending: true }),
      supabase.from('challenge_logs').select('challenge_id, log_date').eq('user_id', user!.id),
      supabase.from('challenge_logs').select('challenge_id').eq('user_id', user!.id),
    ])
    setChallenges((ch ?? []) as Challenge[])
    setMyLogs((logs ?? []) as ChallengeLog[])

    // Fetch participant counts separately per challenge
    if (ch && ch.length > 0) {
      const ids = ch.map((c: Challenge) => c.id)
      const countMap: ParticipantCount[] = []
      for (const id of ids) {
        const { count } = await supabase
          .from('challenge_logs')
          .select('user_id', { count: 'exact', head: true })
          .eq('challenge_id', id)
        countMap.push({ challenge_id: id, count: count ?? 0 })
      }
      setCounts(countMap)
    }

    setLoading(false)
  }

  const checkedInToday = (challengeId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return myLogs.some(l => l.challenge_id === challengeId && l.log_date === today)
  }

  const myDaysLogged = (challengeId: string) => {
    return myLogs.filter(l => l.challenge_id === challengeId).length
  }

  const totalDays = (start: string, end: string) => {
    return differenceInDays(parseISO(end), parseISO(start)) + 1
  }

  const handleCheckIn = async (challengeId: string) => {
    if (!user?.id) return
    const today = format(new Date(), 'yyyy-MM-dd')
    setCheckingIn(challengeId)
    const { error } = await supabase.from('challenge_logs').insert({
      challenge_id: challengeId,
      user_id: user.id,
      log_date: today,
    })
    if (error) {
      toast.error('Already checked in today.')
    } else {
      toast.success('Check-in logged!')
      setMyLogs(prev => [...prev, { challenge_id: challengeId, log_date: today }])
      await awardPoints(user.id, 'challenge_checkin', 5, `${challengeId}_${today}`)
    }
    setCheckingIn(null)
  }

  const active   = challenges.filter(c => getStatus(c.start_date, c.end_date) === 'active')
  const upcoming = challenges.filter(c => getStatus(c.start_date, c.end_date) === 'upcoming')
  const past     = challenges.filter(c => getStatus(c.start_date, c.end_date) === 'past')

  const participantCount = (id: string) => counts.find(c => c.challenge_id === id)?.count ?? 0

  const renderCard = (ch: Challenge, status: ChallengeStatus) => {
    const logged = myDaysLogged(ch.id)
    const total  = totalDays(ch.start_date, ch.end_date)
    const pct    = Math.min(100, Math.round((logged / total) * 100))
    const doneToday = checkedInToday(ch.id)
    const partCount = participantCount(ch.id)

    return (
      <div key={ch.id} className={styles.challengeCard}>
        <div className={styles.challengeCardTop}>
          <div className={styles.challengeIconWrap}>
            <Zap size={18} color="var(--gold)" />
          </div>
          <div className={styles.challengeMeta}>
            {status === 'active' && <span className={styles.challengeActivePill}>Active</span>}
            {status === 'upcoming' && <span className={styles.challengeUpcomingPill}>Upcoming</span>}
            {status === 'past' && <span className={styles.challengePastPill}>Completed</span>}
            <span className={styles.challengeDates}>
              <CalendarDays size={11} />
              {format(parseISO(ch.start_date), 'MMM d')} to {format(parseISO(ch.end_date), 'MMM d')}
            </span>
            {partCount > 0 && (
              <span className={styles.challengeParticipants}>
                <Users size={11} /> {partCount} {partCount === 1 ? 'participant' : 'participants'}
              </span>
            )}
          </div>
        </div>

        <h3 className={styles.challengeTitle}>{ch.title}</h3>
        {ch.goal_description && (
          <p className={styles.challengeGoal}>{ch.goal_description}</p>
        )}
        {ch.description && (
          <p className={styles.challengeDesc}>{ch.description}</p>
        )}

        {/* Progress */}
        {(status === 'active' || status === 'past') && (
          <div className={styles.challengeProgress}>
            <div className={styles.challengeProgressBar}>
              <div className={styles.challengeProgressFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.challengeProgressMeta}>
              <span className={styles.challengeProgressLabel}>
                {logged} of {total} days logged
              </span>
              <span className={styles.challengeProgressPct} style={{ color: pct >= 80 ? '#4be08a' : pct >= 50 ? '#c8a74b' : 'var(--text-muted)' }}>
                {pct}%
              </span>
            </div>
          </div>
        )}

        {status === 'active' && (
          <button
            className={doneToday ? styles.challengeCheckedBtn : styles.challengeCheckInBtn}
            onClick={() => !doneToday && handleCheckIn(ch.id)}
            disabled={doneToday || checkingIn === ch.id}
          >
            {doneToday
              ? <><CheckCircle size={15} /> Checked in today</>
              : checkingIn === ch.id
                ? 'Logging...'
                : <><Zap size={15} /> Check In Today</>
            }
          </button>
        )}

        {status === 'upcoming' && (
          <div className={styles.challengeUpcomingNote}>
            <Clock size={13} /> Starts {format(parseISO(ch.start_date), 'EEEE, MMMM d')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.challengesPage}>
      <div className={styles.challengesPageHeader}>
        <h1 className={styles.challengesTitle}>
          <Zap size={22} color="var(--gold)" /> Challenges
        </h1>
        <p className={styles.challengesSub}>Group challenges set by your educator. Check in daily to build your streak.</p>
      </div>

      {loading ? (
        <p className={styles.evEmpty}>Loading challenges...</p>
      ) : challenges.length === 0 ? (
        <div className={styles.evEmptyState}>
          <Zap size={40} color="var(--border)" />
          <p>No challenges yet. Check back soon.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <div className={styles.challengesSectionLabel}>Active Now</div>
              <div className={styles.challengesList}>
                {active.map(c => renderCard(c, 'active'))}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <div className={styles.challengesSectionLabel}>Coming Up</div>
              <div className={styles.challengesList}>
                {upcoming.map(c => renderCard(c, 'upcoming'))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <div className={styles.challengesSectionLabel}>Past</div>
              <div className={styles.challengesList}>
                {past.map(c => renderCard(c, 'past'))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

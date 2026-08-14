/**
 * Activity energy estimates.
 *
 * One source of truth for every number the activity log shows. Per Rule C in
 * CLAUDE.md, the display and the math both import from here. Nothing that
 * appears on screen is hardcoded in the component.
 *
 * Method: MET values from the 2011 Compendium of Physical Activities
 * (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-1581). A MET is a multiple
 * of resting energy use. Sitting still is 1 MET. An activity at 4 METs uses
 * about four times the energy of sitting.
 *
 * These are population averages. Two people the same weight doing the same walk
 * will not burn the same calories. Treat every number here as a rough guide,
 * never as a measurement.
 */

export type Intensity = 'easy' | 'moderate' | 'hard'
export type Location = 'indoor' | 'outdoor'

export interface ActivityType {
  key: string
  label: string
  emoji: string
  /** MET value at each intensity. */
  met: Record<Intensity, number>
  /** What each intensity feels like, in plain language. */
  intensityHint: Record<Intensity, string>
  /** Indoor and outdoor are meaningfully different for this activity. */
  hasLocation: boolean
  /**
   * Steps can be honestly estimated from cadence. Only true for activities
   * where feet actually strike the ground in a repeating stride. Rebounding and
   * cycling are movement, but they are not steps, and inventing a number for
   * them would be a made-up figure on screen.
   */
  countsSteps: boolean
  note?: string
}

/** Steps per minute by intensity, for walking-type activities only.
 *  Anchored on the widely replicated finding that roughly 100 steps per minute
 *  marks the threshold of moderate intensity walking in healthy adults
 *  (Tudor-Locke et al., Int J Behav Nutr Phys Act 2011). */
const WALK_CADENCE: Record<Intensity, number> = {
  easy: 95,
  moderate: 110,
  hard: 125,
}

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  {
    key: 'walk',
    label: 'Walking',
    emoji: '🚶🏾‍♀️',
    met: { easy: 2.8, moderate: 3.5, hard: 5.0 },
    intensityHint: {
      easy: 'Strolling. You could window shop.',
      moderate: 'Purposeful. You can talk but not sing.',
      hard: 'Brisk. Talking takes effort.',
    },
    hasLocation: true,
    countsSteps: true,
  },
  {
    key: 'rebounding',
    label: 'Rebounding',
    emoji: '🤸🏾‍♀️',
    met: { easy: 3.5, moderate: 4.5, hard: 6.0 },
    intensityHint: {
      easy: 'Health bounce. Heels barely leave the mat.',
      moderate: 'Steady jogging bounce.',
      hard: 'High knees, jumping jacks, working hard.',
    },
    hasLocation: false,
    countsSteps: false,
    note: 'Your feet are moving, but a bounce is not a step. No step estimate is shown for this one.',
  },
  {
    key: 'hiit',
    label: 'HIIT',
    emoji: '🔥',
    met: { easy: 6.0, moderate: 8.0, hard: 10.0 },
    intensityHint: {
      easy: 'Short bursts with long recovery.',
      moderate: 'Standard intervals. Hard bursts, brief rest.',
      hard: 'All out. Very short rest.',
    },
    hasLocation: false,
    countsSteps: false,
    note: 'Once or twice a week is where the benefit sits for most people. More than that tends to push cortisol up, which works against what you are trying to do.',
  },
  {
    key: 'strength',
    label: 'Strength training',
    emoji: '🏋🏾‍♀️',
    met: { easy: 3.5, moderate: 5.0, hard: 6.0 },
    intensityHint: {
      easy: 'Light weight, long rests.',
      moderate: 'Steady sets, short rests.',
      hard: 'Heavy, or circuit style with almost no rest.',
    },
    hasLocation: false,
    countsSteps: false,
  },
  {
    key: 'cycling',
    label: 'Cycling',
    emoji: '🚴🏾‍♀️',
    met: { easy: 4.0, moderate: 6.8, hard: 8.5 },
    intensityHint: {
      easy: 'Flat and easy.',
      moderate: 'Steady effort, some resistance.',
      hard: 'Hills or sprints.',
    },
    hasLocation: true,
    countsSteps: false,
  },
  {
    key: 'swimming',
    label: 'Swimming',
    emoji: '🏊🏾‍♀️',
    met: { easy: 4.5, moderate: 6.0, hard: 8.3 },
    intensityHint: {
      easy: 'Leisurely laps, plenty of rest.',
      moderate: 'Continuous freestyle.',
      hard: 'Fast laps, minimal rest.',
    },
    hasLocation: true,
    countsSteps: false,
  },
  {
    key: 'dancing',
    label: 'Dancing',
    emoji: '💃🏾',
    met: { easy: 3.5, moderate: 5.0, hard: 7.3 },
    intensityHint: {
      easy: 'Swaying, social dancing.',
      moderate: 'Full songs without stopping.',
      hard: 'Nonstop, breathing hard.',
    },
    hasLocation: false,
    countsSteps: false,
  },
  {
    key: 'yoga',
    label: 'Yoga or stretching',
    emoji: '🧘🏾‍♀️',
    met: { easy: 2.3, moderate: 3.0, hard: 4.0 },
    intensityHint: {
      easy: 'Restorative or gentle stretching.',
      moderate: 'Hatha, steady flow.',
      hard: 'Power or vinyasa.',
    },
    hasLocation: false,
    countsSteps: false,
  },
  {
    key: 'housework',
    label: 'Housework or yard work',
    emoji: '🧹',
    met: { easy: 2.8, moderate: 3.5, hard: 5.0 },
    intensityHint: {
      easy: 'Tidying, light cleaning.',
      moderate: 'Vacuuming, mopping, weeding.',
      hard: 'Scrubbing, digging, carrying loads.',
    },
    hasLocation: false,
    countsSteps: false,
    note: 'This counts. Movement is movement.',
  },
  {
    key: 'stairs',
    label: 'Stair climbing',
    emoji: '🪜',
    met: { easy: 4.0, moderate: 6.0, hard: 8.8 },
    intensityHint: {
      easy: 'Slow, holding the rail.',
      moderate: 'Steady pace.',
      hard: 'Fast, or carrying weight.',
    },
    hasLocation: false,
    countsSteps: false,
  },
  {
    // A catch-all for anything not already listed: basketball, pickleball,
    // martial arts, a sport league, gardening past what Housework covers.
    // MET values here sit in the range general recreational sport occupies
    // (Compendium of Physical Activities, code 15xxx sport category), not
    // tuned to one specific activity, since this key covers all of them. The
    // note field is where the person says what it actually was.
    key: 'other',
    label: 'Other/Sport',
    emoji: '🏀',
    met: { easy: 4.0, moderate: 6.0, hard: 8.0 },
    intensityHint: {
      easy: 'Casual, plenty of breaks.',
      moderate: 'Steady effort, playing a full game or session.',
      hard: 'Competitive, all out.',
    },
    hasLocation: false,
    countsSteps: false,
    note: 'Say what it was in the note below, like "basketball" or "pickleball league."',
  },
]

export const INTENSITIES: readonly Intensity[] = ['easy', 'moderate', 'hard']

export const INTENSITY_LABEL: Record<Intensity, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
}

/** Outdoor walking involves wind, uneven ground and small gradients that a flat
 *  treadmill does not. The difference is small but it is real, so it is applied
 *  rather than pretended away. */
const OUTDOOR_MET_MULTIPLIER = 1.05

const LBS_PER_KG = 2.20462

export function findActivity(key: string): ActivityType | undefined {
  return ACTIVITY_TYPES.find(a => a.key === key)
}

export interface ActivityEstimate {
  calories: number
  steps: number | null
  /** Every intermediate value, so the screen can show its working. */
  working: {
    met: number
    baseMet: number
    outdoorAdjusted: boolean
    weightLbs: number
    weightKg: number
    minutes: number
    caloriesPerMinute: number
    cadence: number | null
  }
}

/**
 * Calories from the standard MET equation:
 *
 *   kcal/min = MET x 3.5 x weight(kg) / 200
 *
 * The 3.5 is resting oxygen use in millilitres per kilo per minute. Dividing by
 * 200 converts millilitres of oxygen into kilocalories, since burning one litre
 * of oxygen releases roughly 5 kcal.
 *
 * This is a gross figure. It includes the calories the body would have burned
 * resting during the same period, which is how fitness trackers and most apps
 * report it too.
 */
export function estimateActivity(params: {
  activityKey: string
  minutes: number
  intensity: Intensity
  location?: Location
  weightLbs: number
}): ActivityEstimate | null {
  const activity = findActivity(params.activityKey)
  if (!activity) return null
  if (!Number.isFinite(params.minutes) || params.minutes <= 0) return null
  if (!Number.isFinite(params.weightLbs) || params.weightLbs <= 0) return null

  const baseMet = activity.met[params.intensity]
  const outdoorAdjusted =
    activity.hasLocation && params.location === 'outdoor' && activity.countsSteps
  const met = outdoorAdjusted ? baseMet * OUTDOOR_MET_MULTIPLIER : baseMet

  const weightKg = params.weightLbs / LBS_PER_KG
  const caloriesPerMinute = (met * 3.5 * weightKg) / 200
  const calories = Math.round(caloriesPerMinute * params.minutes)

  const cadence = activity.countsSteps ? WALK_CADENCE[params.intensity] : null
  const steps = cadence === null ? null : Math.round(cadence * params.minutes)

  return {
    calories,
    steps,
    working: {
      met: Math.round(met * 100) / 100,
      baseMet,
      outdoorAdjusted,
      weightLbs: params.weightLbs,
      weightKg: Math.round(weightKg * 10) / 10,
      minutes: params.minutes,
      caloriesPerMinute: Math.round(caloriesPerMinute * 100) / 100,
      cadence,
    },
  }
}

// ---------------------------------------------------------------------------
// What counts as a day you moved
// ---------------------------------------------------------------------------

/**
 * There is no minimum. Every logged session counts as a day you moved.
 *
 * Dr. Hunter, 2026-08-13, correcting an earlier build that gated this at 15
 * minutes:
 *
 *   "15 minutes was the walk goal. if i do 20 squats after a meal thats movement
 *    or if i spend 3 minutes on the treadmill thats movement. its just that they
 *    are not weighted equally"
 *
 * So twenty squats after dinner counts. Three minutes on the treadmill counts.
 * The difference between those and a half hour walk is carried by the points
 * below, not by a pass or fail gate. Gating it would have told somebody doing
 * exactly the right thing after a meal that it was worth nothing.
 */

/** The walk goal, which is what the 15 applies to. Walking only. */
export const WALK_GOAL_MINUTES = 15

/**
 * Days a month the movement goal aims at, roughly five a week. Days rather than
 * sessions, so walking and lifting on the same day counts once.
 */
export const MOVEMENT_DAYS_GOAL_PER_MONTH = 20

/**
 * Movement points: how the sessions get weighted against each other.
 *
 * Points are MET minutes, the METs of the activity multiplied by how long it
 * lasted. That is the measure the physical activity guidelines are written in,
 * so the weekly target below is not invented.
 *
 *   30 min brisk walk   5.0 METs x 30 = 150 points
 *   20 squats, say 2 min 5.0 METs x  2 =  10 points
 *   3 min easy treadmill 2.8 METs x  3 =   8 points
 *
 * Everything counts. Harder and longer simply counts for more.
 */
export function movementPoints(params: {
  activityKey: string
  minutes: number
  intensity: Intensity
}): number {
  const activity = findActivity(params.activityKey)
  if (!activity || !Number.isFinite(params.minutes) || params.minutes <= 0) return 0
  return Math.round(activity.met[params.intensity] * params.minutes)
}

/**
 * Weekly points target.
 *
 * 500 MET minutes a week is the level the Physical Activity Guidelines for
 * Americans, 2nd edition, describe as the minimum for substantial health
 * benefit. It is the same thing as 150 minutes of moderate activity, just
 * counted in a way that lets a short hard effort and a long easy one both
 * contribute honestly.
 */
export const WEEKLY_POINTS_TARGET = 500

/** Shown under every estimate. Kept here so it cannot drift between screens. */
export const ESTIMATE_DISCLAIMER =
  'These are population averages, not measurements. Your real burn depends on your fitness, your body composition and the day. Use the trend, not the individual number. Educational only, not medical advice.'

// ---------------------------------------------------------------------------
// The sample week
// ---------------------------------------------------------------------------

export interface SampleDay {
  day: string
  focus: string
  detail: string
  emoji: string
  /** Which muscle groups or systems this day is actually working. */
  targets: string
}

/**
 * Why this week is shaped this way:
 *
 * Full body three times rather than a chest day and a leg day. Training each
 * muscle group twice a week or more produces better strength and muscle results
 * than once a week (Schoenfeld, Ogborn & Krieger, Sports Med 2016). Full body
 * also means a missed day does not wipe out a whole muscle group for the week,
 * which matters for people with real lives.
 *
 * Three strength days plus the walking days clears the 150 minutes of moderate
 * activity a week in the Physical Activity Guidelines for Americans, 2nd edition,
 * along with its separate instruction to train muscle twice a week.
 *
 * HIIT appears once. That is deliberate.
 */
export const SAMPLE_WEEK: readonly SampleDay[] = [
  {
    day: 'Monday',
    focus: 'Full body strength',
    emoji: '🏋🏾‍♀️',
    targets: 'Legs, back, chest, shoulders, arms',
    detail: 'Every major muscle group, first pass of the week. Compound moves first while you are fresh.',
  },
  {
    day: 'Tuesday',
    focus: 'Walk 30 min plus rebound 10 min',
    emoji: '🚶🏾‍♀️',
    targets: 'Heart, circulation, lymph',
    detail: 'Easy on the joints and it moves blood through the muscles you worked yesterday. Recovery, not a day off.',
  },
  {
    day: 'Wednesday',
    focus: 'Full body strength',
    emoji: '🏋🏾‍♀️',
    targets: 'Legs, back, chest, shoulders, arms',
    detail: 'Second pass. This is the one that makes the difference, since twice a week beats once.',
  },
  {
    day: 'Thursday',
    focus: 'Walk or rebound',
    emoji: '🤸🏾‍♀️',
    targets: 'Heart, circulation',
    detail: 'Whichever you will actually do. The one you enjoy is the one that keeps happening.',
  },
  {
    day: 'Friday',
    focus: 'Full body strength, or HIIT',
    emoji: '🔥',
    targets: 'Whole body, or cardiovascular',
    detail: 'Third strength pass if you want muscle. Swap in HIIT if you want the cardiovascular push. Pick one, not both.',
  },
  {
    day: 'Saturday',
    focus: 'Longer walk',
    emoji: '🌳',
    targets: 'Heart, mood, weekly minutes',
    detail: 'Forty five minutes or more if the day allows. Outside if you can, for the light as much as the walk.',
  },
  {
    day: 'Sunday',
    focus: 'Rest and mobility',
    emoji: '🧘🏾‍♀️',
    targets: 'Nervous system, joints',
    detail: 'Stretching, gentle yoga, or nothing at all. Rest is part of the plan, not a gap in it.',
  },
]

export const SAMPLE_WEEK_RATIONALE =
  'Muscle groups get worked at least twice a week because that beats once for both strength and muscle. Strength days are full body so that missing one day does not skip an entire muscle group. HIIT sits at once a week on purpose: more than that tends to raise cortisol, which works against belly fat rather than for it.'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

export interface NutritionGoals {
  calories_goal: number
  protein_goal: number
  fat_goal: number
  carbs_goal: number
  fiber_goal: number
}

interface Props {
  userId: string
  initialGoals: NutritionGoals | null
  onGoalsSaved: (goals: NutritionGoals) => void
}

const CM_PER_INCH = 2.54
const INCHES_PER_FOOT = 12
const KG_PER_POUND = 0.45359237

// Mifflin-St Jeor sex constants. The form previously used -78, the midpoint of the
// two, because it never asked. For a client base that is mostly women over 40 that
// overestimated BMR by about 83 kcal before the activity multiplier.
const BMR_CONSTANT_FEMALE = -161
const BMR_CONSTANT_MALE = 5

// Protein floor in grams per kg of body weight, approved by Dr. Hunter 2026-08-12.
// A percentage-of-calories split alone undershoots protein for anyone eating on the
// lower end, so the target is whichever of the two is greater.
const PROTEIN_G_PER_KG = 1.6

const CALORIES_PER_G_PROTEIN = 4
const CALORIES_PER_G_FAT = 9
const CALORIES_PER_G_CARB = 4

// 14g of fiber per 1,000 kcal is the Institute of Medicine adequate intake
// standard, the same figure behind the Dietary Guidelines for Americans fiber
// target. Scaling it to calories rather than a flat number means someone
// eating 1,600 kcal is not held to the same target as someone eating 2,400.
const FIBER_G_PER_1000_KCAL = 14

type UnitSystem = 'imperial' | 'metric'
type Sex = 'female' | 'male'

/** The arithmetic behind the estimate, kept so it can be shown to the person
 *  it describes. A number with no working is the black box we tell people not
 *  to accept from anyone else. */
interface Working {
  heightCm: number
  weightKg: number
  age: number
  sexConstant: number
  bmr: number
  multiplier: number
  activityLabel: string
  tdee: number
  proteinFromSplit: number
  proteinFromBodyWeight: number
  proteinDriver: 'split' | 'bodyweight'
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (desk job, little exercise)', multiplier: 1.2 },
  { value: 'lightly', label: 'Lightly active (1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately active (3-5 days/week)', multiplier: 1.55 },
  { value: 'very', label: 'Very active (6-7 days/week)', multiplier: 1.725 },
  { value: 'extra', label: 'Extra active (athlete or physical job)', multiplier: 1.9 },
]

export function NutritionGoalsTab({ userId, initialGoals, onGoalsSaved }: Props) {
  // Imperial is the default because the client base is US based. The estimate
  // itself is always computed in metric, so only the inputs change.
  const [units, setUnits] = useState<UnitSystem>('imperial')
  // Defaults to female because that is who this platform serves.
  const [sex, setSex] = useState<Sex>('female')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('moderate')
  const [tdeeResult, setTdeeResult] = useState<number | null>(null)
  const [working, setWorking] = useState<Working | null>(null)
  const [showWorking, setShowWorking] = useState(false)

  const [caloriesGoal, setCaloriesGoal] = useState(String(initialGoals?.calories_goal ?? 2000))
  const [proteinGoal, setProteinGoal] = useState(String(initialGoals?.protein_goal ?? 150))
  const [fatGoal, setFatGoal] = useState(String(initialGoals?.fat_goal ?? 65))
  const [carbsGoal, setCarbsGoal] = useState(String(initialGoals?.carbs_goal ?? 200))
  const [fiberGoal, setFiberGoal] = useState(String(initialGoals?.fiber_goal ?? 28))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialGoals) {
      setCaloriesGoal(String(initialGoals.calories_goal))
      setProteinGoal(String(initialGoals.protein_goal))
      setFatGoal(String(initialGoals.fat_goal))
      setCarbsGoal(String(initialGoals.carbs_goal))
      setFiberGoal(String(initialGoals.fiber_goal))
    }
  }, [initialGoals])

  // Mifflin-St Jeor needs centimetres and kilograms, so imperial input is
  // converted here rather than anywhere downstream.
  const heightInCm = (): number => {
    if (units === 'metric') return parseFloat(height)
    const ft = parseFloat(heightFt) || 0
    const inches = parseFloat(heightIn) || 0
    const totalInches = ft * INCHES_PER_FOOT + inches
    return totalInches > 0 ? totalInches * CM_PER_INCH : NaN
  }

  const weightInKg = (): number => {
    const w = parseFloat(weight)
    if (!w) return NaN
    return units === 'metric' ? w : w * KG_PER_POUND
  }

  const calculateTDEE = () => {
    const h = heightInCm()
    const w = weightInKg()
    const a = parseFloat(age)
    if (!h || !w || !a) {
      const heightUnit = units === 'metric' ? 'centimeters' : 'feet and inches'
      const weightUnit = units === 'metric' ? 'kilograms' : 'pounds'
      toast.error(`Please enter your height in ${heightUnit}, weight in ${weightUnit}, and age`)
      return
    }
    // Mifflin-St Jeor, using the constant for the selected sex.
    const sexConstant = sex === 'female' ? BMR_CONSTANT_FEMALE : BMR_CONSTANT_MALE
    const bmr = 10 * w + 6.25 * h - 5 * a + sexConstant
    const multiplier = ACTIVITY_LEVELS.find(l => l.value === activity)?.multiplier ?? 1.55
    const tdee = Math.round(bmr * multiplier)
    setTdeeResult(tdee)

    // Protein is the greater of a 30% split and the per-kg floor, so it never drops
    // too low when calories are modest. Fat holds at 30%, carbs take what is left.
    const proteinFromSplit = (tdee * 0.30) / CALORIES_PER_G_PROTEIN
    const proteinFromBodyWeight = w * PROTEIN_G_PER_KG
    const protein = Math.round(Math.max(proteinFromSplit, proteinFromBodyWeight))
    const fat = Math.round((tdee * 0.30) / CALORIES_PER_G_FAT)

    // Captured so the working can be shown with this person's real numbers,
    // rather than a generic formula they have to trust.
    setWorking({
      heightCm: Math.round(h * 10) / 10,
      weightKg: Math.round(w * 10) / 10,
      age: a,
      sexConstant,
      bmr: Math.round(bmr),
      multiplier,
      activityLabel: ACTIVITY_LEVELS.find(l => l.value === activity)?.label ?? '',
      tdee,
      proteinFromSplit: Math.round(proteinFromSplit),
      proteinFromBodyWeight: Math.round(proteinFromBodyWeight),
      proteinDriver: proteinFromBodyWeight > proteinFromSplit ? 'bodyweight' : 'split',
    })
    const remainingCalories = tdee - protein * CALORIES_PER_G_PROTEIN - fat * CALORIES_PER_G_FAT
    const carbs = Math.max(0, Math.round(remainingCalories / CALORIES_PER_G_CARB))
    const fiber = Math.round((tdee / 1000) * FIBER_G_PER_1000_KCAL)

    setCaloriesGoal(String(tdee))
    setProteinGoal(String(protein))
    setFatGoal(String(fat))
    setCarbsGoal(String(carbs))
    setFiberGoal(String(fiber))
  }

  // Ties the protein number back to the Day 2 rule people already know: get most of
  // it in early, spread across meals, rather than one large dinner.
  const proteinPerMeal = Math.max(1, Math.round((parseInt(proteinGoal) || 0) / 3))

  const handleSave = async () => {
    const goals: NutritionGoals = {
      calories_goal: parseInt(caloriesGoal) || 2000,
      protein_goal: parseInt(proteinGoal) || 150,
      fat_goal: parseInt(fatGoal) || 65,
      carbs_goal: parseInt(carbsGoal) || 200,
      fiber_goal: parseInt(fiberGoal) || 28,
    }
    setSaving(true)
    const { error } = await supabase.from('nutrition_goals').upsert(
      { user_id: userId, ...goals, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    if (error) {
      toast.error('Could not save goals')
    } else {
      toast.success('Nutrition goals saved!')
      onGoalsSaved(goals)
    }
  }

  return (
    <div className={styles.goalsTab}>
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Calorie Estimator</h3>
        <p className={styles.goalsHint}>
          This is here so you know roughly where you sit, not so you count every day. Enter your stats for an educational estimate. Not medical advice, and not a personalized nutrition plan. For targets built around your own health picture, work with a registered dietitian.
        </p>
        <div className={styles.unitToggle}>
          <button
            type="button"
            className={units === 'imperial' ? styles.unitBtnActive : styles.unitBtn}
            onClick={() => { setUnits('imperial'); setTdeeResult(null); setWorking(null) }}
          >
            ft / lb
          </button>
          <button
            type="button"
            className={units === 'metric' ? styles.unitBtnActive : styles.unitBtn}
            onClick={() => { setUnits('metric'); setTdeeResult(null); setWorking(null) }}
          >
            cm / kg
          </button>
        </div>
        <div className={styles.goalsTdeeRow}>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>
              {units === 'metric' ? 'Height (cm)' : 'Height (ft / in)'}
            </label>
            {units === 'metric' ? (
              <input
                className={styles.input}
                type="number"
                placeholder="170"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            ) : (
              <div className={styles.heightImperial}>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="5 ft"
                  aria-label="Height in feet"
                  value={heightFt}
                  onChange={e => setHeightFt(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="number"
                  placeholder="5 in"
                  aria-label="Height in inches"
                  value={heightIn}
                  onChange={e => setHeightIn(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>
              {units === 'metric' ? 'Weight (kg)' : 'Weight (lb)'}
            </label>
            <input
              className={styles.input}
              type="number"
              placeholder={units === 'metric' ? '70' : '155'}
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Age</label>
            <input
              className={styles.input}
              type="number"
              placeholder="35"
              value={age}
              onChange={e => setAge(e.target.value)}
            />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Sex</label>
            <select
              className={styles.mealTypeSelect}
              value={sex}
              onChange={e => { setSex(e.target.value as Sex); setTdeeResult(null); setWorking(null) }}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>
        <div className={styles.goalsField}>
          <label className={styles.goalsLabel}>Activity Level</label>
          <select
            className={styles.mealTypeSelect}
            value={activity}
            onChange={e => setActivity(e.target.value)}
          >
            {ACTIVITY_LEVELS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={shared.btnGhost} onClick={calculateTDEE}>
            Estimate My Calories
          </button>
        </div>
        {tdeeResult && (
          <div className={styles.tdeeResult}>
            Estimated daily need: <strong>{tdeeResult} kcal</strong>. The targets below have been filled in for you. Change any of them if you already know your own numbers.
          </div>
        )}

        {working && (
          <div className={styles.workingBlock}>
            <button
              type="button"
              className={styles.workingToggle}
              onClick={() => setShowWorking(v => !v)}
              aria-expanded={showWorking}
            >
              {showWorking ? 'Hide the math' : 'Show me the math'}
            </button>

            {showWorking && (
              <div className={styles.workingBody}>
                <p className={styles.workingIntro}>
                  This uses the Mifflin-St Jeor equation, the one most widely used for
                  estimating energy needs. Here it is with your numbers, so you can
                  check it yourself.
                </p>

                <p className={styles.workingStep}><strong>Step 1. Your resting rate</strong></p>
                <p className={styles.workingMath}>
                  (10 &times; {working.weightKg} kg) + (6.25 &times; {working.heightCm} cm)
                  &minus; (5 &times; {working.age}) {working.sexConstant < 0 ? '−' : '+'} {Math.abs(working.sexConstant)}
                  {' = '}<strong>{working.bmr} calories</strong>
                </p>
                <p className={styles.workingNote}>
                  What your body uses at complete rest. The last number is the constant
                  for {sex === 'female' ? 'women' : 'men'}, which is why the estimator asks.
                </p>

                <p className={styles.workingStep}><strong>Step 2. Your activity</strong></p>
                <p className={styles.workingMath}>
                  {working.bmr} &times; {working.multiplier} = <strong>{working.tdee} calories</strong>
                </p>
                <p className={styles.workingNote}>{working.activityLabel}</p>

                <p className={styles.workingStep}><strong>Step 3. The targets</strong></p>
                <p className={styles.workingNote}>
                  Protein is whichever is higher: 30% of your calories, which is{' '}
                  {working.proteinFromSplit}g, or {PROTEIN_G_PER_KG}g per kg of body
                  weight, which is {working.proteinFromBodyWeight}g. For you the{' '}
                  {working.proteinDriver === 'bodyweight' ? 'body weight figure' : '30% figure'}{' '}
                  is higher, so that is the one used. Fat is 30% of calories. Carbohydrate
                  is what remains. Fiber is {FIBER_G_PER_1000_KCAL}g per 1,000 calories, the
                  Institute of Medicine's adequate intake standard.
                </p>

                <p className={styles.workingCaveat}>
                  Every equation of this kind is an estimate built from population
                  averages. Two people with identical numbers can differ by a few hundred
                  calories a day. Treat it as a starting point, watch what actually
                  happens over a few weeks, and work with a registered dietitian for
                  targets built around your own health picture.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Daily Targets</h3>
        <div className={styles.goalsTdeeRow}>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Calories</label>
            <input className={styles.input} type="number" value={caloriesGoal} onChange={e => setCaloriesGoal(e.target.value)} />
            <p className={styles.goalsFieldHint}>Roughly where you sit on a normal day.</p>
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Protein (g)</label>
            <input className={styles.input} type="number" value={proteinGoal} onChange={e => setProteinGoal(e.target.value)} />
            <p className={styles.goalsFieldHint}>
              About {proteinPerMeal}g at each of three meals. If you are on a GLP-1
              medication, aim for the higher end of your range and prioritize
              resistance training. A meaningful share of weight lost on these
              medications can be lean tissue without it.
            </p>
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Fat (g)</label>
            <input className={styles.input} type="number" value={fatGoal} onChange={e => setFatGoal(e.target.value)} />
            <p className={styles.goalsFieldHint}>Olive oil, avocado, nuts, seeds.</p>
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Carbs (g)</label>
            <input className={styles.input} type="number" value={carbsGoal} onChange={e => setCarbsGoal(e.target.value)} />
            <p className={styles.goalsFieldHint}>What is left after protein and fat.</p>
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Fiber (g)</label>
            <input className={styles.input} type="number" value={fiberGoal} onChange={e => setFiberGoal(e.target.value)} />
            <p className={styles.goalsFieldHint}>
              Net carbs (carbs your body actually absorbs): {' '}
              <strong>{Math.max(0, (parseInt(carbsGoal) || 0) - (parseInt(fiberGoal) || 0))}g</strong>.
              Fiber passes through mostly undigested, so it is subtracted out.
            </p>
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={shared.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
        <p className={styles.goalsDisclaimer}>
          Nutritional values are estimates for educational purposes only. Consult a registered dietitian for personalized guidance.
        </p>
      </div>
    </div>
  )
}

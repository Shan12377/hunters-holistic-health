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
}

interface Props {
  userId: string
  initialGoals: NutritionGoals | null
  onGoalsSaved: (goals: NutritionGoals) => void
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (desk job, little exercise)', multiplier: 1.2 },
  { value: 'lightly', label: 'Lightly active (1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately active (3-5 days/week)', multiplier: 1.55 },
  { value: 'very', label: 'Very active (6-7 days/week)', multiplier: 1.725 },
  { value: 'extra', label: 'Extra active (athlete or physical job)', multiplier: 1.9 },
]

export function NutritionGoalsTab({ userId, initialGoals, onGoalsSaved }: Props) {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('moderate')
  const [tdeeResult, setTdeeResult] = useState<number | null>(null)

  const [caloriesGoal, setCaloriesGoal] = useState(String(initialGoals?.calories_goal ?? 2000))
  const [proteinGoal, setProteinGoal] = useState(String(initialGoals?.protein_goal ?? 150))
  const [fatGoal, setFatGoal] = useState(String(initialGoals?.fat_goal ?? 65))
  const [carbsGoal, setCarbsGoal] = useState(String(initialGoals?.carbs_goal ?? 200))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialGoals) {
      setCaloriesGoal(String(initialGoals.calories_goal))
      setProteinGoal(String(initialGoals.protein_goal))
      setFatGoal(String(initialGoals.fat_goal))
      setCarbsGoal(String(initialGoals.carbs_goal))
    }
  }, [initialGoals])

  const calculateTDEE = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const a = parseFloat(age)
    if (!h || !w || !a) {
      toast.error('Please enter height (cm), weight (kg), and age')
      return
    }
    // Mifflin-St Jeor averaged across sexes: an educational estimate
    const bmr = 10 * w + 6.25 * h - 5 * a - 78
    const multiplier = ACTIVITY_LEVELS.find(l => l.value === activity)?.multiplier ?? 1.55
    const tdee = Math.round(bmr * multiplier)
    setTdeeResult(tdee)
    // Pre-fill goals with 30/30/40 protein/fat/carbs split
    setCaloriesGoal(String(tdee))
    setProteinGoal(String(Math.round((tdee * 0.30) / 4)))
    setFatGoal(String(Math.round((tdee * 0.30) / 9)))
    setCarbsGoal(String(Math.round((tdee * 0.40) / 4)))
  }

  const handleSave = async () => {
    const goals: NutritionGoals = {
      calories_goal: parseInt(caloriesGoal) || 2000,
      protein_goal: parseInt(proteinGoal) || 150,
      fat_goal: parseInt(fatGoal) || 65,
      carbs_goal: parseInt(carbsGoal) || 200,
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
          Enter your stats for an educational estimate of your daily calorie need. This is not medical advice. Adjust your actual targets below.
        </p>
        <div className={styles.goalsTdeeRow}>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Height (cm)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="170"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Weight (kg)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="70"
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
            Estimated daily need: <strong>{tdeeResult} kcal</strong>. Goals below have been pre-filled with a standard 30/30/40 protein/fat/carbs split. Adjust to match your actual targets.
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Daily Targets</h3>
        <div className={styles.goalsTdeeRow}>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Calories</label>
            <input className={styles.input} type="number" value={caloriesGoal} onChange={e => setCaloriesGoal(e.target.value)} />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Protein (g)</label>
            <input className={styles.input} type="number" value={proteinGoal} onChange={e => setProteinGoal(e.target.value)} />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Fat (g)</label>
            <input className={styles.input} type="number" value={fatGoal} onChange={e => setFatGoal(e.target.value)} />
          </div>
          <div className={styles.goalsField}>
            <label className={styles.goalsLabel}>Carbs (g)</label>
            <input className={styles.input} type="number" value={carbsGoal} onChange={e => setCarbsGoal(e.target.value)} />
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

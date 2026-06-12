export interface SupplementBreakdown {
  id: string
  name: string
  timing: string
  takenDays: number
  pct: number
}

export interface SupplementAdherenceResult {
  overall: number    // 0–100
  streak: number     // consecutive days with at least one supplement taken
  breakdown: SupplementBreakdown[]
}

// Uses local date construction to avoid UTC-offset edge cases.
function localDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function calcSupplementAdherence(
  supplements: { id: string; name: string; timing: string }[],
  logs: { supplement_id: string; log_date: string }[],
  days = 14
): SupplementAdherenceResult {
  if (supplements.length === 0) return { overall: 0, streak: 0, breakdown: [] }

  const today = new Date()
  const dateStrings: string[] = []
  for (let i = 0; i < days; i++) {
    // Construct local date for each day in the window.
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    dateStrings.push(localDateStr(d.getFullYear(), d.getMonth(), d.getDate()))
  }
  // dateStrings[0] = today, dateStrings[days-1] = oldest

  const takenSet = new Set(logs.map(l => `${l.supplement_id}::${l.log_date}`))
  const loggedDates = new Set(logs.map(l => l.log_date))

  const breakdown: SupplementBreakdown[] = supplements.map(s => {
    const takenDays = dateStrings.filter(date => takenSet.has(`${s.id}::${date}`)).length
    return {
      id: s.id,
      name: s.name,
      timing: s.timing,
      takenDays,
      pct: Math.round((takenDays / days) * 100),
    }
  })

  const totalTaken = breakdown.reduce((a, b) => a + b.takenDays, 0)
  const overall = Math.round((totalTaken / (supplements.length * days)) * 100)

  let streak = 0
  for (const date of dateStrings) {
    if (loggedDates.has(date)) streak++
    else break
  }

  return { overall, streak, breakdown }
}

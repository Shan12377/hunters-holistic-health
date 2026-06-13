export interface FlagResult {
  phrase: string
  suggestion: string
}

export interface CheckResult {
  passed: boolean
  flags: FlagResult[]
  fdaReminder: string
}

export const FDA_REMINDER =
  'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.'

interface CheckPattern {
  regex: RegExp
  suggestion: string
}

// Shared claim-verb alternation used in disease-specific compound patterns.
const VERB_CLUSTER =
  '(?:treat(?:s|ed|ing|ment)?|cure[sd]?|curing|prevent(?:s|ed|ing|ion)?|reverse[sd]?|reversing|heal[sd]?|healing|fix(?:es|ed|ing)?|eliminat(?:es?|ed|ing))'

// Patterns are ordered most-specific first. The deduplication algorithm
// drops any match whose character span overlaps an already-accepted one.
const PATTERNS: CheckPattern[] = [
  // --- Specific multi-word measurement phrases ---
  {
    regex: /\blowers?\s+blood\s+pressure\b/gi,
    suggestion: 'supports healthy blood pressure levels',
  },
  {
    regex: /\blowers?\s+(?:blood\s+)?(?:sugar|glucose)\b/gi,
    suggestion: 'supports healthy glucose metabolism',
  },
  {
    regex: /\blowers?\s+cholesterol\b/gi,
    suggestion: 'supports healthy cholesterol levels',
  },
  {
    regex: /\breduces?\s+(?:high\s+)?blood\s+pressure\b/gi,
    suggestion: 'supports healthy blood pressure levels',
  },
  {
    regex: /\breduces?\s+(?:blood\s+)?(?:sugar|glucose)\b/gi,
    suggestion: 'supports healthy glucose metabolism',
  },
  {
    regex: /\breduces?\s+inflammation\b/gi,
    suggestion: 'supports a healthy inflammatory response',
  },
  {
    regex: /\b(?:fights?|combats?|battles?)\s+(?:cancer|inflammation|disease|infection|illness)\b/gi,
    suggestion: "supports the body's natural defense processes",
  },

  // --- Disease name + claim verb combinations ---
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+(?:type\\s+[12]\\s+)?diabetes\\b`, 'gi'),
    suggestion: 'supports healthy glucose metabolism',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+hypertension\\b`, 'gi'),
    suggestion: 'supports healthy blood pressure',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+anemia\\b`, 'gi'),
    suggestion: 'supports healthy iron levels and red blood cell production',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+arthritis\\b`, 'gi'),
    suggestion: 'supports healthy joint function and mobility',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+depression\\b`, 'gi'),
    suggestion: 'supports mood balance and emotional wellness',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+cancer\\b`, 'gi'),
    suggestion: 'supports cellular health',
  },
  {
    regex: new RegExp(`\\b${VERB_CLUSTER}\\s+thyroid(?:\\s+disease)?\\b`, 'gi'),
    suggestion: 'supports healthy thyroid function',
  },

  // --- Standalone claim verbs (catch remaining uses not covered above) ---
  {
    regex: /\btreat(?:s|ed|ing|ment)?\b/gi,
    suggestion: 'supports, promotes, or may help maintain',
  },
  {
    regex: /\bcure[sd]?\b|\bcuring\b/gi,
    suggestion: 'supports healthy function',
  },
  {
    regex: /\bprevent(?:s|ed|ing|ion)?\b/gi,
    suggestion: 'supports a healthy [system]',
  },
  {
    regex: /\breverse[sd]?\b|\breversing\b/gi,
    suggestion: 'supports improvement in [area]',
  },
  {
    regex: /\bheal[sd]?\b|\bhealing\b/gi,
    suggestion: "supports the body's natural processes",
  },
  {
    regex: /\bfix(?:es|ed|ing)?\b/gi,
    suggestion: 'supports or promotes balance in',
  },
  {
    regex: /\beliminat(?:es?|ed|ing)\b/gi,
    suggestion: 'helps reduce',
  },
]

interface RawMatch {
  start: number
  end: number
  phrase: string
  suggestion: string
}

export function checkText(text: string): CheckResult {
  if (!text.trim()) {
    return { passed: true, flags: [], fdaReminder: FDA_REMINDER }
  }

  const rawMatches: RawMatch[] = []

  for (const { regex, suggestion } of PATTERNS) {
    regex.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      rawMatches.push({
        start: m.index,
        end: m.index + m[0].length,
        phrase: m[0],
        suggestion,
      })
    }
  }

  // Sort: earliest position first, then longer match first (more specific wins ties).
  rawMatches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return (b.end - b.start) - (a.end - a.start)
  })

  // Accept non-overlapping matches (greedy: longer/earlier wins).
  const accepted: RawMatch[] = []
  for (const m of rawMatches) {
    if (!accepted.some(a => m.start < a.end && m.end > a.start)) {
      accepted.push(m)
    }
  }

  // Deduplicate: each unique (lowercased phrase + suggestion) pair shown once.
  const seen = new Set<string>()
  const flags: FlagResult[] = []
  for (const m of accepted) {
    const key = `${m.phrase.toLowerCase()}||${m.suggestion}`
    if (!seen.has(key)) {
      seen.add(key)
      flags.push({ phrase: m.phrase, suggestion: m.suggestion })
    }
  }

  return {
    passed: flags.length === 0,
    flags,
    fdaReminder: FDA_REMINDER,
  }
}

// Soft guardrail for general messaging (Lane 1).
// Detects likely clinical topics so the UI can nudge the sender toward the
// clinical inquiry channel. It never blocks sending and never stores flags;
// it only drives an on-screen suggestion.

const CLINICAL_PATTERNS: RegExp[] = [
  /\bsymptom(s)?\b/i,
  /\bmedicat(ion|ions|ed)\b/i,
  /\bprescri(be|bed|ption)\b/i,
  /\bdiagnos(is|ed|e)\b/i,
  /\bdosage|dose\b/i,
  /\blab(s| result| results| work)\b/i,
  /\bblood (test|work|results)\b/i,
  /\bside effect(s)?\b/i,
  /\bchest (pain|tightness)\b/i,
  /\bshort(ness)? of breath\b/i,
  /\bdizz(y|iness)\b/i,
  /\brash\b/i,
  /\bnausea|vomit/i,
  /\bpain\b/i,
  /\binfection\b/i,
  /\bpregnan(t|cy)\b/i,
]

export function looksClinical(text: string): boolean {
  if (!text || text.length < 4) return false
  return CLINICAL_PATTERNS.some(p => p.test(text))
}

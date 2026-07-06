import { Link } from 'react-router-dom'
import { Lock, ChevronRight } from 'lucide-react'
import { useUserLevel } from '@/hooks/useUserLevel'
import { usePlan } from '@/hooks/usePlan'
import styles from './Client.module.css'

// ── Gate 1 content (Level 2) ──────────────────────────────────────────────────
const GATE1_ITEMS = [
  { emoji: '🍽', title: 'Trending Meals Collections', desc: 'Curated meals matched to your metabolic goals.', href: '/app/trending-meals' },
  { emoji: '🥗', title: 'Smart Recipe Builder', desc: 'Build plates with anti-inflammatory food pairings.', href: '/app/recipe-builder' },
  { emoji: '📖', title: 'Recipe Vault', desc: '47+ evidence-informed recipes with nutrient notes.', href: '/app/recipes' },
]

// ── Gate 2 content (Level 4) ──────────────────────────────────────────────────
const GATE2_MODULES = [
  { month: 1,  title: 'The Meal Sequencing Masterclass',         hook: 'Same plate. New order. Cut the spike.' },
  { month: 2,  title: 'Protect Your Muscle',                     hook: 'The scale can lie. Your muscle loss is silent.' },
  { month: 3,  title: 'The Protein Target',                      hook: 'Most people eat protein like a garnish.' },
  { month: 4,  title: 'Food Noise, Decoded',                     hook: 'It was never a willpower problem.' },
  { month: 5,  title: 'Sleep Is a Metabolic Organ',              hook: 'One week of short sleep can look prediabetic.' },
  { month: 6,  title: 'The Stress-Sugar Connection',             hook: 'Your blood sugar can spike from a phone call.' },
  { month: 7,  title: 'Know Your Numbers I: Fasting Glucose',    hook: 'A single reading is a photo. You need the movie.' },
  { month: 8,  title: 'Know Your Numbers II: Waist-to-Height',   hook: 'The most dangerous fat is the fat you can\'t pinch.' },
  { month: 9,  title: 'Movement That Counts',                    hook: 'The best exercise is the one within an hour of eating.' },
  { month: 10, title: 'The Fiber Ramp',                          hook: 'The gut-glucose tool that isn\'t sold in a bottle.' },
  { month: 11, title: 'The Plateau Playbook',                    hook: 'The plateau is your body succeeding at the wrong goal.' },
  { month: 12, title: 'The Exit Ramp Primer',                    hook: 'Every program ends. What you built this year doesn\'t.' },
]

// ── Gate 3 content (Level 5) ──────────────────────────────────────────────────
const GATE3_SESSIONS = [
  { n: 1,  title: 'Same Plate, New Order',           tag: 'Sequencing Results Workshop' },
  { n: 2,  title: 'Strength for People Who Hate Gyms', tag: 'Live Circuit' },
  { n: 3,  title: 'Build-a-Plate Live',              tag: 'Protein-First Rebuild' },
  { n: 4,  title: 'The Noise Floor',                 tag: 'Open Floor Night' },
  { n: 5,  title: 'The Sleep Audit',                 tag: 'Live Log Review' },
  { n: 6,  title: 'The Ten-Minute Downshift',        tag: 'Breathwork + Calendar' },
  { n: 7,  title: 'Bring Your Trend',                tag: 'Pattern Workshop' },
  { n: 8,  title: 'The Tape Measure Truth',          tag: 'Measurement Demo' },
  { n: 9,  title: 'Step Architecture',               tag: 'Day-Rebuild Workshop' },
  { n: 10, title: 'The Gut-Glucose Q&A',             tag: 'Fiber Upgrade Round' },
  { n: 11, title: 'Plateau Troubleshooting Live',    tag: 'Five-Drift Audit' },
  { n: 12, title: 'The Year You Built',              tag: 'Scorecard Ceremony' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProgressBar({ pct, color = 'var(--teal)' }: { pct: number; color?: string }) {
  return (
    <div className={styles.vaultProgressBar}>
      <div className={styles.vaultProgressFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function LockBadge({ level }: { level: number }) {
  return <span className={styles.vaultLockBadge}><Lock size={11} /> Level {level}</span>
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const lvl = useUserLevel()
  const { isAtLeast } = usePlan()
  const isPaid = isAtLeast('foundation')

  const gate1Open = isPaid && lvl.level >= 2
  const gate2Open = isPaid && lvl.level >= 4
  const gate3Open = isPaid && lvl.level >= 5

  if (lvl.loading) return null

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>The Vault</h1>
        <p className={styles.snapshotSub}>Participation unlocks depth. Your level and points carry over if you upgrade.</p>
      </div>

      {/* User level card */}
      <div className={styles.vaultLevelCard}>
        <div className={styles.vaultLevelLeft}>
          <div className={styles.vaultLevelNum}>Level {lvl.level}</div>
          <div className={styles.vaultLevelLabel}>{lvl.label}</div>
        </div>
        <div className={styles.vaultLevelRight}>
          <div className={styles.vaultLevelPoints}>{lvl.points} pts</div>
          {lvl.nextLevelMin && (
            <>
              <ProgressBar pct={lvl.progressPct} />
              <div className={styles.vaultLevelNext}>{lvl.nextLevelMin - lvl.points} pts to Level {lvl.level + 1}</div>
            </>
          )}
        </div>
      </div>

      {/* Free-member Level 2 conversion callout */}
      {!isPaid && lvl.level >= 2 && (
        <div className={styles.vaultEarnedCard}>
          <div className={styles.vaultEarnedEmoji}>🔑</div>
          <div className={styles.vaultEarnedBody}>
            <strong>You earned Level 2.</strong> The Quick Wins Vault is your key. Join Foundation and your level and all your points carry over the moment you do.
          </div>
          <a href="/#pricing" className={styles.snapshotUpgradeCta}>Start Foundation — $37/mo</a>
        </div>
      )}

      {/* ── GATE 1: Level 2 ── */}
      <div className={styles.vaultGateSection}>
        <div className={styles.vaultGateHeader}>
          <div className={styles.vaultGateBadge} style={{ background: gate1Open ? 'var(--teal)' : undefined }}>
            {gate1Open ? '✓' : '🔒'} Level 2
          </div>
          <div>
            <div className={styles.vaultGateTitle}>Quick Wins Vault</div>
            <div className={styles.vaultGateSub}>Recipes, meal collections, and plate-building tools</div>
          </div>
        </div>

        {gate1Open ? (
          <div className={styles.vaultItemGrid}>
            {GATE1_ITEMS.map(item => (
              <Link key={item.title} to={item.href} className={styles.vaultItemCard}>
                <span className={styles.vaultItemEmoji}>{item.emoji}</span>
                <div>
                  <div className={styles.vaultItemTitle}>{item.title}</div>
                  <div className={styles.vaultItemDesc}>{item.desc}</div>
                </div>
                <ChevronRight size={16} className={styles.vaultItemArrow} />
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.vaultLockedGrid}>
            {GATE1_ITEMS.map(item => (
              <div key={item.title} className={styles.vaultLockedCard}>
                <LockBadge level={2} />
                <div className={styles.vaultLockedTitle}>{item.emoji} {item.title}</div>
                <div className={styles.vaultLockedDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}

        {!gate1Open && (
          <div className={styles.vaultGateNudge}>
            {!isPaid
              ? `${lvl.level < 2 ? `${5 - lvl.points} more pts to Level 2, then join Foundation to claim this.` : 'You earned Level 2. Join Foundation to open this vault.'}`
              : `${5 - lvl.points > 0 ? `${5 - lvl.points} more pts to unlock. Post a win, log your day, or like a post.` : 'Level 2 unlocked!'}`
            }
          </div>
        )}
      </div>

      {/* ── GATE 2: Level 4 ── */}
      <div className={styles.vaultGateSection}>
        <div className={styles.vaultGateHeader}>
          <div className={styles.vaultGateBadge} style={{ background: gate2Open ? 'var(--gold)' : undefined }}>
            {gate2Open ? '✓' : '🔒'} Level 4
          </div>
          <div>
            <div className={styles.vaultGateTitle}>Advanced Modules</div>
            <div className={styles.vaultGateSub}>12-month deep-dive series. One mechanism, one experiment, one community share per month.</div>
          </div>
        </div>

        <div className={styles.vaultModuleGrid}>
          {GATE2_MODULES.map(mod => (
            <div key={mod.month} className={gate2Open ? styles.vaultModuleCard : styles.vaultModuleCardLocked}>
              <div className={styles.vaultModuleMonth}>Month {mod.month}</div>
              {!gate2Open && <LockBadge level={4} />}
              <div className={styles.vaultModuleTitle}>{mod.title}</div>
              <div className={styles.vaultModuleHook}>{mod.hook}</div>
              {gate2Open && (
                <div className={styles.vaultModuleComingSoon}>Pending clinical review — releasing soon</div>
              )}
            </div>
          ))}
        </div>

        {!gate2Open && (
          <div className={styles.vaultGateNudge}>
            {!isPaid ? 'Join Foundation + reach Level 4 to unlock this series.' : `Level 4 requires 100 pts. You have ${lvl.points}.`}
          </div>
        )}
      </div>

      {/* ── GATE 3: Level 5 ── */}
      <div className={styles.vaultGateSection}>
        <div className={styles.vaultGateHeader}>
          <div className={styles.vaultGateBadge} style={{ background: gate3Open ? '#b44be0' : undefined }}>
            {gate3Open ? '✓' : '🔒'} Level 5
          </div>
          <div>
            <div className={styles.vaultGateTitle}>Replay Vault + Ask Dr. Hunter</div>
            <div className={styles.vaultGateSub}>Every live session replay, searchable. Plus priority posting in the monthly Ask thread.</div>
          </div>
        </div>

        <div className={styles.vaultSessionGrid}>
          {GATE3_SESSIONS.map(s => (
            <div key={s.n} className={gate3Open ? styles.vaultSessionCard : styles.vaultSessionCardLocked}>
              {!gate3Open && <LockBadge level={5} />}
              <div className={styles.vaultSessionNum}>Session {s.n}</div>
              <div className={styles.vaultSessionTitle}>{s.title}</div>
              <div className={styles.vaultSessionTag}>{s.tag}</div>
              {gate3Open && <div className={styles.vaultModuleComingSoon}>Recording added after each live session</div>}
            </div>
          ))}
        </div>

        {!gate3Open && (
          <div className={styles.vaultGateNudge}>
            {!isPaid ? 'Join Foundation + reach Level 5 to unlock the Replay Vault.' : `Level 5 requires 250 pts. You have ${lvl.points}.`}
          </div>
        )}
      </div>

      <p className={styles.footerNote}>
        Levels are earned through daily logs, community posts, and likes received. Points never reset when you upgrade.
      </p>
    </div>
  )
}

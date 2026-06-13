import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { checkText, type CheckResult } from '@/lib/ftcGuard'
import styles from './Coach.module.css'
import shared from '../../styles/shared.module.css'

const PLACEHOLDER =
  'Paste your marketing copy, protocol language, social media post, or educational content here...'

export default function ComplianceGuardPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  function handleCheck() {
    setResult(checkText(text))
    setCopiedIdx(null)
  }

  function handleClear() {
    setText('')
    setResult(null)
    setCopiedIdx(null)
  }

  async function copyRewrite(suggestion: string, idx: number) {
    try {
      await navigator.clipboard.writeText(suggestion)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch {
      // Clipboard API unavailable: silently ignore
    }
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <div className={styles.pageKicker}>Educator Tools</div>
        <h1 className={styles.pageTitle}>
          <ShieldCheck size={22} color="var(--teal)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />
          Compliance Language Guard
        </h1>
        <p className={styles.pageSubtitle}>
          Scan your copy for potential FTC and FDA language concerns before publishing. Flags disease-claim verbs and suggests structure/function rewrites.
        </p>
      </div>

      {/* Input card */}
      <div className={styles.card}>
        <label className={styles.cgTextareaLabel}>
          Text to review
        </label>
        <textarea
          className={styles.cgTextarea}
          value={text}
          onChange={e => { setText(e.target.value); setResult(null) }}
          placeholder={PLACEHOLDER}
          spellCheck
        />
        <div className={styles.cgActions}>
          <button
            className={shared.btnTeal}
            onClick={handleCheck}
            disabled={!text.trim()}
          >
            <ShieldCheck size={15} /> Check Text
          </button>
          {text && (
            <button className={shared.btnSecondary} onClick={handleClear}>
              Clear
            </button>
          )}
          <span className={styles.cgCharCount}>
            {text.length} character{text.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={styles.cgResults}>
          {result.passed ? (
            <div className={styles.cgPassBanner}>
              <div className={styles.cgPassIcon}>✓</div>
              <div>
                <div className={styles.cgPassText}>No flags found.</div>
                <div className={styles.cgPassSub}>
                  Your copy does not contain any of the tracked disease-claim patterns. Review the FDA reminder below before publishing.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.cgFlagCount}>
                {result.flags.length} potential issue{result.flags.length !== 1 ? 's' : ''} found
              </div>
              <div className={styles.cgFlagList}>
                {result.flags.map((flag, idx) => (
                  <div key={idx} className={styles.cgFlagCard}>
                    <div className={styles.cgFlagBody}>
                      <div className={styles.cgFlagLabel}>Flagged phrase</div>
                      <div className={styles.cgFlagPhrase}>"{flag.phrase}"</div>
                      <div className={styles.cgFlagSuggestionLabel}>Suggested rewrite</div>
                      <div className={styles.cgFlagSuggestion}>{flag.suggestion}</div>
                    </div>
                    <button
                      className={`${styles.cgCopyBtn}${copiedIdx === idx ? ` ${styles.cgCopyBtnCopied}` : ''}`}
                      onClick={() => copyRewrite(flag.suggestion, idx)}
                      title="Copy suggested rewrite to clipboard"
                    >
                      {copiedIdx === idx ? 'Copied!' : 'Copy rewrite'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.cgFdaNote}>
            <strong>FDA Reminder:</strong> {result.fdaReminder}
          </div>
        </div>
      )}

      {!result && (
        <div className={styles.cgEmptyHint}>
          Paste marketing copy, protocol language, or educational content above to check for potential FTC/FDA language concerns. This tool flags disease-claim verbs (treats, cures, prevents, reverses, heals, fixes, eliminates) and disease names paired with action verbs.
        </div>
      )}

      <p className={styles.cgFooter}>
        This tool is a drafting aid, not legal advice. Final compliance responsibility rests with the practice. Consult a healthcare attorney for guidance on regulated health claims.
      </p>
    </div>
  )
}

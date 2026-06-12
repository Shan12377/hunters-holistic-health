import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import shared from '../../styles/shared.module.css'

interface LateSlipModalProps {
  onSubmit: (reason: string) => Promise<void>
  onClose: () => void
}

export default function LateSlipModal({ onSubmit, onClose }: LateSlipModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'private' | 'feed'>('private')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    setLoading(true)
    await onSubmit(reason.trim())
    setLoading(false)
  }

  return (
    <div className={shared.modalOverlay}>
      <div className={shared.modalCard}>
        {/* Header */}
        <div className={shared.modalHeader}>
          <div className={shared.modalIcon}>
            <AlertCircle size={20} color="var(--gold)" />
          </div>
          <div>
            <div className={shared.modalTitle}>Late Slip Required</div>
            <div className={shared.modalSub}>{format(new Date(), 'h:mm a')}: some goals are still incomplete</div>
          </div>
        </div>

        <p className={shared.modalText}>
          It looks like some of today's goals weren't completed. That's okay, life happens. Take a moment to reflect: what got in the way today?
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            className={shared.modalTextarea}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="I had a busy day at work and forgot to log my meals..."
            rows={4}
            required
            autoFocus
          />

          {/* Privacy toggle */}
          <div className={shared.modalToggleRow}>
            <button type="button" onClick={() => setMode('private')}
              className={mode === 'private' ? shared.modalToggleGold : shared.modalToggleBtn}>
              🔒 Keep Private
            </button>
            <button type="button" onClick={() => setMode('feed')}
              className={mode === 'feed' ? shared.modalToggleTeal : shared.modalToggleBtn}>
              👥 Share with Group
            </button>
          </div>

          <div className={shared.modalActions}>
            <button type="submit" className={`${shared.btnPrimary} ${shared.modalActionMain}`} disabled={loading || !reason.trim()}>
              {loading ? 'Submitting...' : 'Submit Late Slip'}
            </button>
            <button type="button" onClick={onClose} className={shared.btnSecondary}>
              Skip
            </button>
          </div>
        </form>

        <p className={shared.modalFootnote}>
          Accountability is about awareness, not punishment. Every reflection is a step forward. 🌱
        </p>
      </div>
    </div>
  )
}

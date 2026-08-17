import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader, AlertTriangle } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import styles from '@/pages/client/Client.module.css'
import shared from '@/styles/shared.module.css'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

// Uses @zxing/browser (canvas-based frame decoding over getUserMedia) rather
// than the native BarcodeDetector API, which Safari and iOS do not implement.
// This is the one that actually works on an iPhone PWA, which is most of this
// app's install base.
export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    async function start() {
      try {
        if (!videoRef.current) return
        const controls = await reader.decodeFromVideoDevice(
          undefined, // let the browser pick, prefers the back camera on mobile
          videoRef.current,
          (result, _err, ctrl) => {
            if (result && !cancelled) {
              ctrl.stop()
              onDetected(result.getText())
            }
          }
        )
        if (cancelled) { controls.stop(); return }
        controlsRef.current = controls
        setStarting(false)
      } catch (err) {
        if (cancelled) return
        console.error('[barcode] camera start failed:', err)
        setError('Could not access the camera. You can still type the barcode number below.')
        setStarting(false)
      }
    }

    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onDetected])

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (code) onDetected(code)
  }

  return createPortal(
    <div className={shared.modalOverlay} role="dialog" aria-modal="true" aria-label="Scan a barcode">
      <div className={shared.modalCard}>
        <div className={shared.modalHeader}>
          <h3>Scan a Barcode</h3>
          <button className={styles.heartBtn} onClick={onClose} aria-label="Close scanner">
            <X size={18} />
          </button>
        </div>

        {starting && (
          <div className={styles.nutritionLookupRow}>
            <Loader size={13} className={styles.spinIcon} /> Starting camera...
          </div>
        )}

        {error && (
          <div className={styles.nutritionNotFoundRow}>
            <AlertTriangle size={13} color="var(--gold)" /> {error}
          </div>
        )}

        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: 8, background: '#000', display: error ? 'none' : 'block' }}
          muted
          playsInline
        />

        <p className={styles.transientNote}>
          Hold the barcode steady in view. Nothing from the camera is stored, only the
          decoded barcode number is used, to look up the product's nutrition facts.
        </p>

        <form onSubmit={submitManual} className={styles.mealInputRow} style={{ marginTop: 10 }}>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="Or type the barcode number"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
          />
          <button type="submit" className={shared.btnGhost} disabled={!manualCode.trim()}>
            Look Up
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}

import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallBanner() {
  const { promptInstall, showAndroidPrompt, showIOSInstructions } = usePWAInstall()
  const [iosDismissed, setIosDismissed] = useState(false)

  if (showAndroidPrompt) {
    return (
      <div className="pwa-banner">
        <div className="pwa-banner__content">
          <img src="/pwa-192.png" alt="" className="pwa-banner__icon" />
          <div>
            <p className="pwa-banner__title">Add to Home Screen</p>
            <p className="pwa-banner__subtitle">Access your health tools instantly, no app store needed.</p>
          </div>
        </div>
        <button onClick={promptInstall} className="pwa-banner__btn">
          Install
        </button>
      </div>
    )
  }

  if (showIOSInstructions && !iosDismissed) {
    return (
      <div className="pwa-banner">
        <div className="pwa-banner__content">
          <img src="/pwa-192.png" alt="" className="pwa-banner__icon" />
          <div>
            <p className="pwa-banner__title">Add to Home Screen</p>
            <p className="pwa-banner__subtitle">
              Tap the Share button then "Add to Home Screen" to install.
            </p>
          </div>
        </div>
        <button onClick={() => setIosDismissed(true)} className="pwa-banner__close">
          ✕
        </button>
      </div>
    )
  }

  return null
}

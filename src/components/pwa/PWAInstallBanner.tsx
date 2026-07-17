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
      <div className="pwa-banner pwa-banner--ios">
        <div className="pwa-banner__ios-header">
          <div className="pwa-banner__content">
            <img src="/pwa-192.png" alt="" className="pwa-banner__icon" />
            <p className="pwa-banner__title">Open as a Web App?</p>
          </div>
          <button onClick={() => setIosDismissed(true)} className="pwa-banner__close">✕</button>
        </div>
        <p className="pwa-banner__subtitle">Add to your iPhone home screen in 3 steps:</p>
        <ol className="pwa-banner__steps">
          <li className="pwa-banner__step">
            Tap the <span className="pwa-banner__share-badge">↑ Share</span> button at the bottom of Safari
          </li>
          <li className="pwa-banner__step">
            Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>
          </li>
          <li className="pwa-banner__step">
            Tap <strong>&ldquo;Add&rdquo;</strong> in the top right corner
          </li>
        </ol>
      </div>
    )
  }

  return null
}

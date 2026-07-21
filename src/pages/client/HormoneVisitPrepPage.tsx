import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import shared from '@/styles/shared.module.css'
import styles from './Client.module.css'

export default function HormoneVisitPrepPage() {
  const { profile } = useAuthStore()
  const isFree = !profile || profile.plan === 'free'

  if (isFree) {
    return (
      <div className={shared.pageContainer}>
        <div className={shared.pageHeader}>
          <h1 className={shared.pageTitle}>Hormone Health Visit Prep</h1>
          <p className={shared.pageSubtitle}>
            Walk into your next appointment with a clear picture of your hormones, symptoms, and the exact labs to request.
          </p>
        </div>

        <div className={styles.upgradeGate}>
          <div className={styles.upgradeGateIcon}>🔒</div>
          <h2 className={styles.upgradeGateTitle}>Available on Foundation and above</h2>
          <p className={styles.upgradeGateDesc}>
            This tool helps you explore 17 hormone conditions, check your symptoms and lab values, and generate a printable one-page brief to bring to your provider. It is included in every paid plan.
          </p>
          <div className={styles.upgradeGateBtns}>
            <Link to="/#pricing" className={shared.btnPrimary}>See Plans</Link>
            <Link to="/app/dashboard" className={shared.btnGhost}>Back to Dashboard</Link>
          </div>
          <p className={styles.upgradeGateNote}>
            Already subscribed? Contact support at info@huntersholistichealth.com if your plan is not showing correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src="/tools/hhh-hormone-visit-prep.html"
      title="Hormone Health Visit Prep"
      style={{ display: 'block', width: '100%', height: 'calc(100vh - 64px)', border: 'none' }}
    />
  )
}

// Real 404 page. Replaces the old silent redirect to the homepage so people
// who mistype a link understand what happened and search engines see a 404 state.

import { Link } from 'react-router-dom'
import shared from '@/styles/shared.module.css'

export default function NotFoundPage() {
  return (
    <div className={shared.loadingPage}>
      <div className={shared.loadingInner}>
        <p className={shared.loadingText}>That page does not exist or has moved.</p>
        <Link to="/" className={shared.btnPrimary}>
          Back to Hunter's Holistic Health
        </Link>
      </div>
    </div>
  )
}

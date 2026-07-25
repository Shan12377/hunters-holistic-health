import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import styles from '@/styles/shared.module.css'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
      <ChevronLeft size={15} />
      Back
    </button>
  )
}

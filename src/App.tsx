import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ClientDashboard from '@/pages/client/ClientDashboard'
import BPTrackerPage from '@/pages/client/BPTrackerPage'
import MealGuardPage from '@/pages/client/MealGuardPage'
import DailyLogPage from '@/pages/client/DailyLogPage'
import ProtocolPage from '@/pages/client/ProtocolPage'
import SupplementLogPage from '@/pages/client/SupplementLogPage'
import WeeklyGradePage from '@/pages/client/WeeklyGradePage'
import FeedPage from '@/pages/client/FeedPage'
import SettingsPage from '@/pages/client/SettingsPage'
import CoachDashboard from '@/pages/coach/CoachDashboard'
import ClientDetailPage from '@/pages/coach/ClientDetailPage'
import AppLayout from '@/components/layout/AppLayout'
import TermsPage from '@/pages/legal/TermsPage'
import PrivacyPage from '@/pages/legal/PrivacyPage'
import JoinPage from '@/pages/intake/JoinPage'
import SupportPage from '@/pages/intake/SupportPage'
import FeatureRequestPage from '@/pages/intake/FeatureRequestPage'
import ClinicalInquiryPage from '@/pages/intake/ClinicalInquiryPage'
import shared from '@/styles/shared.module.css'

function LoadingScreen() {
  return (
    <div className={shared.loadingPage}>
      <div className={shared.loadingInner}>
        <div className={shared.loadingSpinnerLg} />
        <p className={shared.loadingText}>Loading Hunter's Holistic Health...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setSession, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background:'#1f282e', color:'#f7f7f7', border:'1px solid #272f35' }, success: { iconTheme: { primary:'#c8a74b', secondary:'#0c1318' } }, error: { iconTheme: { primary:'#e05c5c', secondary:'#0c1318' } } }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/early-access" element={<JoinPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/feature-request" element={<FeatureRequestPage />} />
        <Route path="/clinical-inquiry" element={<ClinicalInquiryPage />} />

        {/* Client app routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="blood-pressure" element={<BPTrackerPage />} />
          <Route path="meal-guard" element={<MealGuardPage />} />
          <Route path="daily-log" element={<DailyLogPage />} />
          <Route path="protocol" element={<ProtocolPage />} />
          <Route path="supplements" element={<SupplementLogPage />} />
          <Route path="weekly-grade" element={<WeeklyGradePage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Educator routes */}
        <Route path="/coach" element={<ProtectedRoute role="educator"><AppLayout /></ProtectedRoute>}>
          <Route index element={<CoachDashboard />} />
          <Route path="client/:clientId" element={<ClientDetailPage />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

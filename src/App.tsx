import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import ClientDashboard from '@/pages/client/ClientDashboard'
import BPTrackerPage from '@/pages/client/BPTrackerPage'
import BloodSugarPage from '@/pages/client/BloodSugarPage'
import MealGuardPage from '@/pages/client/MealGuardPage'
import DailyLogPage from '@/pages/client/DailyLogPage'
import ProtocolPage from '@/pages/client/ProtocolPage'
import SupplementLogPage from '@/pages/client/SupplementLogPage'
import WeeklyGradePage from '@/pages/client/WeeklyGradePage'
import FeedPage from '@/pages/client/FeedPage'
import CohortPage from '@/pages/client/CohortPage'
import SessionsPage from '@/pages/client/SessionsPage'
import RecipesPage from '@/pages/client/RecipesPage'
import SettingsPage from '@/pages/client/SettingsPage'
import CoachDashboard from '@/pages/coach/CoachDashboard'
import ClientDetailPage from '@/pages/coach/ClientDetailPage'
import ComplianceGuardPage from '@/pages/coach/ComplianceGuardPage'
import CrmPipelinePage from '@/pages/coach/CrmPipelinePage'
import CrmTasksPage from '@/pages/coach/CrmTasksPage'
import CrmCalendarPage from '@/pages/coach/CrmCalendarPage'
import CommunicationsStudioPage from '@/pages/coach/CommunicationsStudioPage'
import AppLayout from '@/components/layout/AppLayout'
import TermsPage from '@/pages/legal/TermsPage'
import PrivacyPage from '@/pages/legal/PrivacyPage'
import JoinPage from '@/pages/intake/JoinPage'
import SupportPage from '@/pages/intake/SupportPage'
import FeatureRequestPage from '@/pages/intake/FeatureRequestPage'
import ClinicalInquiryPage from '@/pages/intake/ClinicalInquiryPage'
import ContactPage from '@/pages/intake/ContactPage'
import MessagesPage from '@/pages/client/MessagesPage'
import LeaderboardPage from '@/pages/client/LeaderboardPage'
import EventsPage from '@/pages/client/EventsPage'
import ManageEventsPage from '@/pages/coach/ManageEventsPage'
import ChallengesPage from '@/pages/client/ChallengesPage'
import ClassroomPage from '@/pages/client/ClassroomPage'
import ExercisePage from '@/pages/client/ExercisePage'
import WorkoutTrackerPage from '@/pages/client/WorkoutTrackerPage'
import FeedbackPage from '@/pages/client/FeedbackPage'
import CoursePage from '@/pages/client/CoursePage'
import ManageChallengesPage from '@/pages/coach/ManageChallengesPage'
import ManageClassroomPage from '@/pages/coach/ManageClassroomPage'
import EducatorMessagesPage from '@/pages/coach/EducatorMessagesPage'
import PrivacyScorecardPage from '@/pages/PrivacyScorecardPage'
import ShopPage from '@/pages/ShopPage'
import CreatinePage from '@/pages/CreatinePage'
import CreatineNotWhatYouThink from '@/pages/blog/CreatineNotWhatYouThink'
import ReboundingBenefits from '@/pages/blog/ReboundingBenefits'
import Glp1MuscleLoss from '@/pages/blog/Glp1MuscleLoss'
import Glp1WeightRegain from '@/pages/blog/Glp1WeightRegain'
import Glp1Supplements from '@/pages/blog/Glp1Supplements'
import Glp1FunctionalLabs from '@/pages/blog/Glp1FunctionalLabs'
import Glp1Cost from '@/pages/blog/Glp1Cost'
import Glp1SideEffects from '@/pages/blog/Glp1SideEffects'
import MetabolicHealth from '@/pages/blog/MetabolicHealth'
import Glp1FoodCulture from '@/pages/blog/Glp1FoodCulture'
import Glp1Comparison from '@/pages/blog/Glp1Comparison'
import WhyMealAppsFailAdvertorial from '@/pages/blog/WhyMealAppsFailAdvertorial'
import BlogIndexPage from '@/pages/blog/BlogIndexPage'
import ParasiteCleanseProtocol from '@/pages/protocol/ParasiteCleanseProtocol'
import SupplementCatalog from '@/pages/protocol/SupplementCatalog'
import MetalDetoxProtocol from '@/pages/protocol/MetalDetoxProtocol'
import ProtocolPlanPage from '@/pages/client/ProtocolPlanPage'
import ProtocolMatrixPage from '@/pages/client/ProtocolMatrixPage'
import MetabolicToolsPage from '@/pages/client/MetabolicToolsPage'
import ToolsPage from '@/pages/ToolsPage'
import DailyPlatePage from '@/pages/client/DailyPlatePage'
import BuildYourPlatePage from '@/pages/client/BuildYourPlatePage'
import TrendingMealsPage from '@/pages/client/TrendingMealsPage'
import FoodSearchPage from '@/pages/client/FoodSearchPage'
import SmartRecipeBuilderPage from '@/pages/client/SmartRecipeBuilderPage'
import BPSimulatorPage from '@/pages/BPSimulatorPage'
import MedicationNutrientChecker from '@/pages/tools/MedicationNutrientChecker'
import RootCauseQuiz from '@/pages/tools/RootCauseQuiz'
import WhyCantILoseWeight from '@/pages/WhyCantILoseWeight'
import Glp1Assessment from '@/pages/tools/Glp1Assessment'
import Glp1CandidateLanding from '@/pages/Glp1CandidateLanding'
import SupplementTiming from '@/pages/tools/SupplementTiming'
import NutrientFoodSources from '@/pages/tools/NutrientFoodSources'
import InsResScore from '@/pages/tools/InsResScore'
import HealthHubPage from '@/pages/client/HealthHubPage'
import MyProtocolPage from '@/pages/client/MyProtocolPage'
import HealthGoalsPage from '@/pages/client/HealthGoalsPage'
import HabitTrackerPage from '@/pages/client/HabitTrackerPage'
import ApplyPage from '@/pages/ApplyPage'
import ApplicationsPage from '@/pages/coach/ApplicationsPage'
import WeightTrackerPage from '@/pages/client/WeightTrackerPage'
import SnapshotPage from '@/pages/client/SnapshotPage'
import VaultPage from '@/pages/client/VaultPage'
import HormoneChallengePage from '@/pages/tools/HormoneChallengePage'
import FlatBellyChallengePage from '@/pages/tools/FlatBellyChallengePage'
import NervousSystemResetPage from '@/pages/tools/NervousSystemResetPage'
import MorningProtocolPage from '@/pages/client/MorningProtocolPage'
import KpiDashboardPage from '@/pages/coach/KpiDashboardPage'
import BrainDumpPage from '@/pages/coach/BrainDumpPage'
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
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    if (needRefresh) {
      toast.custom(
        (t) => (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'#182a28', border:'1px solid #1f3331', borderRadius:'10px', padding:'0.75rem 1rem', color:'#f7f7f7', fontSize:'0.875rem' }}>
            <span>🔄 Update available</span>
            <button
              onClick={() => { updateServiceWorker(true); toast.dismiss(t.id) }}
              style={{ background:'#0B9E8E', color:'#fff', border:'none', borderRadius:'6px', padding:'0.3rem 0.75rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}
            >
              Reload
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ background:'transparent', border:'none', color:'#8aada8', cursor:'pointer', fontSize:'0.9rem' }}
            >
              ✕
            </button>
          </div>
        ),
        { duration: 8000 }
      )
    }
  }, [needRefresh])

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
      <Toaster position="top-right" toastOptions={{ style: { background:'#182a28', color:'#f7f7f7', border:'1px solid #1f3331' }, success: { iconTheme: { primary:'#c8a74b', secondary:'#0e1c1b' } }, error: { iconTheme: { primary:'#e05c5c', secondary:'#0e1c1b' } } }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/early-access" element={<JoinPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/feature-request" element={<FeatureRequestPage />} />
        <Route path="/clinical-inquiry" element={<ClinicalInquiryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/privacy-scorecard" element={<PrivacyScorecardPage />} />
        <Route path="/shop" element={<Navigate to="/creatine" replace />} />
        <Route path="/creatine" element={<CreatinePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/creatine-not-what-you-think" element={<CreatineNotWhatYouThink />} />
        <Route path="/blog/rebounding-benefits" element={<ReboundingBenefits />} />
        <Route path="/blog/glp1-muscle-loss-what-nobody-tells-you" element={<Glp1MuscleLoss />} />
        <Route path="/blog/68-percent-glp1-weight-regain-how-to-beat-it" element={<Glp1WeightRegain />} />
        <Route path="/blog/glp1-supplements-what-actually-works" element={<Glp1Supplements />} />
        <Route path="/blog/functional-labs-glp1-what-to-test" element={<Glp1FunctionalLabs />} />
        <Route path="/blog/glp1-cost-how-to-pay-less" element={<Glp1Cost />} />
        <Route path="/blog/glp1-side-effects-pharmacist-guide" element={<Glp1SideEffects />} />
        <Route path="/blog/metabolic-health-beyond-weight-loss" element={<MetabolicHealth />} />
        <Route path="/blog/glp1-and-food-culture-navigating-your-heritage" element={<Glp1FoodCulture />} />
        <Route path="/blog/glp1-comparison-ozempic-wegovy-mounjaro-zepbound" element={<Glp1Comparison />} />
        <Route path="/blog/why-meal-planning-apps-fail" element={<WhyMealAppsFailAdvertorial />} />
        <Route path="/protocol/parasite-cleanse" element={<ParasiteCleanseProtocol />} />
        <Route path="/supplements" element={<SupplementCatalog />} />
        <Route path="/protocol/metal-detox" element={<MetalDetoxProtocol />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/bp-simulator" element={<BPSimulatorPage />} />
        <Route path="/tools/medication-nutrient-checker" element={<MedicationNutrientChecker />} />
        <Route path="/tools/root-cause-quiz" element={<RootCauseQuiz />} />
        <Route path="/why-cant-i-lose-weight" element={<WhyCantILoseWeight />} />
        <Route path="/tools/glp1-assessment" element={<Glp1Assessment />} />
        <Route path="/glp1-candidate-assessment" element={<Glp1CandidateLanding />} />
        <Route path="/tools/supplement-timing" element={<SupplementTiming />} />
        <Route path="/tools/nutrient-food-sources" element={<NutrientFoodSources />} />
        <Route path="/tools/insulin-resistance-score" element={<InsResScore />} />
        <Route path="/tools/hormone-challenge" element={<HormoneChallengePage />} />
        <Route path="/tools/flat-belly-reset" element={<FlatBellyChallengePage />} />
        <Route path="/tools/nervous-system-reset" element={<NervousSystemResetPage />} />

        {/* Client app routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="blood-pressure" element={<BPTrackerPage />} />
          <Route path="blood-sugar" element={<BloodSugarPage />} />
          <Route path="meal-guard" element={<MealGuardPage />} />
          <Route path="daily-log" element={<DailyLogPage />} />
          <Route path="protocol" element={<ProtocolPage />} />
          <Route path="supplements" element={<SupplementLogPage />} />
          <Route path="weekly-grade" element={<WeeklyGradePage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="cohort" element={<CohortPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="meal-plan" element={<ProtocolPlanPage />} />
          <Route path="build-your-plate" element={<BuildYourPlatePage />} />
          <Route path="trending-meals" element={<TrendingMealsPage />} />
          <Route path="food-search" element={<FoodSearchPage />} />
          <Route path="recipe-builder" element={<SmartRecipeBuilderPage />} />
          <Route path="protocol-matrix" element={<ProtocolMatrixPage />} />
          <Route path="daily-plate" element={<DailyPlatePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="exercise" element={<ExercisePage />} />
          <Route path="workout-tracker" element={<WorkoutTrackerPage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="classroom/:courseId" element={<CoursePage />} />
          <Route path="metabolic-tools" element={<MetabolicToolsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="my-protocol" element={<MyProtocolPage />} />
          <Route path="health-hub" element={<HealthHubPage />} />
          <Route path="weight" element={<WeightTrackerPage />} />
          <Route path="snapshot" element={<SnapshotPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="health-goals" element={<HealthGoalsPage />} />
          <Route path="habits" element={<HabitTrackerPage />} />
          <Route path="morning" element={<MorningProtocolPage />} />
        </Route>

        {/* Educator routes */}
        <Route path="/coach" element={<ProtectedRoute role="educator"><AppLayout /></ProtectedRoute>}>
          <Route index element={<CoachDashboard />} />
          <Route path="client/:clientId" element={<ClientDetailPage />} />
          <Route path="compliance-guard" element={<ComplianceGuardPage />} />
          <Route path="messages" element={<EducatorMessagesPage />} />
          <Route path="events" element={<ManageEventsPage />} />
          <Route path="challenges" element={<ManageChallengesPage />} />
          <Route path="classroom" element={<ManageClassroomPage />} />
          <Route path="crm" element={<CrmPipelinePage />} />
          <Route path="crm/tasks" element={<CrmTasksPage />} />
          <Route path="crm/calendar" element={<CrmCalendarPage />} />
          <Route path="comms" element={<CommunicationsStudioPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="kpis" element={<KpiDashboardPage />} />
          <Route path="brain-dump" element={<BrainDumpPage />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallBanner />
    </BrowserRouter>
  )
}

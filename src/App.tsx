import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const ClientDashboard = lazy(() => import('@/pages/client/ClientDashboard'))
const BPTrackerPage = lazy(() => import('@/pages/client/BPTrackerPage'))
const BloodSugarPage = lazy(() => import('@/pages/client/BloodSugarPage'))
const MealGuardPage = lazy(() => import('@/pages/client/MealGuardPage'))
const DailyLogPage = lazy(() => import('@/pages/client/DailyLogPage'))
const ProtocolPage = lazy(() => import('@/pages/client/ProtocolPage'))
const SupplementLogPage = lazy(() => import('@/pages/client/SupplementLogPage'))
const WeeklyGradePage = lazy(() => import('@/pages/client/WeeklyGradePage'))
const FeedPage = lazy(() => import('@/pages/client/FeedPage'))
const CohortPage = lazy(() => import('@/pages/client/CohortPage'))
const SessionsPage = lazy(() => import('@/pages/client/SessionsPage'))
const RecipesPage = lazy(() => import('@/pages/client/RecipesPage'))
const SettingsPage = lazy(() => import('@/pages/client/SettingsPage'))
const CoachDashboard = lazy(() => import('@/pages/coach/CoachDashboard'))
const ClientDetailPage = lazy(() => import('@/pages/coach/ClientDetailPage'))
const ComplianceGuardPage = lazy(() => import('@/pages/coach/ComplianceGuardPage'))
const CrmPipelinePage = lazy(() => import('@/pages/coach/CrmPipelinePage'))
const CrmTasksPage = lazy(() => import('@/pages/coach/CrmTasksPage'))
const CrmCalendarPage = lazy(() => import('@/pages/coach/CrmCalendarPage'))
const CommunicationsStudioPage = lazy(() => import('@/pages/coach/CommunicationsStudioPage'))
import AppLayout from '@/components/layout/AppLayout'
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'))
const JoinPage = lazy(() => import('@/pages/intake/JoinPage'))
const SupportPage = lazy(() => import('@/pages/intake/SupportPage'))
const FeatureRequestPage = lazy(() => import('@/pages/intake/FeatureRequestPage'))
const ClinicalInquiryPage = lazy(() => import('@/pages/intake/ClinicalInquiryPage'))
const ContactPage = lazy(() => import('@/pages/intake/ContactPage'))
const MessagesPage = lazy(() => import('@/pages/client/MessagesPage'))
const LeaderboardPage = lazy(() => import('@/pages/client/LeaderboardPage'))
const EventsPage = lazy(() => import('@/pages/client/EventsPage'))
const ManageEventsPage = lazy(() => import('@/pages/coach/ManageEventsPage'))
const ChallengesPage = lazy(() => import('@/pages/client/ChallengesPage'))
const ClassroomPage = lazy(() => import('@/pages/client/ClassroomPage'))
const ExercisePage = lazy(() => import('@/pages/client/ExercisePage'))
const WorkoutTrackerPage = lazy(() => import('@/pages/client/WorkoutTrackerPage'))
const FeedbackPage = lazy(() => import('@/pages/client/FeedbackPage'))
const CoursePage = lazy(() => import('@/pages/client/CoursePage'))
const ManageChallengesPage = lazy(() => import('@/pages/coach/ManageChallengesPage'))
const ManageClassroomPage = lazy(() => import('@/pages/coach/ManageClassroomPage'))
const EducatorMessagesPage = lazy(() => import('@/pages/coach/EducatorMessagesPage'))
const PrivacyScorecardPage = lazy(() => import('@/pages/PrivacyScorecardPage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const CreatinePage = lazy(() => import('@/pages/CreatinePage'))
const CreatineNotWhatYouThink = lazy(() => import('@/pages/blog/CreatineNotWhatYouThink'))
const ReboundingBenefits = lazy(() => import('@/pages/blog/ReboundingBenefits'))
const Glp1MuscleLoss = lazy(() => import('@/pages/blog/Glp1MuscleLoss'))
const Glp1WeightRegain = lazy(() => import('@/pages/blog/Glp1WeightRegain'))
const Glp1Supplements = lazy(() => import('@/pages/blog/Glp1Supplements'))
const Glp1FunctionalLabs = lazy(() => import('@/pages/blog/Glp1FunctionalLabs'))
const Glp1Cost = lazy(() => import('@/pages/blog/Glp1Cost'))
const Glp1SideEffects = lazy(() => import('@/pages/blog/Glp1SideEffects'))
const MetabolicHealth = lazy(() => import('@/pages/blog/MetabolicHealth'))
const Glp1FoodCulture = lazy(() => import('@/pages/blog/Glp1FoodCulture'))
const Glp1Comparison = lazy(() => import('@/pages/blog/Glp1Comparison'))
const WhyMealAppsFailAdvertorial = lazy(() => import('@/pages/blog/WhyMealAppsFailAdvertorial'))
const PcosNowPmos = lazy(() => import('@/pages/blog/PcosNowPmos'))
const BlogIndexPage = lazy(() => import('@/pages/blog/BlogIndexPage'))
const ParasiteCleanseProtocol = lazy(() => import('@/pages/protocol/ParasiteCleanseProtocol'))
const SupplementCatalog = lazy(() => import('@/pages/protocol/SupplementCatalog'))
const MetalDetoxProtocol = lazy(() => import('@/pages/protocol/MetalDetoxProtocol'))
const ProtocolPlanPage = lazy(() => import('@/pages/client/ProtocolPlanPage'))
const ProtocolMatrixPage = lazy(() => import('@/pages/client/ProtocolMatrixPage'))
const MetabolicToolsPage = lazy(() => import('@/pages/client/MetabolicToolsPage'))
const ToolsPage = lazy(() => import('@/pages/ToolsPage'))
const DailyPlatePage = lazy(() => import('@/pages/client/DailyPlatePage'))
const BuildYourPlatePage = lazy(() => import('@/pages/client/BuildYourPlatePage'))
const TrendingMealsPage = lazy(() => import('@/pages/client/TrendingMealsPage'))
const FoodSearchPage = lazy(() => import('@/pages/client/FoodSearchPage'))
const SmartRecipeBuilderPage = lazy(() => import('@/pages/client/SmartRecipeBuilderPage'))
const BPSimulatorPage = lazy(() => import('@/pages/BPSimulatorPage'))
const MedicationNutrientChecker = lazy(() => import('@/pages/tools/MedicationNutrientChecker'))
const RootCauseQuiz = lazy(() => import('@/pages/tools/RootCauseQuiz'))
const WhyCantILoseWeight = lazy(() => import('@/pages/WhyCantILoseWeight'))
const Glp1Assessment = lazy(() => import('@/pages/tools/Glp1Assessment'))
const Glp1CandidateLanding = lazy(() => import('@/pages/Glp1CandidateLanding'))
const SupplementTiming = lazy(() => import('@/pages/tools/SupplementTiming'))
const NutrientFoodSources = lazy(() => import('@/pages/tools/NutrientFoodSources'))
const InsResScore = lazy(() => import('@/pages/tools/InsResScore'))
const HealthHubPage = lazy(() => import('@/pages/client/HealthHubPage'))
const MyProtocolPage = lazy(() => import('@/pages/client/MyProtocolPage'))
const HealthGoalsPage = lazy(() => import('@/pages/client/HealthGoalsPage'))
const HabitTrackerPage = lazy(() => import('@/pages/client/HabitTrackerPage'))
const ApplyPage = lazy(() => import('@/pages/ApplyPage'))
const ApplicationsPage = lazy(() => import('@/pages/coach/ApplicationsPage'))
const WeightTrackerPage = lazy(() => import('@/pages/client/WeightTrackerPage'))
const SnapshotPage = lazy(() => import('@/pages/client/SnapshotPage'))
const VaultPage = lazy(() => import('@/pages/client/VaultPage'))
const HormoneChallengePage = lazy(() => import('@/pages/tools/HormoneChallengePage'))
const FlatBellyChallengePage = lazy(() => import('@/pages/tools/FlatBellyChallengePage'))
const FlatBellyChallengeLanding = lazy(() => import('@/pages/FlatBellyChallengeLanding'))
const NervousSystemResetPage = lazy(() => import('@/pages/tools/NervousSystemResetPage'))
const MensHormoneRhythmPage = lazy(() => import('@/pages/tools/MensHormoneRhythmPage'))
const HormoneVisitPrepPublicPage = lazy(() => import('@/pages/tools/HormoneVisitPrepPublicPage'))
const HormoneVisitPrepPage = lazy(() => import('@/pages/client/HormoneVisitPrepPage'))
const MorningProtocolPage = lazy(() => import('@/pages/client/MorningProtocolPage'))
const KpiDashboardPage = lazy(() => import('@/pages/coach/KpiDashboardPage'))
const BrainDumpPage = lazy(() => import('@/pages/coach/BrainDumpPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      // Rule A (CLAUDE.md): the profile must be loaded before loading flips false,
      // otherwise role-gated routes redirect while profile is still null.
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background:'#182a28', color:'#f7f7f7', border:'1px solid #1f3331' }, success: { iconTheme: { primary:'#c8a74b', secondary:'#0e1c1b' } }, error: { iconTheme: { primary:'#e05c5c', secondary:'#0e1c1b' } } }} />
      <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
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
        <Route path="/blog/pcos-now-pmos" element={<PcosNowPmos />} />
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
        <Route path="/tools/mens-hormone-rhythm" element={<MensHormoneRhythmPage />} />
        <Route path="/tools/hormone-visit-prep" element={<HormoneVisitPrepPublicPage />} />

        {/* Public challenge opt-in (QR code target, no auth) */}
        <Route path="/flat-belly-challenge" element={<FlatBellyChallengeLanding />} />

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
          <Route path="hormone-visit-prep" element={<HormoneVisitPrepPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
      <PWAInstallBanner />
    </BrowserRouter>
  )
}

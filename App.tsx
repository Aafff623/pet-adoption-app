import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import NetworkBanner from './components/NetworkBanner';
import PageLoader from './components/PageLoader';

//  页面懒加载（路由级 Code Splitting）
const Home                  = React.lazy(() => import('./pages/Home'));
const PetDetail             = React.lazy(() => import('./pages/PetDetail'));
const AdoptionForm          = React.lazy(() => import('./pages/AdoptionForm'));
const Profile               = React.lazy(() => import('./pages/Profile'));
const Messages              = React.lazy(() => import('./pages/Messages'));
const Favorites             = React.lazy(() => import('./pages/Favorites'));
const ChatDetail            = React.lazy(() => import('./pages/ChatDetail'));
const MyPets                = React.lazy(() => import('./pages/MyPets'));
const Verification          = React.lazy(() => import('./pages/Verification'));
const Settings              = React.lazy(() => import('./pages/Settings'));
const Feedback              = React.lazy(() => import('./pages/Feedback'));
const Login                 = React.lazy(() => import('./pages/Login'));
const ChangePassword        = React.lazy(() => import('./pages/ChangePassword'));
const BindPhone             = React.lazy(() => import('./pages/BindPhone'));
const SocialAccount         = React.lazy(() => import('./pages/SocialAccount'));
const NotificationSettings  = React.lazy(() => import('./pages/NotificationSettings'));
const PrivacySettings       = React.lazy(() => import('./pages/PrivacySettings'));
const AboutUs               = React.lazy(() => import('./pages/AboutUs'));
const UserAgreement         = React.lazy(() => import('./pages/UserAgreement'));
const PrivacyPolicy         = React.lazy(() => import('./pages/PrivacyPolicy'));
const ThemeSettings         = React.lazy(() => import('./pages/ThemeSettings'));
const RecycleBin            = React.lazy(() => import('./pages/RecycleBin'));
const PublishPet            = React.lazy(() => import('./pages/PublishPet'));
const PublishAdoptRequest   = React.lazy(() => import('./pages/PublishAdoptRequest'));
const AdoptionProgress      = React.lazy(() => import('./pages/AdoptionProgress'));
const LostAlerts            = React.lazy(() => import('./pages/LostAlerts'));
const PublishLostAlert      = React.lazy(() => import('./pages/PublishLostAlert'));
const LostAlertDetail       = React.lazy(() => import('./pages/LostAlertDetail'));
const RescueBoard           = React.lazy(() => import('./pages/RescueBoard'));
const RescueTaskDetail      = React.lazy(() => import('./pages/RescueTaskDetail'));
const PetHealthDiary        = React.lazy(() => import('./pages/PetHealthDiary'));
const Points                = React.lazy(() => import('./pages/Points'));
const PointsTasks           = React.lazy(() => import('./pages/PointsTasks'));
const PointsRank            = React.lazy(() => import('./pages/PointsRank'));
const PointsDonate          = React.lazy(() => import('./pages/PointsDonate'));
const RedeemAdoptionPriority= React.lazy(() => import('./pages/RedeemAdoptionPriority'));
const RedeemHealthReport    = React.lazy(() => import('./pages/RedeemHealthReport'));
const RedeemLuckyDraw       = React.lazy(() => import('./pages/RedeemLuckyDraw'));
const RedeemHospitalCheckup = React.lazy(() => import('./pages/RedeemHospitalCheckup'));
const RedeemCommunityPass   = React.lazy(() => import('./pages/RedeemCommunityPass'));
const RedeemMerchPack       = React.lazy(() => import('./pages/RedeemMerchPack'));
const ChallengeBoard        = React.lazy(() => import('./pages/ChallengeBoard'));
const ChallengeDetail       = React.lazy(() => import('./pages/ChallengeDetail'));
const ChallengeTeam         = React.lazy(() => import('./pages/ChallengeTeam'));
const AchievementBadges     = React.lazy(() => import('./pages/AchievementBadges'));
const HealthAdvisorChat     = React.lazy(() => import('./pages/HealthAdvisorChat'));
const HealthAlerts          = React.lazy(() => import('./pages/HealthAlerts'));
const StoreList             = React.lazy(() => import('./pages/StoreList'));
const StoreDetail           = React.lazy(() => import('./pages/StoreDetail'));
const StoreBooking          = React.lazy(() => import('./pages/StoreBooking'));
const StoreMyBookings       = React.lazy(() => import('./pages/StoreMyBookings'));
const StoreStaffApp         = React.lazy(() => import('./pages/StoreStaffApp'));
const InsuranceCenter       = React.lazy(() => import('./pages/InsuranceCenter'));
const InsuranceProductDetail= React.lazy(() => import('./pages/InsuranceProductDetail'));
const InsuranceClaim        = React.lazy(() => import('./pages/InsuranceClaim'));
const ExpertList            = React.lazy(() => import('./pages/ExpertList'));
const ExpertProfile         = React.lazy(() => import('./pages/ExpertProfile'));
const ExpertColumn          = React.lazy(() => import('./pages/ExpertColumn'));

//  路由鉴权守卫 
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-zinc-900">
        <span className="material-icons-round text-primary text-4xl animate-pulse">pets</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

//  页面过渡动画变体 
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -6 },
};

const pageTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

//  带动画的路由容器 
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={pageTransition}
        style={{ minHeight: '100dvh' }}
      >
        <Routes location={location}>
          <Route path="/login"    element={<Login />} />
          <Route path="/"         element={<Home />} />
          <Route path="/pet/:id"  element={<PetDetail />} />

          <Route path="/adopt"               element={<ProtectedRoute element={<AdoptionForm />} />} />
          <Route path="/profile"             element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/messages"            element={<ProtectedRoute element={<Messages />} />} />
          <Route path="/favorites"           element={<ProtectedRoute element={<Favorites />} />} />
          <Route path="/chat/:id"            element={<ProtectedRoute element={<ChatDetail />} />} />
          <Route path="/my-pets"             element={<ProtectedRoute element={<MyPets />} />} />
          <Route path="/verification"        element={<ProtectedRoute element={<Verification />} />} />
          <Route path="/settings"            element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/feedback"            element={<ProtectedRoute element={<Feedback />} />} />
          <Route path="/change-password"     element={<ProtectedRoute element={<ChangePassword />} />} />
          <Route path="/bind-phone"          element={<ProtectedRoute element={<BindPhone />} />} />
          <Route path="/social-account"      element={<ProtectedRoute element={<SocialAccount />} />} />
          <Route path="/notification-settings" element={<ProtectedRoute element={<NotificationSettings />} />} />
          <Route path="/privacy-settings"    element={<ProtectedRoute element={<PrivacySettings />} />} />
          <Route path="/theme-settings"      element={<ThemeSettings />} />
          <Route path="/about-us"            element={<ProtectedRoute element={<AboutUs />} />} />
          <Route path="/user-agreement"      element={<UserAgreement />} />
          <Route path="/privacy-policy"      element={<PrivacyPolicy />} />
          <Route path="/recycle-bin"         element={<ProtectedRoute element={<RecycleBin />} />} />
          <Route path="/publish-pet"         element={<ProtectedRoute element={<PublishPet />} />} />
          <Route path="/publish-adopt-request" element={<ProtectedRoute element={<PublishAdoptRequest />} />} />
          <Route path="/adoption-progress"   element={<ProtectedRoute element={<AdoptionProgress />} />} />

          <Route path="/lost-alerts"         element={<LostAlerts />} />
          <Route path="/lost-alerts/publish" element={<ProtectedRoute element={<PublishLostAlert />} />} />
          <Route path="/lost-alerts/:id"     element={<LostAlertDetail />} />

          <Route path="/rescue-board"        element={<ProtectedRoute element={<RescueBoard />} />} />
          <Route path="/rescue-board/:id"    element={<ProtectedRoute element={<RescueTaskDetail />} />} />

          <Route path="/pet-health/:petId"   element={<ProtectedRoute element={<PetHealthDiary />} />} />
          <Route path="/health-advisor"      element={<ProtectedRoute element={<HealthAdvisorChat />} />} />
          <Route path="/health-alerts"       element={<ProtectedRoute element={<HealthAlerts />} />} />

          <Route path="/points"                    element={<ProtectedRoute element={<Points />} />} />
          <Route path="/points/tasks"              element={<ProtectedRoute element={<PointsTasks />} />} />
          <Route path="/points/rank"               element={<ProtectedRoute element={<PointsRank />} />} />
          <Route path="/points/donate/:partnerKey" element={<ProtectedRoute element={<PointsDonate />} />} />
          <Route path="/points/adoption-priority"  element={<ProtectedRoute element={<RedeemAdoptionPriority />} />} />
          <Route path="/points/health-report"      element={<ProtectedRoute element={<RedeemHealthReport />} />} />
          <Route path="/points/lucky-draw"         element={<ProtectedRoute element={<RedeemLuckyDraw />} />} />
          <Route path="/points/hospital-checkup"   element={<ProtectedRoute element={<RedeemHospitalCheckup />} />} />
          <Route path="/points/community-pass"     element={<ProtectedRoute element={<RedeemCommunityPass />} />} />
          <Route path="/points/merch-pack"         element={<ProtectedRoute element={<RedeemMerchPack />} />} />

          <Route path="/insurance"              element={<ProtectedRoute element={<InsuranceCenter />} />} />
          <Route path="/insurance/product/:id"  element={<ProtectedRoute element={<InsuranceProductDetail />} />} />
          <Route path="/insurance/claim/:id"    element={<ProtectedRoute element={<InsuranceClaim />} />} />

          <Route path="/challenges"                           element={<ChallengeBoard />} />
          <Route path="/challenges/:id"                      element={<ChallengeDetail />} />
          <Route path="/challenges/:challengeId/team/:teamId" element={<ChallengeTeam />} />
          <Route path="/achievement-badges"                  element={<ProtectedRoute element={<AchievementBadges />} />} />

          <Route path="/experts"            element={<ExpertList />} />
          <Route path="/experts/:id"        element={<ExpertProfile />} />
          <Route path="/experts/:id/column" element={<ExpertColumn />} />

          <Route path="/stores"                element={<StoreList />} />
          <Route path="/stores/my-bookings"    element={<ProtectedRoute element={<StoreMyBookings />} />} />
          <Route path="/stores/staff"          element={<ProtectedRoute element={<StoreStaffApp />} />} />
          <Route path="/stores/:id"            element={<StoreDetail />} />
          <Route path="/stores/:id/booking"    element={<ProtectedRoute element={<StoreBooking />} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

//  根应用 
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <ToastProvider>
            <NetworkBanner />
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;

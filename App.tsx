import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import NetworkBanner from './components/NetworkBanner';
import Home from './pages/Home';
import PetDetail from './pages/PetDetail';
import AdoptionForm from './pages/AdoptionForm';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import ChatDetail from './pages/ChatDetail';
import MyPets from './pages/MyPets';
import Verification from './pages/Verification';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import BindPhone from './pages/BindPhone';
import SocialAccount from './pages/SocialAccount';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import AboutUs from './pages/AboutUs';
import UserAgreement from './pages/UserAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ThemeSettings from './pages/ThemeSettings';
import RecycleBin from './pages/RecycleBin';
import PublishPet from './pages/PublishPet';
import PublishAdoptRequest from './pages/PublishAdoptRequest';
import AdoptionProgress from './pages/AdoptionProgress';
import LostAlerts from './pages/LostAlerts';
import PublishLostAlert from './pages/PublishLostAlert';
import LostAlertDetail from './pages/LostAlertDetail';
import RescueBoard from './pages/RescueBoard';
import RescueTaskDetail from './pages/RescueTaskDetail';
import PetHealthDiary from './pages/PetHealthDiary';
import Points from './pages/Points';
import PointsTasks from './pages/PointsTasks';
import PointsRank from './pages/PointsRank';
import PointsDonate from './pages/PointsDonate';
import RedeemAdoptionPriority from './pages/RedeemAdoptionPriority';
import RedeemHealthReport from './pages/RedeemHealthReport';
import RedeemLuckyDraw from './pages/RedeemLuckyDraw';
import RedeemHospitalCheckup from './pages/RedeemHospitalCheckup';
import RedeemCommunityPass from './pages/RedeemCommunityPass';
import RedeemMerchPack from './pages/RedeemMerchPack';
import ChallengeBoard from './pages/ChallengeBoard';
import ChallengeDetail from './pages/ChallengeDetail';
import ChallengeTeam from './pages/ChallengeTeam';
import AchievementBadges from './pages/AchievementBadges';
import HealthAdvisorChat from './pages/HealthAdvisorChat';
import HealthAlerts from './pages/HealthAlerts';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';
import StoreBooking from './pages/StoreBooking';
import StoreMyBookings from './pages/StoreMyBookings';
import StoreStaffApp from './pages/StoreStaffApp';
import InsuranceCenter from './pages/InsuranceCenter';
import InsuranceProductDetail from './pages/InsuranceProductDetail';
import InsuranceClaim from './pages/InsuranceClaim';
import ExpertList from './pages/ExpertList';
import ExpertProfile from './pages/ExpertProfile';
import ExpertColumn from './pages/ExpertColumn';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/pet/:id" element={<PetDetail />} />
      <Route path="/adopt" element={<ProtectedRoute element={<AdoptionForm />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
      <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<Favorites />} />} />
      <Route path="/chat/:id" element={<ProtectedRoute element={<ChatDetail />} />} />
      <Route path="/my-pets" element={<ProtectedRoute element={<MyPets />} />} />
      <Route path="/verification" element={<ProtectedRoute element={<Verification />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} />} />
      <Route path="/change-password" element={<ProtectedRoute element={<ChangePassword />} />} />
      <Route path="/bind-phone" element={<ProtectedRoute element={<BindPhone />} />} />
      <Route path="/social-account" element={<ProtectedRoute element={<SocialAccount />} />} />
      <Route path="/notification-settings" element={<ProtectedRoute element={<NotificationSettings />} />} />
      <Route path="/privacy-settings" element={<ProtectedRoute element={<PrivacySettings />} />} />
      <Route path="/theme-settings" element={<ThemeSettings />} />
      <Route path="/about-us" element={<ProtectedRoute element={<AboutUs />} />} />
      <Route path="/user-agreement" element={<UserAgreement />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/recycle-bin" element={<ProtectedRoute element={<RecycleBin />} />} />
      <Route path="/publish-pet" element={<ProtectedRoute element={<PublishPet />} />} />
      <Route path="/publish-adopt-request" element={<ProtectedRoute element={<PublishAdoptRequest />} />} />
      <Route path="/adoption-progress" element={<ProtectedRoute element={<AdoptionProgress />} />} />
      <Route path="/lost-alerts" element={<LostAlerts />} />
      <Route path="/lost-alerts/publish" element={<ProtectedRoute element={<PublishLostAlert />} />} />
      <Route path="/lost-alerts/:id" element={<LostAlertDetail />} />
      <Route path="/rescue-board" element={<ProtectedRoute element={<RescueBoard />} />} />
      <Route path="/rescue-board/:id" element={<ProtectedRoute element={<RescueTaskDetail />} />} />
      <Route path="/pet-health/:petId" element={<ProtectedRoute element={<PetHealthDiary />} />} />
      <Route path="/health-advisor" element={<ProtectedRoute element={<HealthAdvisorChat />} />} />
      <Route path="/health-alerts" element={<ProtectedRoute element={<HealthAlerts />} />} />
      <Route path="/points" element={<ProtectedRoute element={<Points />} />} />
      <Route path="/points/tasks" element={<ProtectedRoute element={<PointsTasks />} />} />
      <Route path="/points/rank" element={<ProtectedRoute element={<PointsRank />} />} />
      <Route path="/points/donate/:partnerKey" element={<ProtectedRoute element={<PointsDonate />} />} />
      <Route path="/points/adoption-priority" element={<ProtectedRoute element={<RedeemAdoptionPriority />} />} />
      <Route path="/points/health-report" element={<ProtectedRoute element={<RedeemHealthReport />} />} />
      <Route path="/points/lucky-draw" element={<ProtectedRoute element={<RedeemLuckyDraw />} />} />
      <Route path="/points/hospital-checkup" element={<ProtectedRoute element={<RedeemHospitalCheckup />} />} />
      <Route path="/points/community-pass" element={<ProtectedRoute element={<RedeemCommunityPass />} />} />
      <Route path="/points/merch-pack" element={<ProtectedRoute element={<RedeemMerchPack />} />} />
      <Route path="/insurance" element={<ProtectedRoute element={<InsuranceCenter />} />} />
      <Route path="/insurance/product/:id" element={<ProtectedRoute element={<InsuranceProductDetail />} />} />
      <Route path="/insurance/claim/:id" element={<ProtectedRoute element={<InsuranceClaim />} />} />
      <Route path="/challenges" element={<ChallengeBoard />} />
      <Route path="/challenges/:id" element={<ChallengeDetail />} />
      <Route path="/challenges/:challengeId/team/:teamId" element={<ChallengeTeam />} />
      <Route path="/achievement-badges" element={<ProtectedRoute element={<AchievementBadges />} />} />
      <Route path="/experts" element={<ExpertList />} />
      <Route path="/experts/:id" element={<ExpertProfile />} />
      <Route path="/experts/:id/column" element={<ExpertColumn />} />
      <Route path="/stores" element={<StoreList />} />
      <Route path="/stores/my-bookings" element={<ProtectedRoute element={<StoreMyBookings />} />} />
      <Route path="/stores/staff" element={<ProtectedRoute element={<StoreStaffApp />} />} />
      <Route path="/stores/:id" element={<StoreDetail />} />
      <Route path="/stores/:id/booking" element={<ProtectedRoute element={<StoreBooking />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <ToastProvider>
            <NetworkBanner />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;

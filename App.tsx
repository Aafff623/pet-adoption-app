import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
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
import AdoptionProgress from './pages/AdoptionProgress';

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
      <Route path="/adoption-progress" element={<ProtectedRoute element={<AdoptionProgress />} />} />
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
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;

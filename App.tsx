import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

interface ToastState {
  message: string;
  visible: boolean;
}

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="material-icons text-[#60e750] text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const AppRoutes: React.FC<{ showToast: (msg: string) => void }> = ({ showToast }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/pet/:id" element={<PetDetail showToast={showToast} />} />
      <Route path="/adopt" element={<ProtectedRoute element={<AdoptionForm />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<Profile showToast={showToast} />} />} />
      <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<Favorites showToast={showToast} />} />} />
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
      <Route path="/about-us" element={<ProtectedRoute element={<AboutUs />} />} />
      <Route path="/user-agreement" element={<UserAgreement />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 2000);
  };

  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes showToast={showToast} />
        {toast.visible && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full shadow-lg z-[998] fade-in"
          >
            {toast.message}
          </div>
        )}
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

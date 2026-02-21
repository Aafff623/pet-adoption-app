import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '20260218';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activityAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldScroll = params.get('from') === 'play-center' || params.get('anchor') === 'activity-zone';
    if (!shouldScroll) return;
    const timer = window.setTimeout(() => {
      activityAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.search]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const links = [
    { label: '用户协议', path: '/user-agreement', icon: 'description' },
    { label: '隐私政策', path: '/privacy-policy', icon: 'security' },
    { label: '意见反馈', path: '/feedback', icon: 'feedback' },
  ];

  const teamFeatures = [
    { icon: 'pets', label: '宠物领养', desc: '爱心宠物找新家' },
    { icon: 'favorite', label: '爱心社区', desc: '连接爱宠人士' },
    { icon: 'verified', label: '机构认证', desc: '专业可信平台' },
    { icon: 'support_agent', label: '用户服务', desc: '全天候在线支持' },
  ];

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">关于我们</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
            <span className="material-icons-round text-primary text-4xl">pets</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">PetConnect</h2>
          <p className="text-sm text-gray-400 mt-1">连接爱宠人士，守护每一个生命</p>
          <div className="mt-3 px-4 py-1.5 bg-gray-50 rounded-full">
            <p className="text-xs text-gray-500">
              版本 {APP_VERSION} (Build {BUILD_NUMBER})
            </p>
          </div>
        </div>

        <div ref={activityAnchorRef} className="grid grid-cols-2 gap-3">
          {teamFeatures.map(feature => (
            <div
              key={feature.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <span className="material-icons-round text-primary text-2xl mb-2">{feature.icon}</span>
              <p className="text-sm font-semibold text-gray-800">{feature.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">联系我们</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-gray-400 text-base">email</span>
              <span className="text-sm text-gray-600">support@petconnect.app</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-gray-400 text-base">language</span>
              <span className="text-sm text-gray-600">www.petconnect.app</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-gray-400 text-base">schedule</span>
              <span className="text-sm text-gray-600">工作日 9:00 - 18:00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {links.map((link, index) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index !== links.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-gray-400 text-base">{link.icon}</span>
                <span className="text-sm text-gray-800">{link.label}</span>
              </div>
              <span className="material-icons-round text-gray-300">chevron_right</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          © 2026 PetConnect. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default AboutUs;

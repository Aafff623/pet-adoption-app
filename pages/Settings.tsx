import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingItem {
  label: string;
  path?: string;
  action?: () => void;
  icon: string;
  badge?: string;
  danger?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleClearCache = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCache = () => {
    const keysToRemove = [
      'petconnect_notification_settings',
      'petconnect_privacy_settings',
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setShowClearConfirm(false);
    setClearDone(true);
    showToast('缓存已清除');
    setTimeout(() => setClearDone(false), 3000);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const sections: SettingSection[] = [
    {
      title: '账号与安全',
      items: [
        { label: '修改密码', path: '/change-password', icon: 'lock' },
        { label: '绑定手机', path: '/bind-phone', icon: 'phone_android' },
        { label: '社交账号绑定', path: '/social-account', icon: 'link' },
      ],
    },
    {
      title: '通用设置',
      items: [
        { label: '消息通知', path: '/notification-settings', icon: 'notifications' },
        { label: '隐私设置', path: '/privacy-settings', icon: 'security' },
        {
          label: clearDone ? '清除成功' : '清除缓存',
          icon: clearDone ? 'check_circle' : 'delete_sweep',
          action: handleClearCache,
        },
      ],
    },
    {
      title: '关于',
      items: [
        { label: '关于我们', path: '/about-us', icon: 'info' },
        { label: '用户协议', path: '/user-agreement', icon: 'description' },
        { label: '隐私政策', path: '/privacy-policy', icon: 'privacy_tip' },
        { label: '版本更新', icon: 'system_update', badge: '最新' },
      ],
    },
  ];

  const handleItemClick = (item: SettingItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    } else if (item.label === '版本更新') {
      showToast('已是最新版本 v1.0.0');
    }
  };

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
        <h1 className="text-lg font-bold text-gray-900 ml-2">设置</h1>
      </header>

      <main className="p-6 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500 ml-1">{section.title}</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left ${
                    i !== section.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                  aria-label={item.label}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-icons-round text-xl ${clearDone && item.icon === 'check_circle' ? 'text-green-500' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className={`${item.danger ? 'text-red-500' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="material-icons-round text-gray-300">chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-end justify-center"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <span className="material-icons-round text-orange-500 text-2xl">delete_sweep</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">清除缓存</h3>
              <p className="text-sm text-gray-500">将清除本地通知、隐私等设置缓存数据，不影响账号信息。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmClearCache}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full shadow-lg z-[998] fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Settings;

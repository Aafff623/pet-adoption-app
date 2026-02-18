import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  bound: boolean;
  boundAccount?: string;
}

const SocialAccount: React.FC = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { id: 'wechat', name: '微信', icon: 'chat', iconColor: 'text-green-500', bound: false },
    { id: 'qq', name: 'QQ', icon: 'smart_toy', iconColor: 'text-blue-500', bound: false },
    { id: 'weibo', name: '微博', icon: 'public', iconColor: 'text-red-500', bound: false },
    { id: 'google', name: 'Google', icon: 'language', iconColor: 'text-yellow-500', bound: false },
  ]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const handleBind = async (platformId: string) => {
    setActionLoading(platformId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId
            ? { ...p, bound: true, boundAccount: `user_${Math.random().toString(36).slice(2, 8)}` }
            : p
        )
      );
      showToast('绑定成功');
    } catch {
      showToast('绑定失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbind = async (platformId: string) => {
    const boundCount = platforms.filter(p => p.bound).length;
    if (boundCount <= 1) {
      showToast('至少保留一个登录方式');
      return;
    }
    setActionLoading(platformId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId ? { ...p, bound: false, boundAccount: undefined } : p
        )
      );
      showToast('已解除绑定');
    } catch {
      showToast('操作失败，请稍后重试');
    } finally {
      setActionLoading(null);
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
        <h1 className="text-lg font-bold text-gray-900 ml-2">社交账号绑定</h1>
      </header>

      <main className="p-6 space-y-4">
        <p className="text-sm text-gray-500 ml-1">绑定社交账号后可直接使用该账号登录</p>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {platforms.map((platform, index) => (
            <div
              key={platform.id}
              className={`flex items-center justify-between p-4 ${index !== platforms.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center`}>
                  <span className={`material-icons-round text-xl ${platform.iconColor}`}>
                    {platform.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{platform.name}</p>
                  {platform.bound && platform.boundAccount ? (
                    <p className="text-xs text-gray-400">{platform.boundAccount}</p>
                  ) : (
                    <p className="text-xs text-gray-400">未绑定</p>
                  )}
                </div>
              </div>

              {actionLoading === platform.id ? (
                <span className="material-icons-round text-gray-400 animate-spin text-xl">refresh</span>
              ) : platform.bound ? (
                <button
                  onClick={() => handleUnbind(platform.id)}
                  className="text-sm text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  解除绑定
                </button>
              ) : (
                <button
                  onClick={() => handleBind(platform.id)}
                  className="text-sm text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  去绑定
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
          <span className="material-icons-round text-blue-400 text-base mt-0.5">info</span>
          <p className="text-xs text-blue-600">至少需要保留一种登录方式，解绑前请确保还有其他可用的登录方式。</p>
        </div>
      </main>
    </div>
  );
};

export default SocialAccount;

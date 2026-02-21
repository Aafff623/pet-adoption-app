import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchTotalUnreadCount } from '../lib/api/messages';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!user) return;
    fetchTotalUnreadCount(user.id).then(count => setHasUnread(count > 0));
  }, [user, location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-zinc-700 pb-6 pt-2 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto relative">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center p-2 group w-16"
          aria-label="首页"
          aria-current={isActive('/') ? 'page' : undefined}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors ${isActive('/') ? 'bg-primary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-700'}`}>
            <span className={`material-icons-round text-2xl ${isActive('/') ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>home</span>
          </div>
          <span className={`text-[10px] font-bold ${isActive('/') ? 'text-primary' : 'text-gray-500 dark:text-zinc-400'}`}>首页</span>
        </button>

        <button
          onClick={() => navigate('/favorites')}
          className="flex flex-col items-center p-2 group w-16"
          aria-label="收藏"
          aria-current={isActive('/favorites') ? 'page' : undefined}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors ${isActive('/favorites') ? 'bg-primary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-700'}`}>
            <span className={`material-icons-round text-2xl ${isActive('/favorites') ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>favorite_border</span>
          </div>
          <span className={`text-[10px] font-medium ${isActive('/favorites') ? 'text-primary' : 'text-gray-500 dark:text-zinc-400'}`}>收藏</span>
        </button>

        {/* Center + button */}
        <div className="w-16 flex items-center justify-center">
          <button
            onClick={() => setShowPlusMenu(v => !v)}
            aria-label="发布"
            className="relative -mt-6 w-14 h-14 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg border border-gray-100 dark:border-zinc-700 transition-transform active:scale-[0.97]"
          >
            <span className="material-icons-round text-3xl text-pink-500">add</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center p-2 group w-16"
          aria-label="消息"
          aria-current={isActive('/messages') ? 'page' : undefined}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors relative ${isActive('/messages') ? 'bg-primary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-700'}`}>
            <span className={`material-icons-round text-2xl ${isActive('/messages') ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>chat_bubble_outline</span>
            {hasUnread && (
              <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" aria-hidden="true"></span>
            )}
          </div>
          <span className={`text-[10px] font-medium ${isActive('/messages') ? 'text-primary' : 'text-gray-500 dark:text-zinc-400'}`}>消息</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center p-2 group w-16"
          aria-label="我的"
          aria-current={isActive('/profile') ? 'page' : undefined}
        >
          <div className={`w-12 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors ${isActive('/profile') ? 'bg-primary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-700'}`}>
            <span className={`material-icons-round text-2xl ${isActive('/profile') ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>person_outline</span>
          </div>
          <span className={`text-[10px] font-medium ${isActive('/profile') ? 'text-primary' : 'text-gray-500 dark:text-zinc-400'}`}>我的</span>
        </button>
      </div>

      {/* Plus menu sheet */}
      {showPlusMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPlusMenu(false); }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md p-4 pb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-zinc-700">
              <button
                onClick={() => { setShowPlusMenu(false); navigate('/publish-pet'); }}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-icons-round">add_circle_outline</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200">发布送养</span>
                <span className="ml-auto material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
              </button>
              <button
                onClick={() => { setShowPlusMenu(false); navigate('/publish-adopt-request'); }}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <span className="material-icons-round">pets</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200">发布求领养</span>
                <span className="ml-auto material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
              </button>
              <button
                onClick={() => { setShowPlusMenu(false); navigate('/experts'); }}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                  <span className="material-icons-round">verified_user</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200">宠物达人</span>
                <span className="ml-auto material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
              </button>
              <button
                onClick={() => { setShowPlusMenu(false); navigate('/challenges'); }}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                  <span className="material-icons-round">emoji_events</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200">城市挑战赛</span>
                <span className="ml-auto material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default BottomNav;

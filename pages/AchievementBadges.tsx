import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchUserBadges } from '../lib/api/challenges';
import type { AchievementBadge } from '../types';

const BADGE_ICONS: Record<string, string> = {
  challenge_first: 'emoji_events',
  challenge_complete: 'star',
  team_leader: 'military_tech',
  top_10: 'workspace_premium',
  default: 'verified',
};

const AchievementBadges: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchUserBadges(user.id);
      setBadges(list);
    } catch {
      showToast('加载成就失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = (badge: AchievementBadge) => {
    const text = `我在 PetConnect 获得了「${badge.title}」成就！`;
    if (navigator.share) {
      navigator
        .share({
          title: badge.title,
          text,
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard?.writeText(text).then(() => showToast('已复制到剪贴板'));
        });
    } else {
      navigator.clipboard?.writeText(text).then(() => showToast('已复制到剪贴板'));
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-4">
          lock
        </span>
        <p className="text-gray-500 dark:text-zinc-400 mb-4">登录后查看成就徽章</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 rounded-xl bg-primary text-black font-medium"
        >
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          成就徽章
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          参与挑战、完成任务，收集专属徽章
        </p>
      </header>

      <main className="px-6 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800 animate-pulse"
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : badges.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-4xl text-gray-400 dark:text-zinc-500">
                {BADGE_ICONS.default}
              </span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 mb-2">暂无成就徽章</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mb-4">
              参与城市挑战赛，完成任务即可获得
            </p>
            <button
              onClick={() => navigate('/challenges')}
              className="px-6 py-2 rounded-xl bg-primary text-black font-medium"
            >
              去挑战
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="material-icons-round text-3xl text-white">
                      {BADGE_ICONS[b.badgeKey] ?? BADGE_ICONS.default}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{b.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {b.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    {formatDate(b.earnedAt)} 获得
                  </p>
                </div>
                <button
                  onClick={() => handleShare(b)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                  aria-label="分享"
                >
                  <span className="material-icons-round text-gray-500 dark:text-zinc-400">
                    share
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AchievementBadges;

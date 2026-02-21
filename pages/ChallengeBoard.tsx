import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchChallenges,
  REWARD_TYPE_LABELS,
} from '../lib/api/challenges';
import type { Challenge, ChallengeStatus } from '../types';

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  upcoming: '即将开始',
  active: '进行中',
  ended: '已结束',
};

const STATUS_CLASS: Record<ChallengeStatus, string> = {
  upcoming: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
  active: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
  ended: 'bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400',
};

const ChallengeBoard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ChallengeStatus | 'all'>('active');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchChallenges({
        status: filter === 'all' ? undefined : filter,
        currentUserId: user?.id,
        limit: 30,
      });
      setChallenges(list);
    } catch {
      showToast('加载挑战赛失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [filter, user?.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            城市挑战赛
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            月度挑战、排行榜、小队任务、成就徽章
          </p>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {(['active', 'upcoming', 'ended', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === s
                  ? 'bg-primary text-black'
                  : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {s === 'all' ? '全部' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800 animate-pulse"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
            <span className="material-icons-round text-5xl mb-2">emoji_events</span>
            <p className="text-sm">暂无挑战赛，敬请期待</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/challenges/${c.id}`)}
                className="w-full text-left p-4 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-3xl text-white">
                      emoji_events
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        {c.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[c.status]}`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                      {c.myParticipant && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          已参与
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-zinc-400">
                      <span>{c.cityName}</span>
                      <span>·</span>
                      <span>
                        {formatDate(c.startAt)} - {formatDate(c.endAt)}
                      </span>
                      <span>·</span>
                      <span>{c.participantCount ?? 0} 人参与</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-primary font-medium text-sm">
                        {REWARD_TYPE_LABELS[c.rewardType]} {c.rewardValue}
                        {c.rewardType === 'points' || c.rewardType === 'points_double'
                          ? ' 积分'
                          : ''}
                      </span>
                      {c.rewardDesc && (
                        <span className="text-gray-400 dark:text-zinc-500 text-xs">
                          {c.rewardDesc}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-icons-round text-gray-300 dark:text-zinc-500 self-center">
                    chevron_right
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ChallengeBoard;

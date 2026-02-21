import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchChallengeById,
  fetchChallengeTeams,
  fetchTeamMembers,
} from '../lib/api/challenges';
import type { Challenge, ChallengeParticipant, ChallengeTeam } from '../types';

const ChallengeTeam: React.FC = () => {
  const { challengeId, teamId } = useParams<{ challengeId: string; teamId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [team, setTeam] = useState<ChallengeTeam | null>(null);
  const [members, setMembers] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!challengeId || !teamId) return;
    setLoading(true);
    try {
      const [c, tList, m] = await Promise.all([
        fetchChallengeById(challengeId, user?.id),
        fetchChallengeTeams(challengeId),
        fetchTeamMembers(teamId),
      ]);
      setChallenge(c ?? null);
      const found = tList.find((t) => t.id === teamId);
      setTeam(found ?? null);
      setMembers(m);
    } catch {
      showToast('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [challengeId, teamId, user?.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !team) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (!team || !challenge) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-4">
          error_outline
        </span>
        <p className="text-gray-500 dark:text-zinc-400">小队不存在</p>
        <button
          onClick={() => navigate(challengeId ? `/challenges/${challengeId}` : '/challenges')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-black font-medium"
        >
          返回
        </button>
      </div>
    );
  }

  const totalScore = members.reduce((s, m) => s + m.score, 0);

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4">
        <button
          onClick={() => navigate(`/challenges/${challengeId}`)}
          className="flex items-center gap-1 text-gray-600 dark:text-zinc-400 mb-4"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>返回</span>
        </button>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="material-icons-round text-3xl text-white">group</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{team.name}</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{challenge.title}</p>
            <p className="text-sm text-primary font-medium mt-0.5">
              小队总分：{totalScore} 分 · {members.length} 人
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 pb-6">
        <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">成员列表</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-400 py-8 text-center">
            暂无成员
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700"
              >
                <span className="w-6 text-center font-bold text-gray-500 dark:text-zinc-400">
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-600 flex items-center justify-center overflow-hidden shrink-0">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-icons-round text-gray-400">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                    {m.nickname ?? '用户'}
                  </p>
                </div>
                <span className="font-semibold text-primary">{m.score} 分</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ChallengeTeam;

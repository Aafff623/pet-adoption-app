import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchChallengeById,
  fetchChallengeLeaderboard,
  fetchChallengeTeams,
  joinChallenge,
  createChallengeTeam,
  joinChallengeTeam,
  REWARD_TYPE_LABELS,
} from '../lib/api/challenges';
import type { Challenge, ChallengeParticipant, ChallengeTeam } from '../types';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  const [teams, setTeams] = useState<ChallengeTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showTeamSheet, setShowTeamSheet] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, lb, t] = await Promise.all([
        fetchChallengeById(id, user?.id),
        fetchChallengeLeaderboard(id, 20),
        fetchChallengeTeams(id),
      ]);
      setChallenge(c ?? null);
      setLeaderboard(lb);
      setTeams(t);
    } catch {
      showToast('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!challenge || challenge.status !== 'active') {
      showToast('该挑战赛暂不可参与');
      return;
    }
    if (challenge.myParticipant) {
      showToast('您已参与该挑战');
      return;
    }
    setJoining(true);
    try {
      await joinChallenge({ challengeId: challenge.id }, user.id);
      showToast('参与成功');
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '参与失败');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !challenge) return;
    if (!newTeamName.trim()) {
      showToast('请输入小队名称');
      return;
    }
    setCreatingTeam(true);
    try {
      await createChallengeTeam(
        { challengeId: challenge.id, name: newTeamName.trim() },
        user.id
      );
      showToast('创建成功');
      setShowTeamSheet(false);
      setNewTeamName('');
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '创建失败');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user || !challenge) return;
    if (!challenge.myParticipant) {
      showToast('请先参与挑战');
      return;
    }
    setJoiningTeamId(teamId);
    try {
      await joinChallengeTeam(teamId, challenge.id, user.id);
      showToast('加入小队成功');
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '加入失败');
    } finally {
      setJoiningTeamId(null);
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  if (loading && !challenge) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-4">
          error_outline
        </span>
        <p className="text-gray-500 dark:text-zinc-400">挑战赛不存在</p>
        <button
          onClick={() => navigate('/challenges')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-black font-medium"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 dark:text-zinc-400 mb-4"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>返回</span>
        </button>
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <span className="material-icons-round text-4xl text-white">emoji_events</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              {challenge.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {challenge.cityName} · {formatDate(challenge.startAt)} - {formatDate(challenge.endAt)}
            </p>
            <p className="text-sm text-primary font-medium mt-1">
              {REWARD_TYPE_LABELS[challenge.rewardType]} {challenge.rewardValue}
              {challenge.rewardType === 'points' || challenge.rewardType === 'points_double'
                ? ' 积分'
                : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 pb-6 space-y-6">
        <section className="p-4 rounded-xl bg-white dark:bg-zinc-800">
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">挑战说明</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">
            {challenge.description}
          </p>
          {challenge.rewardDesc && (
            <p className="text-sm text-primary mt-2">{challenge.rewardDesc}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
            小队规模：{challenge.minTeamSize}~{challenge.maxTeamSize} 人
          </p>
        </section>

        {challenge.status === 'active' && !challenge.myParticipant && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50 active:scale-[0.98]"
          >
            {joining ? '参与中...' : '立即参与'}
          </button>
        )}

        {challenge.myParticipant && challenge.status === 'active' && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-900 dark:text-zinc-100">我的小队</h2>
              <button
                onClick={() => setShowTeamSheet(true)}
                className="text-sm text-primary font-medium"
              >
                创建/加入小队
              </button>
            </div>
            {teams.length > 0 ? (
              <div className="space-y-2">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/challenges/${challenge.id}/team/${t.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/challenges/${challenge.id}/team/${t.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 cursor-pointer hover:border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-600 flex items-center justify-center overflow-hidden">
                        {t.leaderAvatarUrl ? (
                          <img
                            src={t.leaderAvatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-icons-round text-gray-400">group</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100">{t.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {t.memberCount} 人 · 总分 {t.totalScore}
                        </p>
                      </div>
                    </div>
                    {!challenge.myParticipant?.teamId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleJoinTeam(t.id); }}
                        disabled={joiningTeamId === t.id}
                        className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium"
                      >
                        {joiningTeamId === t.id ? '加入中...' : '加入'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
                暂无小队，点击上方创建
              </p>
            )}
          </section>
        )}

        <section>
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">排行榜</h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
              暂无排名数据
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    idx < 3
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-8 text-center font-bold ${
                      idx === 0
                        ? 'text-amber-500'
                        : idx === 1
                          ? 'text-gray-400'
                          : idx === 2
                            ? 'text-amber-700'
                            : 'text-gray-500 dark:text-zinc-400'
                    }`}
                  >
                    {p.rank ?? idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-600 flex items-center justify-center overflow-hidden shrink-0">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-icons-round text-gray-400">person</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                      {p.nickname ?? '用户'}
                    </p>
                    {p.teamName && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{p.teamName}</p>
                    )}
                  </div>
                  <span className="font-semibold text-primary">{p.score} 分</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showTeamSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowTeamSheet(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-t-2xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">
              创建小队
            </h3>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="小队名称"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 mb-4"
            />
            <button
              onClick={handleCreateTeam}
              disabled={creatingTeam}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50"
            >
              {creatingTeam ? '创建中...' : '创建'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ChallengeDetail;

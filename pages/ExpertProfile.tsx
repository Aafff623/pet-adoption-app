import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ExpertBadge from '../components/ExpertBadge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchExpertById,
  followExpert,
  unfollowExpert,
  tipExpert,
  getCertificationLabel,
} from '../lib/api/experts';
import { fetchProfile } from '../lib/api/profile';
import type { ExpertWithProfile } from '../types';

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e4e4e7'/%3E%3Ctext x='50' y='58' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E";

const TIP_AMOUNTS = [10, 30, 50, 100, 200];

const ExpertProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [expert, setExpert] = useState<ExpertWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showTipSheet, setShowTipSheet] = useState(false);
  const [tipAmount, setTipAmount] = useState(30);
  const [tipLoading, setTipLoading] = useState(false);
  const [myPoints, setMyPoints] = useState<number | null>(null);

  const loadExpert = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchExpertById(id, user?.id);
      setExpert(data);
    } catch {
      showToast('加载达人信息失败');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]); // 移除 user?.id 依赖，避免不必要的重新加载

  useEffect(() => {
    loadExpert();
  }, [loadExpert]);

  useEffect(() => {
    if (user && showTipSheet) {
      fetchProfile(user.id).then((p) => setMyPoints(p?.points ?? 0));
    }
  }, [user, showTipSheet]);

  const handleFollowToggle = async () => {
    if (!user || !expert) {
      navigate('/login');
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (expert.isFollowing) {
        await unfollowExpert(user.id, expert.userId);
        setExpert((prev) => (prev ? { ...prev, isFollowing: false, followerCount: prev.followerCount - 1 } : null));
        showToast('已取消关注');
      } else {
        await followExpert(user.id, expert.userId);
        setExpert((prev) => (prev ? { ...prev, isFollowing: true, followerCount: prev.followerCount + 1 } : null));
        showToast('关注成功');
      }
    } catch {
      showToast('操作失败，请重试');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTip = async () => {
    if (!user || !expert) {
      navigate('/login');
      return;
    }
    if (tipAmount <= 0 || tipAmount > (myPoints ?? 0)) {
      showToast('积分不足');
      return;
    }
    setTipLoading(true);
    try {
      await tipExpert(expert.userId, tipAmount, user.id);
      setShowTipSheet(false);
      showToast('打赏成功');
      if (myPoints !== null) setMyPoints(myPoints - tipAmount);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '打赏失败');
    } finally {
      setTipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-zinc-900">
        <span className="material-icons-round text-primary text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-zinc-900 px-6">
        <span className="material-icons-round text-6xl text-gray-400 dark:text-zinc-500 mb-4">
          person_off
        </span>
        <p className="text-gray-600 dark:text-zinc-400">达人不存在或未通过审核</p>
        <button
          onClick={() => navigate('/experts')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-black font-semibold"
        >
          返回达人列表
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:text-zinc-100"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>返回</span>
        </button>
      </header>

      <main className="px-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <img
              src={expert.avatarUrl || DEFAULT_AVATAR}
              alt={expert.nickname}
              className="w-24 h-24 rounded-full object-cover bg-gray-100 dark:bg-zinc-700 border-4 border-white dark:border-zinc-800 shadow-lg"
            />
          </div>
          <ExpertBadge certificationType={expert.certificationType} level={expert.level} size="md" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 text-center mt-3">{expert.nickname}</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
            {getCertificationLabel(expert.certificationType)}
            {expert.city ? ` · ${expert.city}` : ''}
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-300 mt-6 max-w-[320px] text-center leading-relaxed">
            {expert.columnBio || expert.bio || '分享养宠心得'}
          </p>

          <div className="flex items-center gap-6 mt-6">
            <span className="text-center">
              <span className="block text-lg font-bold text-gray-900 dark:text-zinc-100">
                {expert.followerCount}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">粉丝</span>
            </span>
          </div>

          <div className="flex gap-3 mt-6 w-full max-w-[280px]">
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.98] ${
                expert.isFollowing
                  ? 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                  : 'bg-primary text-black'
              }`}
            >
              {followLoading ? '...' : expert.isFollowing ? '已关注' : '关注'}
            </button>
            <button
              onClick={() => (user ? setShowTipSheet(true) : navigate('/login'))}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 text-black active:scale-[0.98]"
            >
              打赏
            </button>
            <button
              onClick={() => navigate(`/experts/${expert.userId}/column`)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 active:scale-[0.98]"
            >
              专栏
            </button>
          </div>
        </div>
      </main>

      <BottomNav />

      {showTipSheet && (
        <div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 dark:bg-black/60"
          onClick={() => setShowTipSheet(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">打赏达人</h3>
              <button
                onClick={() => setShowTipSheet(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400">close</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              使用积分打赏，达人将获得 70%，平台收取 30%
            </p>
            {myPoints !== null && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                当前积分：{myPoints}
              </p>
            )}
            <div className="flex gap-2 flex-wrap mb-6">
              {TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTipAmount(amt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    tipAmount === amt
                      ? 'bg-primary text-black'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                  }`}
                >
                  {amt} 积分
                </button>
              ))}
            </div>
            <button
              onClick={handleTip}
              disabled={tipLoading || tipAmount <= 0 || (myPoints !== null && tipAmount > myPoints)}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50 active:scale-[0.98]"
            >
              {tipLoading ? '打赏中...' : `打赏 ${tipAmount} 积分`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertProfile;

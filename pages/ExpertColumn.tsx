import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ExpertBadge from '../components/ExpertBadge';
import {
  fetchExpertById,
  fetchExpertTipsReceived,
  fetchExpertEarnings,
  getCertificationLabel,
} from '../lib/api/experts';
import { useAuth } from '../contexts/AuthContext';
import type { ExpertWithProfile, ExpertTip, ExpertEarning } from '../types';

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e4e4e7'/%3E%3Ctext x='50' y='58' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E";

const ExpertColumn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expert, setExpert] = useState<ExpertWithProfile | null>(null);
  const [tips, setTips] = useState<ExpertTip[]>([]);
  const [earnings, setEarnings] = useState<ExpertEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    const load = async () => {
      try {
        // 三个查询并行执行
        const [exp, tipList, earnList] = await Promise.all([
          fetchExpertById(id, user?.id),
          fetchExpertTipsReceived(id, 10),
          user?.id === id ? fetchExpertEarnings(id, 20) : Promise.resolve([]),
        ]);
        
        setExpert(exp ?? null);
        setTips(tipList ?? []);
        setEarnings(earnList ?? []);
      } catch (err) {
        console.error('Failed to load expert column:', err);
        setExpert(null);
        setTips([]);
        setEarnings([]);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [id, user?.id]);

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
        <p className="text-gray-600 dark:text-zinc-400">达人不存在</p>
        <button
          onClick={() => navigate('/experts')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-black font-semibold"
        >
          返回
        </button>
      </div>
    );
  }

  const totalTips = tips.reduce((acc, t) => acc + t.points, 0);

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:text-zinc-100"
        >
          <span className="material-icons-round">arrow_back</span>
          <span>返回</span>
        </button>
      </header>

      <main className="px-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={expert.avatarUrl || DEFAULT_AVATAR}
            alt={expert.nickname}
            className="w-14 h-14 rounded-full object-cover bg-gray-100 dark:bg-zinc-700"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{expert.nickname}</h1>
            <div className="flex items-center gap-2 mt-1">
              <ExpertBadge certificationType={expert.certificationType} level={expert.level} size="sm" />
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                {getCertificationLabel(expert.certificationType)}
              </span>
            </div>
          </div>
        </div>

        <section className="rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-4 mb-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-2">专栏简介</h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            {expert.columnBio || expert.bio || '暂无简介'}
          </p>
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-4 mb-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-3">数据概览</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900">
              <span className="block text-2xl font-bold text-primary">{expert.followerCount}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">粉丝数</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900">
              <span className="block text-2xl font-bold text-amber-500">{totalTips}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">收到打赏（积分）</span>
            </div>
            {user?.id === expert.userId && (
              <div className="col-span-2 p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <span className="block text-2xl font-bold text-primary">
                  {earnings.reduce((a, e) => a + e.amount, 0)}
                </span>
                <span className="text-xs text-gray-600 dark:text-zinc-400">我的收益分成（积分）</span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-4 mb-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-3">近期打赏</h2>
          {tips.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-400">暂无打赏记录</p>
          ) : (
            <ul className="space-y-2">
              {tips.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-zinc-400">
                    +{t.expertReceived} 积分
                  </span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="text-center py-8 text-gray-500 dark:text-zinc-400 text-sm">
          <span className="material-icons-round text-3xl mb-2 block">article</span>
          更多专栏内容敬请期待
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ExpertColumn;

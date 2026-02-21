import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ExpertCard from '../components/ExpertCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchExpertList,
  fetchFeaturedExperts,
  fetchMyExpertApplication,
  applyExpert,
  getCertificationLabel,
} from '../lib/api/experts';
import type { ExpertWithProfile } from '../types';
import type { ExpertCertificationType } from '../types';

const ExpertList: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [experts, setExperts] = useState<ExpertWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myApplication, setMyApplication] = useState<{ status: string } | null>(null);
  const [featuredExperts, setFeaturedExperts] = useState<ExpertWithProfile[]>([]);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [applyType, setApplyType] = useState<ExpertCertificationType>('trainer');
  const [applyBio, setApplyBio] = useState('');
  const [applying, setApplying] = useState(false);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchExpertList({ limit: 50, currentUserId: user?.id });
      setExperts(list);
    } catch {
      showToast('加载达人列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  useEffect(() => {
    if (!user) return;
    fetchMyExpertApplication(user.id).then((app) => {
      setMyApplication(app ? { status: app.status } : null);
    });
  }, [user]);

  useEffect(() => {
    fetchFeaturedExperts(4).then(setFeaturedExperts).catch(() => setFeaturedExperts([]));
  }, []);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!applyBio.trim()) {
      showToast('请填写专栏简介');
      return;
    }
    setApplying(true);
    try {
      await applyExpert({ certificationType: applyType, columnBio: applyBio.trim() }, user.id);
      setMyApplication({ status: 'pending' });
      setShowApplySheet(false);
      setApplyBio('');
      showToast('申请已提交，请等待审核');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '申请失败，请重试');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-24 fade-in">
      <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">宠物达人</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              关注达人，获取专业养宠知识
            </p>
          </div>
          {user && !myApplication && (
            <button
              onClick={() => setShowApplySheet(true)}
              className="px-4 py-2 rounded-xl bg-primary text-black font-semibold text-sm active:scale-[0.97]"
            >
              申请认证
            </button>
          )}
          {myApplication?.status === 'pending' && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              审核中
            </span>
          )}
        </div>
      </header>

      <main className="px-6 pb-6">
        {featuredExperts.length > 0 && !loading && (
          <section className="mb-5">
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">精选达人</h2>
              <span className="text-xs text-primary font-semibold">达人专区</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} variant="full" />
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 animate-pulse"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
            <span className="material-icons-round text-5xl mb-2">person_search</span>
            <p className="text-sm">暂无达人，快来申请成为达人吧</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">达人列表</h3>
              <span className="text-xs text-gray-500 dark:text-zinc-400">共 {experts.length} 位</span>
            </div>
            <div className="space-y-3">
              {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} variant="compact" />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {showApplySheet && (
        <div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/50 dark:bg-black/60"
          onClick={() => setShowApplySheet(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">申请达人认证</h3>
              <button
                onClick={() => setShowApplySheet(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400">close</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
              选择认证类型并填写专栏简介，审核通过后即可成为达人
            </p>

            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                认证类型
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['trainer', 'nutritionist', 'medical_volunteer'] as ExpertCertificationType[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setApplyType(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        applyType === t
                          ? 'bg-primary text-black'
                          : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      {getCertificationLabel(t)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                专栏简介
              </label>
              <textarea
                value={applyBio}
                onChange={(e) => setApplyBio(e.target.value)}
                placeholder="介绍您的专业领域与分享方向..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50 active:scale-[0.98]"
            >
              {applying ? '提交中...' : '提交申请'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertList;

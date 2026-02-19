import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchMyApplications } from '../lib/api/adoption';
import { fetchPetById } from '../lib/api/pets';
import AdoptionProgressTimeline from '../components/AdoptionProgressTimeline';
import type { AdoptionApplication, Pet } from '../types';

interface AppWithPet {
  application: AdoptionApplication;
  pet: Pet | null;
}

const STATUS_MAP: Record<AdoptionApplication['status'], { label: string; color: string; bg: string }> = {
  pending: { label: '审核中', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  approved: { label: '已通过', color: 'text-primary', bg: 'bg-green-50 dark:bg-primary/10' },
  rejected: { label: '未通过', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
};

const AdoptionProgress: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<AppWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const apps = await fetchMyApplications(user.id);
        const withPets = await Promise.all(
          apps.map(async app => ({
            application: app,
            pet: await fetchPetById(app.petId),
          }))
        );
        setItems(withPets);
      } catch {
        showToast('加载申请记录失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/profile', { replace: true });
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 ml-2">我的申请</h1>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="material-icons-round text-6xl text-gray-200 dark:text-zinc-700">assignment</span>
            <p className="text-gray-400 dark:text-zinc-500 text-sm">暂无申请记录</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-black rounded-full font-bold text-sm shadow-lg shadow-primary/20"
            >
              去发现宠物
            </button>
          </div>
        ) : (
          items.map(({ application, pet }) => {
            const statusInfo = STATUS_MAP[application.status];
            const isExpanded = expandedId === application.id;

            return (
              <div
                key={application.id}
                className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-50 dark:border-zinc-700"
              >
                {/* 卡片头部 */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : application.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors active:scale-[0.99]"
                >
                  {pet ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-zinc-700 flex-shrink-0"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='58%25' font-size='28' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-round text-gray-300 dark:text-zinc-500 text-2xl">pets</span>
                    </div>
                  )}

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-gray-900 dark:text-zinc-100">
                        {pet?.name ?? '未知宠物'}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      {pet?.breed ?? ''} · 申请人：{application.fullName}
                    </p>
                  </div>

                  <span
                    className={`material-icons-round text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {/* 展开：进度时间轴 */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50 dark:border-zinc-700">
                    <AdoptionProgressTimeline application={application} />

                    {/* 申请详情摘要 */}
                    <div className="mt-4 bg-gray-50 dark:bg-zinc-700 rounded-xl p-4 space-y-2 text-sm">
                      <p className="text-gray-500 dark:text-zinc-400">
                        <span className="font-medium text-gray-700 dark:text-zinc-200">居住类型：</span>
                        {application.housingType}
                      </p>
                      <p className="text-gray-500 dark:text-zinc-400">
                        <span className="font-medium text-gray-700 dark:text-zinc-200">养宠经验：</span>
                        {application.hasExperience ? '有经验' : '无经验'}
                      </p>
                      {application.message && (
                        <p className="text-gray-500 dark:text-zinc-400">
                          <span className="font-medium text-gray-700 dark:text-zinc-200">留言：</span>
                          {application.message}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => pet && navigate(`/pet/${pet.id}`)}
                      className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      查看宠物详情
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default AdoptionProgress;

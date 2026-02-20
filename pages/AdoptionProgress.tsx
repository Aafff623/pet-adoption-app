import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchMyApplications } from '../lib/api/adoption';
import { ensureAdoptionMilestones, confirmMilestone } from '../lib/api/adoptionMilestones';
import { fetchPetById } from '../lib/api/pets';
import AdoptionProgressTimeline from '../components/AdoptionProgressTimeline';
import type { AdoptionApplication, AdoptionMilestone, Pet } from '../types';

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
  const [milestonesMap, setMilestonesMap] = useState<Record<string, AdoptionMilestone[]>>({});
  const [milestoneSubmittingId, setMilestoneSubmittingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | AdoptionApplication['status']>('all');

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

        const nextMilestonesMap: Record<string, AdoptionMilestone[]> = {};
        await Promise.all(
          withPets.map(async ({ application, pet }) => {
            if (application.status !== 'approved' || !pet?.userId) return;
            const milestones = await ensureAdoptionMilestones({
              applicationId: application.id,
              petId: application.petId,
              adopterId: user.id,
              ownerId: pet.userId,
            });
            nextMilestonesMap[application.id] = milestones;
          })
        );
        setMilestonesMap(nextMilestonesMap);
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

  const handleConfirmMilestone = async (
    applicationId: string,
    milestoneId: string,
    confirmed: boolean,
    note?: string
  ) => {
    if (!user) return;

    const target = items.find(({ application }) => application.id === applicationId);
    if (!target || target.application.status !== 'approved' || !target.pet?.userId) return;

    setMilestoneSubmittingId(applicationId);
    try {
      await confirmMilestone({
        milestoneId,
        actorUserId: user.id,
        confirmed,
        note,
      });

      const milestones = await ensureAdoptionMilestones({
        applicationId,
        petId: target.application.petId,
        adopterId: user.id,
        ownerId: target.pet.userId,
      });

      setMilestonesMap(prev => ({
        ...prev,
        [applicationId]: milestones,
      }));
    } catch {
      showToast('流程更新失败，请稍后重试');
    } finally {
      setMilestoneSubmittingId(null);
    }
  };

  // 根据选中的标签筛选申请列表
  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(({ application }) => application.status === activeTab);

  // 统计各状态的数量
  const statusCounts = {
    all: items.length,
    pending: items.filter(({ application }) => application.status === 'pending').length,
    approved: items.filter(({ application }) => application.status === 'approved').length,
    rejected: items.filter(({ application }) => application.status === 'rejected').length,
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

      {/* 状态筛选标签栏 */}
      <div className="bg-white dark:bg-zinc-800 px-4 py-3 border-b border-gray-100 dark:border-zinc-700 sticky top-[60px] z-40">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'all'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
            }`}
          >
            全部 {statusCounts.all > 0 && `(${statusCounts.all})`}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'pending'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 shadow-lg'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
            }`}
          >
            审核中 {statusCounts.pending > 0 && `(${statusCounts.pending})`}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'approved'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-lg'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
            }`}
          >
            已通过 {statusCounts.approved > 0 && `(${statusCounts.approved})`}
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'rejected'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-lg'
                : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
            }`}
          >
            未通过 {statusCounts.rejected > 0 && `(${statusCounts.rejected})`}
          </button>
        </div>
      </div>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="material-icons-round text-6xl text-gray-200 dark:text-zinc-700">assignment</span>
            <p className="text-gray-400 dark:text-zinc-500 text-sm">
              {activeTab === 'all' ? '暂无申请记录' : `暂无${STATUS_MAP[activeTab as AdoptionApplication['status']]?.label || ''}的申请`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-primary text-black rounded-full font-bold text-sm shadow-lg shadow-primary/20"
              >
                去发现宠物
              </button>
            )}
          </div>
        ) : (
          filteredItems.map(({ application, pet }) => {
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
                    {milestoneSubmittingId === application.id && (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-2">流程更新中...</p>
                    )}
                    <AdoptionProgressTimeline
                      application={application}
                      milestones={milestonesMap[application.id]}
                      currentUserId={user?.id}
                      onConfirmMilestone={(milestoneId, confirmed, note) =>
                        handleConfirmMilestone(application.id, milestoneId, confirmed, note)
                      }
                    />

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

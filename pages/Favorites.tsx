import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchFavoritePets, removeFavorite } from '../lib/api/favorites';
import type { Pet } from '../types';

const Favorites: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent'>('all');
  type ViewMode = 'grid' | 'list' | 'large';
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('petconnect_favorites_view_mode') as ViewMode) ?? 'list'
  );
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(false);

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('petconnect_favorites_view_mode', mode);
  };

  const loadFavoritePets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pets = await fetchFavoritePets(user.id);
      setFavoritePets(pets);
    } catch {
      showToast('加载收藏列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadFavoritePets();
  }, [loadFavoritePets]);

  const displayedPets = favoritePets.filter((pet) => {
    if (activeTab === 'urgent') return Boolean(pet.isUrgent);
    return true;
  });
  const urgentCount = favoritePets.filter((pet) => pet.isUrgent).length;
  const avgDistance = favoritePets.length > 0
    ? (() => {
        const total = favoritePets.reduce((acc, pet) => {
          const km = Number((pet.distance || '').replace(/[^\d.]/g, ''));
          return Number.isNaN(km) ? acc : acc + km;
        }, 0);
        return (total / favoritePets.length).toFixed(1);
      })()
    : '0.0';
  const speciesTop = favoritePets.reduce<Record<string, number>>((acc, pet) => {
    const key = (pet.breed || '其他').slice(0, 4);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const speciesTopList = Object.entries(speciesTop)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  const handleRemoveFavorite = async (petId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user || removingId) return;

    setRemovingId(petId);
    try {
      await removeFavorite(user.id, petId);
      setFavoritePets(prev => prev.filter(p => p.id !== petId));
      showToast('已取消收藏');
    } catch {
      showToast('操作失败，请重试');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in pb-24">
      <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">我的收藏</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">您关注的毛孩子都在这里</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { key: 'all' as const, label: `全部 ${favoritePets.length}` },
            { key: 'urgent' as const, label: `紧急 ${favoritePets.filter((pet) => pet.isUrgent).length}` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === item.key
                  ? 'bg-primary text-black'
                  : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end">
          <div className="flex bg-gray-100 dark:bg-zinc-700 rounded-lg p-0.5 gap-0.5">
            {([
              { id: 'grid' as ViewMode, icon: 'view_module' },
              { id: 'list' as ViewMode, icon: 'view_stream' },
              { id: 'large' as ViewMode, icon: 'view_carousel' },
            ]).map(({ id, icon }) => (
              <button
                key={id}
                onClick={() => handleViewMode(id)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all active:scale-[0.90] ${
                  viewMode === id ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''
                }`}
                aria-label={id}
              >
                <span className={`material-icons-round text-base ${
                  viewMode === id ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'
                }`}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 space-y-4">
        {!loading && favoritePets.length > 0 && (
          <section className="relative overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl border border-primary/20 dark:border-zinc-700 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <button
              onClick={() => setInsightsExpanded((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">收藏概览</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">点击展开数据看板</p>
              </div>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">{insightsExpanded ? 'expand_less' : 'expand_more'}</span>
            </button>
            {insightsExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-background-light dark:bg-zinc-900 p-3">
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">收藏总数</p>
                    <p className="text-lg font-extrabold text-text-main dark:text-zinc-100 mt-1">{favoritePets.length}</p>
                  </div>
                  <div className="rounded-xl bg-background-light dark:bg-zinc-900 p-3">
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">紧急关注</p>
                    <p className="text-lg font-extrabold text-primary mt-1">{urgentCount}</p>
                  </div>
                  <div className="rounded-xl bg-background-light dark:bg-zinc-900 p-3">
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">平均距离</p>
                    <p className="text-lg font-extrabold text-text-main dark:text-zinc-100 mt-1">{avgDistance}km</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {speciesTopList.map(([name, count]) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary"
                    >
                      {name} × {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {!loading && favoritePets.length > 0 && (
          <section className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-zinc-400">收藏动态建议</p>
                <p className="text-sm font-semibold text-text-main dark:text-zinc-100">本周推荐你优先关注紧急宠物</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-primary underline"
              >
                去发现
              </button>
            </div>
          </section>
        )}

        {!loading && favoritePets.length > 0 && (
          <section className="relative overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl border border-primary/20 dark:border-zinc-700 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <button
              onClick={() => setTasksExpanded((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">本周收藏任务</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">点击展开成长计划</p>
              </div>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">{tasksExpanded ? 'expand_less' : 'expand_more'}</span>
            </button>
            {tasksExpanded && (
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <div className="rounded-xl bg-background-light dark:bg-zinc-900 px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-primary text-base">priority_high</span>
                      <span className="text-xs font-medium text-text-main dark:text-zinc-100">今日优先查看紧急收藏</span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400">{urgentCount > 0 ? `待处理 ${urgentCount}` : '已完成'}</span>
                  </div>
                  <div className="rounded-xl bg-background-light dark:bg-zinc-900 px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-primary text-base">forum</span>
                      <span className="text-xs font-medium text-text-main dark:text-zinc-100">与 1 位寄养家庭发起沟通</span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400">建议进行</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {loading ? (
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-3 flex gap-4 h-28 animate-pulse">
                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-zinc-700 shrink-0" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-gray-100 dark:bg-zinc-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedPets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="columns-2 gap-4 space-y-4 fade-in">
              {displayedPets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="break-inside-avoid bg-white dark:bg-zinc-800 rounded-2xl p-2.5 pb-4 shadow-sm border border-gray-100 dark:border-zinc-700 cursor-pointer"
                  role="listitem"
                >
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img src={pet.imageUrl} alt={pet.name} className="w-full object-cover" style={{ aspectRatio: '1/1.2' }} />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="material-icons-round text-primary text-[10px]">near_me</span>
                      <span className="text-[10px] text-white font-semibold">{pet.distance}</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100 leading-tight">{pet.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{pet.breed}</p>
                      </div>
                      <button
                        onClick={e => handleRemoveFavorite(pet.id, e)}
                        disabled={removingId === pet.id}
                        className="text-red-500 material-icons-round p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        aria-label={`取消收藏 ${pet.name}`}
                      >
                        favorite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            displayedPets.map(pet => (
            <div
              key={pet.id}
              onClick={() => navigate(`/pet/${pet.id}`)}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 dark:border-zinc-700 cursor-pointer active:scale-[0.98] transition-transform"
              role="listitem"
              aria-label={`收藏的宠物：${pet.name}，品种：${pet.breed}`}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100">{pet.name}</h3>
                    <button
                      onClick={e => handleRemoveFavorite(pet.id, e)}
                      disabled={removingId === pet.id}
                      className="text-red-500 material-icons-round p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                      aria-label={`取消收藏 ${pet.name}`}
                    >
                      favorite
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{pet.breed}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
                  <span className="material-icons-round text-sm">location_on</span>
                  <span>{pet.distance}</span>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="space-y-4 fade-in">
              {displayedPets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-all"
                  role="listitem"
                >
                  <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-icons-round text-primary text-[10px]">near_me</span>
                    <span className="text-[10px] text-white font-semibold">{pet.distance}</span>
                  </div>
                  <button
                    onClick={e => handleRemoveFavorite(pet.id, e)}
                    disabled={removingId === pet.id}
                    className="absolute top-3 left-3 text-red-500 material-icons-round p-1.5 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-40"
                    aria-label={`取消收藏 ${pet.name}`}
                  >
                    favorite
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold leading-tight">{pet.name}</h3>
                    <p className="text-sm text-gray-300 mt-0.5">{pet.breed}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
            <span className="material-icons-round text-6xl mb-4 text-gray-200 dark:text-zinc-600">favorite_border</span>
            <p>{favoritePets.length > 0 ? '当前筛选下暂无收藏结果' : '还没有收藏任何宠物哦'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-full text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            >
              去发现
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Favorites;

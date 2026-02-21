import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { ColorSchemeOnboarding } from '../components/ColorSchemeOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { addFavorite, removeFavorite, checkIsFavorited } from '../lib/api/favorites';
import { fetchPetList, fetchRecommendedPets, type FetchPetListParams } from '../lib/api/pets';
import { fetchRescueTasks } from '../lib/api/rescueTasks';
import LocationPicker, { formatLocationDisplay, type LocationOption } from '../components/LocationPicker';
import { DEFAULT_LOCATION } from '../lib/data/regions';
import { GROWTH_PLAY_CARDS, type GrowthPlayCard } from '../lib/config/growthPlayCenter';
import type { Pet } from '../types';

type CategoryId = 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other';

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '🐾' },
  { id: 'dog', label: '狗狗', icon: '🐶' },
  { id: 'cat', label: '猫猫', icon: '🐱' },
  { id: 'rabbit', label: '兔子', icon: '🐰' },
  { id: 'bird', label: '鸟类', icon: '🦜' },
  { id: 'hamster', label: '仓鼠', icon: '🐹' },
  { id: 'turtle', label: '乌龟', icon: '🐢' },
  { id: 'fish', label: '鱼类', icon: '🐟' },
  { id: 'other', label: '其他', icon: '🐾' },
];

const ASPECT_RATIOS: Record<string, string> = {
  snowball: '1/1.2',
  loki: '1.5/1',
};

const PET_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='62' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E`;

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = PET_PLACEHOLDER;
};

const CAROUSEL_INTERVAL = 4000;
const RESCUE_LAST_SEEN_KEY = 'petconnect_rescue_last_seen';

const getPlayCardStatus = (item: GrowthPlayCard, now: Date): 'upcoming' | 'live' | 'ending' | 'ended' => {
  const start = new Date(item.startAt).getTime();
  const end = new Date(item.endAt).getTime();
  const current = now.getTime();
  if (current < start) return 'upcoming';
  if (current > end) return 'ended';
  const remaining = end - current;
  if (remaining <= 24 * 60 * 60 * 1000) return 'ending';
  return 'live';
};

const getStatusLabel = (status: 'upcoming' | 'live' | 'ending' | 'ended'): string => {
  if (status === 'upcoming') return '即将开始';
  if (status === 'ending') return '即将截止';
  if (status === 'ended') return '已结束';
  return '进行中';
};

const formatCountdown = (target: string, now: Date): string => {
  const diff = new Date(target).getTime() - now.getTime();
  if (diff <= 0) return '已结束';
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const days = Math.floor(diff / dayMs);
  const hours = Math.floor((diff % dayMs) / hourMs);
  const minutes = Math.floor((diff % hourMs) / minuteMs);
  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${Math.max(1, minutes)}分钟`;
};

const getFosterSummary = (pet: Pet): string => {
  const source = (pet.description || pet.story || '').replace(/\s+/g, ' ').trim();
  const clipped = source.length > 22 ? `${source.slice(0, 22)}...` : source;
  const prefix = pet.fosterParent?.name ? `${pet.fosterParent.name}：` : '寄养家庭：';
  return source ? `${prefix}${clipped}` : `${prefix}性格稳定，适合陪伴家庭。`;
};

const Home: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { resolvedTheme, setTheme, hasColorSchemeSet } = useTheme();
  const [showColorSchemeOnboarding, setShowColorSchemeOnboarding] = useState(false);
  const colorSchemeOnboardingShown = useRef(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [pets, setPets] = useState<Pet[]>([]);
  const [recommendedPets, setRecommendedPets] = useState<Pet[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(DEFAULT_LOCATION);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId>('all');
  // 已应用的服务端筛选状态
  const [appliedGender, setAppliedGender] = useState<'all' | 'male' | 'female'>('all');
  const [appliedUrgent, setAppliedUrgent] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [carouselFavoritedIds, setCarouselFavoritedIds] = useState<Set<string>>(new Set());
  const [carouselFavoriteLoading, setCarouselFavoriteLoading] = useState(false);
  const [hasNewRescueTask, setHasNewRescueTask] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [playCenterNow, setPlayCenterNow] = useState(() => new Date());
  const [playCenterExpanded, setPlayCenterExpanded] = useState(false);
  const [playStatusFilter, setPlayStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  type ViewMode = 'grid' | 'list' | 'large';
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('petconnect_view_mode') as ViewMode) ?? 'list'
  );
  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('petconnect_view_mode', mode);
  };
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const newArrivalsRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const playCenterCards = GROWTH_PLAY_CARDS.map((item) => {
    const status = getPlayCardStatus(item, playCenterNow);
    return { item, status };
  });

  const filteredPlayCenterCards = playCenterCards.filter(({ status }) => {
    if (playStatusFilter === 'all') return true;
    if (playStatusFilter === 'live') return status === 'live' || status === 'ending';
    return status === playStatusFilter;
  });

  const livePlayCount = playCenterCards.filter(({ status }) => status === 'live' || status === 'ending').length;

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  // 首次登录显示配色选择漫游
  useEffect(() => {
    if (user && !colorSchemeOnboardingShown.current && !hasColorSchemeSet) {
      const timer = setTimeout(() => {
        setShowColorSchemeOnboarding(true);
        colorSchemeOnboardingShown.current = true;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, hasColorSchemeSet]);

  const startAutoPlay = useCallback((total: number) => {
    stopAutoPlay();
    if (total <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % total);
    }, CAROUSEL_INTERVAL);
  }, []);

  useEffect(() => {
    fetchRecommendedPets(4).then(async data => {
      setRecommendedPets(data);
      setCarouselLoading(false);
      if (data.length > 1) startAutoPlay(data.length);
      if (user && data.length > 0) {
        const ids = await Promise.all(data.map(p => checkIsFavorited(user.id, p.id)));
        setCarouselFavoritedIds(new Set(data.filter((_, i) => ids[i]).map(p => p.id)));
      }
    }).catch(() => setCarouselLoading(false));

    return () => stopAutoPlay();
  }, [startAutoPlay, user]);

  useEffect(() => {
    if (!user) {
      setHasNewRescueTask(false);
      return;
    }

    const checkNewRescue = async () => {
      try {
        const tasks = await fetchRescueTasks(undefined, user.id);
        const hasPendingOnMyTasks = tasks.some(
          task => task.creatorId === user.id && task.pendingApplicants.length > 0
        );

        if (hasPendingOnMyTasks) {
          setHasNewRescueTask(true);
          return;
        }

        const latestFromOthers = tasks
          .filter(task => task.creatorId !== user.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (!latestFromOthers) {
          setHasNewRescueTask(false);
          return;
        }

        const lastSeen = localStorage.getItem(RESCUE_LAST_SEEN_KEY);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        const latestTime = new Date(latestFromOthers.createdAt).getTime();
        setHasNewRescueTask(latestTime > lastSeenTime);
      } catch {
        setHasNewRescueTask(false);
      }
    };

    void checkNewRescue();
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlayCenterNow(new Date());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  // 滚动监听：收缩 header（带滞后区间防止抖动）
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // 更大的滞后区间：向下滚动超过80px才收缩，向上滚动回到10px以下才展开
          if (!isHeaderCompact && scrollY > 80) {
            setIsHeaderCompact(true);
          } else if (isHeaderCompact && scrollY < 10) {
            setIsHeaderCompact(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeaderCompact]);

  // 关键词 500ms 防抖
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(searchKeyword), 500);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  // 服务端筛选：当分类 / 已应用筛选 / 防抖关键词任意变化时重新拉取
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: FetchPetListParams = {
          category: activeCategory,
          gender: appliedGender !== 'all' ? appliedGender : undefined,
          isUrgent: appliedUrgent || undefined,
          keyword: debouncedKeyword || undefined,
        };
        const petList = await fetchPetList(params);
        if (cancelled) return;
        const recommendedIds = new Set(recommendedPets.map(p => p.id));
        setPets(petList.filter(p => !recommendedIds.has(p.id)));
      } catch {
        if (!cancelled) showToast('加载宠物列表失败，请重试');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, appliedGender, appliedUrgent, debouncedKeyword, showToast]);

  const handleCarouselPrev = () => {
    stopAutoPlay();
    setCarouselIndex(prev => (prev - 1 + recommendedPets.length) % recommendedPets.length);
    startAutoPlay(recommendedPets.length);
  };

  const handleCarouselNext = () => {
    stopAutoPlay();
    setCarouselIndex(prev => (prev + 1) % recommendedPets.length);
    startAutoPlay(recommendedPets.length);
  };

  const handleLocationSelect = (loc: LocationOption) => {
    setSelectedLocation(loc);
    setShowLocationSheet(false);
  };

  const handleApplyFilter = () => {
    setActiveCategory(filterCategory);
    setAppliedGender(filterGender);
    setAppliedUrgent(filterUrgent);
    setShowFilterSheet(false);
  };

  const handleResetFilter = () => {
    setFilterCategory('all');
    setActiveCategory('all');
    setFilterGender('all');
    setFilterUrgent(false);
    setAppliedGender('all');
    setAppliedUrgent(false);
  };

  const handleCarouselFavoriteToggle = async (e: React.MouseEvent, pet: Pet) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (carouselFavoriteLoading) return;

    setCarouselFavoriteLoading(true);
    try {
      const isFavorited = carouselFavoritedIds.has(pet.id);
      if (isFavorited) {
        await removeFavorite(user.id, pet.id);
        setCarouselFavoritedIds(prev => {
          const next = new Set(prev);
          next.delete(pet.id);
          return next;
        });
        showToast('已取消收藏');
      } else {
        await addFavorite(user.id, pet.id);
        setCarouselFavoritedIds(prev => new Set(prev).add(pet.id));
        showToast('已收藏');
      }
    } catch {
      showToast('操作失败，请重试');
    } finally {
      setCarouselFavoriteLoading(false);
    }
  };

  const currentPet = recommendedPets[carouselIndex] ?? null;

  return (
    <>
    <div className="pb-24 fade-in">
      <header className={`px-6 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm ${
        isHeaderCompact ? 'pt-2 pb-1.5' : 'pt-8 pb-3'
      }`} style={{ transition: 'padding 0.4s ease-out' }}>
        <div className={`flex justify-between items-center ${
          isHeaderCompact ? 'mb-1.5' : 'mb-5'
        }`} style={{ transition: 'margin 0.4s ease-out' }}>
          <div className="flex flex-col overflow-hidden">
            <span className={`text-xs font-medium text-gray-500 dark:text-zinc-400 ${
              isHeaderCompact ? 'opacity-0 h-0 mb-0' : 'opacity-100 mb-1'
            }`} style={{ transition: 'opacity 0.3s ease-out, height 0.3s ease-out, margin 0.3s ease-out' }}>当前位置</span>
            <button
              onClick={() => setShowLocationSheet(true)}
              className="flex items-center gap-1 group active:scale-[0.97] transition-transform"
              aria-label="选择城市"
            >
              <span className={`material-icons-round text-primary ${
                isHeaderCompact ? 'text-sm' : 'text-xl'
              }`} style={{ transition: 'font-size 0.4s ease-out' }}>location_on</span>
              <span className={`font-bold text-text-main dark:text-zinc-100 group-hover:text-primary ${
                isHeaderCompact ? 'text-xs' : 'text-lg'
              }`} style={{ transition: 'font-size 0.4s ease-out, color 0.2s' }}>
                {formatLocationDisplay(selectedLocation)}
              </span>
              <span className={`material-icons-round text-gray-400 dark:text-zinc-500 ${
                isHeaderCompact ? 'text-[10px]' : 'text-sm'
              }`} style={{ transition: 'font-size 0.4s ease-out' }}>expand_more</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className={`rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-transform shadow-sm ${
                isHeaderCompact ? 'w-7 h-7' : 'w-10 h-10'
              }`}
              style={{ transition: 'width 0.4s ease-out, height 0.4s ease-out' }}
              aria-label={resolvedTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
            >
              <span className={`material-icons-round text-gray-400 dark:text-zinc-500 ${
                isHeaderCompact ? 'text-sm' : 'text-xl'
              }`} style={{ transition: 'font-size 0.4s ease-out' }}>
                {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className={`rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center relative hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-transform shadow-sm ${
                isHeaderCompact ? 'w-7 h-7' : 'w-10 h-10'
              }`}
              style={{ transition: 'width 0.4s ease-out, height 0.4s ease-out' }}
            >
              <span className={`material-icons-round text-gray-400 dark:text-zinc-500 ${
                isHeaderCompact ? 'text-sm' : 'text-xl'
              }`} style={{ transition: 'font-size 0.4s ease-out' }}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            className={`w-full pl-10 pr-10 rounded-2xl bg-white dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 text-sm font-medium placeholder-gray-400 dark:placeholder-zinc-500 shadow-sm text-gray-900 dark:text-zinc-100 ${
              isHeaderCompact ? 'h-8' : 'h-12'
            }`}
            style={{ transition: 'height 0.4s ease-out' }}
            placeholder="搜索宠物、品种..."
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            aria-label="搜索宠物"
          />
          <span className={`material-icons-round absolute text-gray-400 dark:text-zinc-500 ${
            isHeaderCompact ? 'left-3 top-1 text-base' : 'left-4 top-3 text-xl'
          }`} style={{ transition: 'left 0.4s ease-out, top 0.4s ease-out, font-size 0.4s ease-out' }}>search</span>
          {/* 筛选按钮已移至“新到伙伴”标题旁 */}
        </div>
      </header>

      <main className="px-6 space-y-5">
        {/* 快捷入口：美团风小圆球 */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 px-3 py-4">
          <div className="grid grid-cols-5 gap-y-4">
            <button
              onClick={() => navigate('/lost-alerts')}
              aria-label="失踪宠物 应急广播"
              className="flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <span className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 flex items-center justify-center text-xl">🔍</span>
              <span className="text-[11px] font-semibold text-text-main dark:text-zinc-100">失踪宠物</span>
            </button>

            <button
              onClick={() => {
                if (!user) { navigate(`/login?redirect=${encodeURIComponent('/rescue-board')}`); return; }
                localStorage.setItem(RESCUE_LAST_SEEN_KEY, new Date().toISOString());
                setHasNewRescueTask(false);
                navigate('/rescue-board');
              }}
              aria-label="救助协作 任务板"
              className="flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <span className="relative w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <span className="material-icons-round text-xl">volunteer_activism</span>
                {hasNewRescueTask && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-900" />
                )}
              </span>
              <span className="text-[11px] font-semibold text-text-main dark:text-zinc-100">救助协作</span>
            </button>

            <button
              onClick={() => { if (!user) { navigate(`/login?redirect=${encodeURIComponent('/points')}`); return; } navigate('/points'); }}
              aria-label="积分商店"
              className="flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <span className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 flex items-center justify-center">
                <span className="material-icons-round text-xl">stars</span>
              </span>
              <span className="text-[11px] font-semibold text-text-main dark:text-zinc-100">积分商店</span>
            </button>

            <button
              onClick={() => navigate('/experts')}
              aria-label="宠物达人"
              className="flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <span className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <span className="material-icons-round text-xl">verified_user</span>
              </span>
              <span className="text-[11px] font-semibold text-text-main dark:text-zinc-100">宠物达人</span>
            </button>

            <button
              onClick={() => navigate('/stores')}
              aria-label="线下门店"
              className="flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <span className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                <span className="material-icons-round text-xl">storefront</span>
              </span>
              <span className="text-[11px] font-semibold text-text-main dark:text-zinc-100">线下门店</span>
            </button>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-primary/20 dark:border-zinc-700 p-4">
          <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <button
            onClick={() => setPlayCenterExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-sm font-bold text-text-main dark:text-zinc-100">成长玩法中心</h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">{playCenterCards.length} 个活动，进行中 {livePlayCount} 个</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] text-primary font-semibold bg-primary/15">第二批</span>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">{playCenterExpanded ? 'expand_less' : 'expand_more'}</span>
            </div>
          </button>

          {playCenterExpanded && (
            <>
              <div className="flex items-center justify-between gap-2 mt-3 mb-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {[
                    { key: 'all' as const, label: '全部' },
                    { key: 'live' as const, label: '进行中' },
                    { key: 'upcoming' as const, label: '即将开始' },
                    { key: 'ended' as const, label: '已结束' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setPlayStatusFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        playStatusFilter === filter.key
                          ? 'bg-primary text-black'
                          : 'bg-background-light dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const first = filteredPlayCenterCards[0]?.item;
                    if (first) navigate(`${first.route}?from=play-center&anchor=activity-zone`);
                  }}
                  className="shrink-0 text-[11px] font-semibold text-primary"
                >
                  去活动页
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredPlayCenterCards.map(({ item, status }) => {
                  const countdownText = status === 'upcoming'
                    ? `倒计时 ${formatCountdown(item.startAt, playCenterNow)}`
                    : status === 'ended'
                      ? '活动已结束'
                      : `剩余 ${formatCountdown(item.endAt, playCenterNow)}`;

                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(`${item.route}?from=play-center&anchor=activity-zone`)}
                      className="rounded-xl border border-gray-100 dark:border-zinc-700 bg-background-light dark:bg-zinc-900 p-3 text-left active:scale-[0.97] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                          <span className="material-icons-round text-base">{item.icon}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">{item.badge}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            status === 'live'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : status === 'upcoming'
                                ? 'bg-amber-500/15 text-amber-500'
                                : status === 'ending'
                                  ? 'bg-orange-500/15 text-orange-500'
                                  : 'bg-zinc-500/15 text-zinc-500'
                          }`}>{getStatusLabel(status)}</span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-text-main dark:text-zinc-100">{item.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                      <p className="text-[10px] font-medium text-primary mt-2">{countdownText}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* 推荐伙伴轮播 */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-text-main dark:text-zinc-100">推荐伙伴</h2>
            <button
              onClick={() => {
                setActiveCategory('all');
                setTimeout(() => newArrivalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
              className="text-xs font-semibold text-primary hover:underline active:opacity-70 transition-opacity"
            >
              查看全部
            </button>
          </div>

          {carouselLoading ? (
            <div className="w-full h-52 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          ) : recommendedPets.length === 0 ? (
            <div className="w-full h-52 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-zinc-500">暂无推荐宠物</p>
            </div>
          ) : (
            <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-xl group">
              {/* 轮播图片 */}
              {recommendedPets.map((pet, index) => (
                <div
                  key={pet.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  onClick={() => index === carouselIndex && navigate(`/pet/${pet.id}`)}
                >
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover bg-gray-100 dark:bg-zinc-800"
                    onError={handleImgError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-12 text-white">
                    {pet.isUrgent && (
                      <span className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block">
                        紧急
                      </span>
                    )}
                    <h3 className="text-xl font-bold mb-0.5">{pet.name}</h3>
                    <p className="text-sm text-gray-300">{pet.breed}</p>
                  </div>
                  <button
                    onClick={e => handleCarouselFavoriteToggle(e, pet)}
                    disabled={carouselFavoriteLoading}
                    className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full transition-colors active:scale-[0.9] z-20 disabled:opacity-50"
                    aria-label={carouselFavoritedIds.has(pet.id) ? '取消收藏' : '收藏'}
                  >
                    <span className={`material-icons-round text-xl ${carouselFavoritedIds.has(pet.id) ? 'text-red-500' : 'text-white'}`}>
                      {carouselFavoritedIds.has(pet.id) ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>
              ))}

              {/* 左右箭头 */}
              {recommendedPets.length > 1 && (
                <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 z-20 flex items-center justify-between px-3 pointer-events-none">
                  <button
                    onClick={e => { e.stopPropagation(); handleCarouselPrev(); }}
                    className="w-9 h-9 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-[0.9] pointer-events-auto"
                    aria-label="上一张"
                  >
                    <span className="material-icons-round text-white text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleCarouselNext(); }}
                    className="w-9 h-9 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-[0.9] pointer-events-auto"
                    aria-label="下一张"
                  >
                    <span className="material-icons-round text-white text-lg">chevron_right</span>
                  </button>
                </div>
              )}

              {/* 圆点指示器 */}
              {recommendedPets.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {recommendedPets.map((_, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); stopAutoPlay(); setCarouselIndex(i); startAutoPlay(recommendedPets.length); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === carouselIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                      }`}
                      aria-label={`第${i + 1}张`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 新到伙伴 */}
        <section ref={newArrivalsRef}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-main dark:text-zinc-100">新到伙伴</h2>
            <div className="flex items-center gap-2">
                {(activeCategory !== 'all' || appliedGender !== 'all' || appliedUrgent || debouncedKeyword.trim()) && (
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                    已筛选
                  </span>
                )}
                {/* 筛选按钮（移动到此处，靠近“新到伙伴”标题） */}
                <button
                  onClick={() => setShowFilterSheet(true)}
                  className="bg-primary rounded-xl shadow-lg shadow-primary/30 active:scale-[0.95] p-1.5 flex items-center justify-center"
                  aria-label="筛选"
                >
                  <span className="material-icons-round text-white text-sm">tune</span>
                </button>
                {/* 视图切换按钮 */}
                <div className="flex bg-gray-100 dark:bg-zinc-700 rounded-lg p-0.5 gap-0.5">
                {([
                  { id: 'grid' as ViewMode, icon: 'view_module' },
                  { id: 'list' as ViewMode, icon: 'view_stream' },
                  { id: 'large' as ViewMode, icon: 'view_carousel' },
                ]).map(({ id, icon }) => (
                  <button
                    key={id}
                    onClick={() => handleViewMode(id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-all active:scale-[0.90] ${
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
          </div>

          {loading ? (
            /* 骨架屏 */
            viewMode === 'grid' ? (
              <div className="columns-2 gap-4 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="break-inside-avoid bg-gray-100 dark:bg-zinc-800 rounded-2xl h-52 animate-pulse" />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 bg-white dark:bg-zinc-800 rounded-2xl p-3 shadow-sm border border-gray-50 dark:border-zinc-700 animate-pulse">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-zinc-700 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-100 dark:bg-zinc-700 rounded w-24" />
                      <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="w-full h-64 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            )
          ) : pets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
              <span className="material-icons text-5xl mb-2">search_off</span>
              <p className="text-sm">{debouncedKeyword.trim() ? `未找到与「${debouncedKeyword.trim()}」匹配的宠物` : '暂无该分类的宠物'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* 网格视图 */
            <div key="grid" className="columns-2 gap-4 space-y-4 fade-in">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="break-inside-avoid bg-white dark:bg-zinc-800 rounded-2xl p-2.5 pb-4 shadow-sm card-interactive group cursor-pointer border border-gray-50 dark:border-zinc-700"
                >
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      loading="lazy"
                      className="w-full object-cover bg-gray-100 dark:bg-zinc-800"
                      style={{ aspectRatio: ASPECT_RATIOS[pet.id] ?? '1/1.3' }}
                      onError={handleImgError}
                    />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="material-icons-round text-primary text-[10px]">near_me</span>
                      <span className="text-[10px] text-white font-semibold">{pet.distance}</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-text-main dark:text-zinc-100 leading-tight">{pet.name}</h3>
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{getFosterSummary(pet)}</p>
                      </div>
                      <span className={`material-icons-round text-lg ${pet.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                        {pet.gender}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            /* 列表视图 */
            <div key="list" className="space-y-3 fade-in">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="flex gap-3 bg-white dark:bg-zinc-800 rounded-2xl p-3 shadow-sm border border-gray-50 dark:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      loading="lazy"
                      className="w-full h-full object-cover bg-gray-100 dark:bg-zinc-800"
                      onError={handleImgError}
                    />
                    {pet.isUrgent && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-primary text-black px-1.5 py-0.5 rounded-full leading-tight">
                        紧急
                      </span>
                    )}
                  </div>
                  <div className="flex-1 py-0.5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-base text-text-main dark:text-zinc-100 leading-tight truncate">{pet.name}</h3>
                        <span className={`material-icons-round text-base shrink-0 ${pet.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                          {pet.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{getFosterSummary(pet)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-icons-round text-primary" style={{ fontSize: 11 }}>near_me</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{pet.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 大图视图 */
            <div key="large" className="space-y-4 fade-in">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-all"
                >
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    loading="lazy"
                    className="w-full h-full object-cover bg-gray-100 dark:bg-zinc-800"
                    onError={handleImgError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {pet.isUrgent && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-primary text-black px-2 py-0.5 rounded-full">
                      紧急
                    </span>
                  )}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-icons-round text-primary text-[10px]">near_me</span>
                    <span className="text-[10px] text-white font-semibold">{pet.distance}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-xl font-bold leading-tight">{pet.name}</h3>
                        <p className="text-xs text-gray-200 mt-1 line-clamp-2 leading-relaxed">{getFosterSummary(pet)}</p>
                      </div>
                      <span className={`material-icons-round text-xl ${pet.gender === 'female' ? 'text-pink-300' : 'text-blue-300'}`}>
                        {pet.gender}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />

      {/* 城市选择底部弹窗 */}
      <LocationPicker
        open={showLocationSheet}
        onClose={() => { setShowLocationSheet(false); }}
        value={selectedLocation}
        onChange={handleLocationSelect}
      />

      {/* 筛选底部弹窗 */}
      {showFilterSheet && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowFilterSheet(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">筛选</h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors active:scale-[0.9]"
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400 text-xl">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">动物类型</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
                      filterCategory === cat.id
                        ? 'bg-primary text-black'
                        : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">性别</p>
              <div className="flex gap-3">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'male', label: '雄性 ♂' },
                  { value: 'female', label: '雌性 ♀' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterGender(opt.value as typeof filterGender)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
                      filterGender === opt.value
                        ? 'bg-primary text-black'
                        : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-zinc-700">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">仅显示紧急领养</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">优先展示需要紧急安置的宠物</p>
              </div>
              <button
                role="switch"
                aria-checked={filterUrgent}
                onClick={() => setFilterUrgent(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden ${
                  filterUrgent ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    filterUrgent ? 'translate-x-[26px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleResetFilter}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all"
              >
                重置
              </button>
              <button
                onClick={handleApplyFilter}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold shadow-md shadow-primary/30 hover:opacity-90 active:scale-[0.97] transition-all"
              >
                应用筛选
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <ColorSchemeOnboarding
      isOpen={showColorSchemeOnboarding}
      onClose={() => setShowColorSchemeOnboarding(false)}
    />
  </>
  );
};

export default Home;

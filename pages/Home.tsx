import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { addFavorite, removeFavorite, checkIsFavorited } from '../lib/api/favorites';
import { fetchPetList, fetchRecommendedPets, type FetchPetListParams } from '../lib/api/pets';
import LocationPicker, { formatLocationDisplay, type LocationOption } from '../components/LocationPicker';
import { DEFAULT_LOCATION } from '../lib/data/regions';
import type { Pet } from '../types';

type CategoryId = 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '🐾' },
  { id: 'dog', label: '狗狗', icon: '🐶' },
  { id: 'cat', label: '猫猫', icon: '🐱' },
  { id: 'rabbit', label: '兔子', icon: '🐰' },
  { id: 'bird', label: '鸟类', icon: '🦜' },
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

const Home: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
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
  // 已应用的服务端筛选状态
  const [appliedGender, setAppliedGender] = useState<'all' | 'male' | 'female'>('all');
  const [appliedUrgent, setAppliedUrgent] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [carouselFavoritedIds, setCarouselFavoritedIds] = useState<Set<string>>(new Set());
  const [carouselFavoriteLoading, setCarouselFavoriteLoading] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const newArrivalsRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

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
    setAppliedGender(filterGender);
    setAppliedUrgent(filterUrgent);
    setShowFilterSheet(false);
  };

  const handleResetFilter = () => {
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
    <div className="pb-24 fade-in">
      <header className="px-6 pt-8 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">当前位置</span>
            <button
              onClick={() => setShowLocationSheet(true)}
              className="flex items-center gap-1 group active:scale-[0.97] transition-transform"
              aria-label="选择城市"
            >
              <span className="material-icons-round text-primary text-xl">location_on</span>
              <span className="font-bold text-lg text-text-main dark:text-zinc-100 group-hover:text-primary transition-colors">
                {formatLocationDisplay(selectedLocation)}
              </span>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-sm">expand_more</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all shadow-sm"
              aria-label={resolvedTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
            >
              <span className="material-icons-round text-gray-400 dark:text-zinc-500">
                {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center relative hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all shadow-sm"
            >
              <span className="material-icons-round text-gray-400 dark:text-zinc-500">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 text-sm font-medium placeholder-gray-400 dark:placeholder-zinc-500 shadow-sm text-gray-900 dark:text-zinc-100"
            placeholder="搜索宠物、品种..."
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            aria-label="搜索宠物"
          />
          <span className="material-icons-round absolute left-4 top-3 text-gray-400 dark:text-zinc-500">search</span>
          <button
            onClick={() => setShowFilterSheet(true)}
            className="absolute right-3 top-2 bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.95] transition-transform"
            aria-label="筛选"
          >
            <span className="material-icons-round text-white text-sm">tune</span>
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* 分类筛选 */}
        <section className="overflow-x-auto scrollbar-hide -mx-6 px-6 py-2">
          <div className="flex space-x-3 w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-sm transition-all active:scale-[0.96] whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-primary text-black shadow-primary/20'
                    : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
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
                <>
                  <button
                    onClick={e => { e.stopPropagation(); handleCarouselPrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-[0.9]"
                    aria-label="上一张"
                  >
                    <span className="material-icons-round text-white text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleCarouselNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-[0.9]"
                    aria-label="下一张"
                  >
                    <span className="material-icons-round text-white text-lg">chevron_right</span>
                  </button>
                </>
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

        {/* 新到伙伴网格 */}
        <section ref={newArrivalsRef}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-main dark:text-zinc-100">新到伙伴</h2>
            {(appliedGender !== 'all' || appliedUrgent || debouncedKeyword.trim()) && (
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                已筛选
              </span>
            )}
          </div>
          {loading ? (
            <div className="columns-2 gap-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="break-inside-avoid bg-gray-100 dark:bg-zinc-800 rounded-2xl h-52 animate-pulse" />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
              <span className="material-icons text-5xl mb-2">search_off</span>
              <p className="text-sm">{debouncedKeyword.trim() ? `未找到与「${debouncedKeyword.trim()}」匹配的宠物` : '暂无该分类的宠物'}</p>
            </div>
          ) : (
            <div className="columns-2 gap-4 space-y-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pet/${pet.id}`)}
                  className="break-inside-avoid bg-white dark:bg-zinc-800 rounded-2xl p-2.5 pb-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-300 group cursor-pointer border border-gray-50 dark:border-zinc-700"
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
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{pet.breed}</p>
                      </div>
                      <span className={`material-icons-round text-lg ${pet.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
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
  );
};

export default Home;

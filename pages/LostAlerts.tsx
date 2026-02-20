import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../contexts/ToastContext';
import { fetchLostAlerts, haversineKm } from '../lib/api/lostAlerts';
import { cacheLostAlerts, getCachedLostAlerts } from '../lib/offline/cache';
import type { LostPetAlert } from '../types';

const PET_TYPE_LABELS: Record<string, string> = {
  dog: '狗狗',
  cat: '猫猫',
  rabbit: '兔子',
  bird: '鸟类',
  hamster: '仓鼠',
  turtle: '乌龟',
  fish: '鱼类',
  other: '其他',
};

const RADIUS_OPTIONS = [
  { value: 3, label: '3 km' },
  { value: 10, label: '10 km' },
  { value: 30, label: '30 km' },
  { value: 0, label: '不限' },
];

const formatLostTime = (isoStr: string): string => {
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '不到1小时前走失';
  if (h < 24) return `${h}小时前走失`;
  const d = Math.floor(h / 24);
  return `${d}天前走失`;
};

const LostAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState<LostPetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
      },
      () => {
        setLocationDenied(true);
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        userLat != null && userLon != null && radiusKm > 0
          ? { userLat, userLon, radiusKm }
          : undefined;
      const data = await fetchLostAlerts(params);
      setAlerts(data);
      setUsingCache(false);
      cacheLostAlerts(data);
    } catch {
      // 网络失败时尝试读取离线缓存
      const cached = getCachedLostAlerts();
      if (cached && cached.length > 0) {
        setAlerts(cached);
        setUsingCache(true);
        showToast('网络不可用，显示缓存数据');
      } else {
        showToast('加载失踪警报失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  }, [userLat, userLon, radiusKm, showToast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const getDistanceText = (alert: LostPetAlert): string | null => {
    if (userLat == null || userLon == null) return null;
    if (alert.latitude == null || alert.longitude == null) return null;
    const km = haversineKm(userLat, userLon, alert.latitude, alert.longitude);
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  return (
    <div className="pb-24 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/', { replace: true }); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-text-main dark:text-zinc-100 flex-1">失踪宠物广播</h1>
          <button
            onClick={() => navigate('/lost-alerts/publish')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary active:scale-[0.97] transition-all shadow-md shadow-primary/30"
            aria-label="发布失踪警报"
          >
            <span className="material-icons-round text-black text-xl">add</span>
          </button>
        </div>

        {/* 离线缓存提示 */}
        {usingCache && (
          <div className="flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 text-xs">
            <span className="material-icons-round text-sm">history</span>
            <span>当前显示最近缓存的数据，恢复网络后将自动更新</span>
          </div>
        )}

        {/* 半径筛选 */}
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">radar</span>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {RADIUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRadiusKm(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.96] ${
                  radiusKm === opt.value
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {locationDenied && (
            <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">（定位未授权）</span>
          )}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {locationDenied && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-icons-round text-amber-500 text-xl mt-0.5">warning_amber</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">定位权限未开启</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                已显示所有活跃警报。开启定位后可按半径筛选。
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 dark:bg-zinc-800 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-zinc-500">
            <span className="material-icons text-5xl mb-3">pets</span>
            <p className="text-sm font-medium">附近暂无失踪宠物警报</p>
            <p className="text-xs mt-1 opacity-70">可尝试扩大搜索半径</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {alerts.map(alert => {
              const dist = getDistanceText(alert);
              return (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/lost-alerts/${alert.id}`)}
                  className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-gray-50 dark:border-zinc-700"
                >
                  <div className="flex gap-4">
                    {/* 宠物头像 */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-700">
                      {alert.avatarUrl ? (
                        <img
                          src={alert.avatarUrl}
                          alt={alert.petName}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {alert.isUrgent && (
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                紧急
                              </span>
                            )}
                            <span className="text-base font-bold text-text-main dark:text-zinc-100">
                              {alert.petName}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500">
                              {PET_TYPE_LABELS[alert.petType] ?? alert.petType}
                              {alert.petBreed ? ` · ${alert.petBreed}` : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                        {dist && (
                          <span className="flex-shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {dist}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-zinc-500">
                        {alert.locationText && (
                          <span className="flex items-center gap-0.5">
                            <span className="material-icons-round text-[13px]">location_on</span>
                            {alert.locationText}
                          </span>
                        )}
                        <span>{formatLostTime(alert.lostAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default LostAlerts;

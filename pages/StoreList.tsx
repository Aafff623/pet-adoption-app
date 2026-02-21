import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../contexts/ToastContext';
import { fetchStoreList, getStoreTypeLabel } from '../lib/api/stores';
import type { Store, StoreType } from '../types';

const STORE_TYPE_OPTIONS: Array<{ id: StoreType | 'all'; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'clinic', label: '诊所' },
  { id: 'hospital', label: '医院' },
  { id: 'grooming', label: '美容' },
  { id: 'training', label: '训练' },
  { id: 'other', label: '其他' },
];

const STORE_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23e5e7eb'/%3E%3Ctext x='100' y='70' font-size='48' text-anchor='middle' fill='%239ca3af'%3E%F0%9F%8F%AC%3C/text%3E%3C/svg%3E`;

const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<StoreType | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStoreList({
        storeType: filterType === 'all' ? undefined : filterType,
      });
      setStores(data);
    } catch {
      showToast('加载门店失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [filterType, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pb-24 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/', { replace: true });
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex-1">线下门店</h1>
          <button
            onClick={() => navigate('/stores/my-bookings')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">event_note</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
          预约到店体验，积分兑换服务
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 scrollbar-hide">
          {STORE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === opt.id
                  ? 'bg-primary text-black'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-round text-4xl text-primary animate-spin mb-3">
              refresh
            </span>
            <p className="text-sm text-gray-500 dark:text-zinc-400">加载中...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-3">
              storefront
            </span>
            <p className="text-gray-500 dark:text-zinc-400">暂无门店</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {stores.map((store) => (
              <li key={store.id}>
                <button
                  onClick={() => navigate(`/stores/${store.id}`)}
                  className="w-full text-left bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md active:scale-[0.99] transition-all"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-700">
                      <img
                        src={store.coverImage || STORE_PLACEHOLDER}
                        alt={store.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = STORE_PLACEHOLDER;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        {store.name}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                        {getStoreTypeLabel(store.storeType)}
                      </span>
                      {store.address && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">
                          {store.address}
                        </p>
                      )}
                      {store.businessHours && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                          {store.businessHours}
                        </p>
                      )}
                    </div>
                    <span className="material-icons-round text-gray-400 dark:text-zinc-500 shrink-0">
                      chevron_right
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default StoreList;

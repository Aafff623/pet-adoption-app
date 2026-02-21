import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useToast } from '../contexts/ToastContext';
import { fetchStoreById, getStoreTypeLabel } from '../lib/api/stores';
import type { Store } from '../types';

const STORE_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'/%3E%3Ctext x='200' y='110' font-size='80' text-anchor='middle' fill='%239ca3af'%3E%F0%9F%8F%AC%3C/text%3E%3C/svg%3E`;

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchStoreById(id);
        setStore(data);
      } catch {
        showToast('加载门店失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 px-6">
        <p className="text-gray-500 dark:text-zinc-400 mb-4">门店不存在</p>
        <button
          onClick={() => navigate('/stores')}
          className="px-4 py-2 rounded-full bg-primary text-black font-medium"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <div className="aspect-[2/1] bg-gray-200 dark:bg-zinc-700">
          <img
            src={store.coverImage || STORE_PLACEHOLDER}
            alt={store.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = STORE_PLACEHOLDER;
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/30 text-white">
            {getStoreTypeLabel(store.storeType)}
          </span>
          <h1 className="text-xl font-bold text-white mt-2">{store.name}</h1>
        </div>
      </header>

      <main className="px-6 -mt-4 relative z-10">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700 overflow-hidden">
          {store.description && (
            <section className="p-5 border-b border-gray-100 dark:border-zinc-700">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-2">
                门店介绍
              </h2>
              <p className="text-gray-800 dark:text-zinc-200 text-sm leading-relaxed">
                {store.description}
              </p>
            </section>
          )}
          {store.address && (
            <section className="p-5 border-b border-gray-100 dark:border-zinc-700 flex gap-3">
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 shrink-0">
                location_on
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">地址</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">{store.address}</p>
              </div>
            </section>
          )}
          {store.businessHours && (
            <section className="p-5 border-b border-gray-100 dark:border-zinc-700 flex gap-3">
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 shrink-0">
                schedule
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">营业时间</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">{store.businessHours}</p>
              </div>
            </section>
          )}
          {store.contactPhone && (
            <section className="p-5 flex gap-3">
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 shrink-0">
                phone
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">联系电话</p>
                <a
                  href={`tel:${store.contactPhone}`}
                  className="text-sm text-primary font-medium"
                >
                  {store.contactPhone}
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/stores/${store.id}/booking`)}
            className="flex-1 py-4 rounded-2xl bg-primary text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98]"
          >
            <span className="material-icons-round">event_available</span>
            预约到店
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default StoreDetail;

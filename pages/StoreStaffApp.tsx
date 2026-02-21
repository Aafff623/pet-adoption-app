import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchStoreStaffStores,
  fetchStorePendingBookings,
  verifyStoreBooking,
  getServiceTypeLabel,
} from '../lib/api/stores';
import type { Store, StoreBooking } from '../types';

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StoreStaffApp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [bookings, setBookings] = useState<StoreBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadStores = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchStoreStaffStores(user.id);
      setStores(data);
      if (data.length > 0 && !selectedStore) {
        setSelectedStore(data[0]);
      }
    } catch {
      showToast('加载门店失败');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  const loadBookings = useCallback(async () => {
    if (!user || !selectedStore) return;
    try {
      const data = await fetchStorePendingBookings(selectedStore.id, user.id);
      setBookings(data);
    } catch {
      showToast('加载预约失败');
    }
  }, [user, selectedStore, showToast]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadStores();
  }, [user, loadStores, navigate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleVerify = async (bookingId: string) => {
    setVerifyingId(bookingId);
    try {
      await verifyStoreBooking(bookingId);
      showToast('核销成功');
      loadBookings();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '核销失败';
      showToast(msg);
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 px-6">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-4">
          store
        </span>
        <p className="text-gray-600 dark:text-zinc-400 text-center mb-4">
          您还不是任何门店的店员，请联系门店管理员添加
        </p>
        <button
          onClick={() => navigate('/stores')}
          className="px-4 py-2 rounded-full bg-primary text-black font-medium"
        >
          浏览门店
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex-1">店员核销</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">选择门店，核销用户预约</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stores.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStore(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                selectedStore?.id === s.id
                  ? 'bg-primary text-black'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-4">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-3">
              event_available
            </span>
            <p className="text-gray-500 dark:text-zinc-400">暂无待核销预约</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id}>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100">
                        {getServiceTypeLabel(b.serviceType)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                        {formatDateTime(b.bookingAt)}
                      </p>
                      {b.pointsUsed > 0 && (
                        <p className="text-xs text-primary mt-1">积分抵扣 {b.pointsUsed}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleVerify(b.id)}
                      disabled={verifyingId === b.id}
                      className="px-4 py-2 rounded-xl bg-primary text-black font-medium text-sm disabled:opacity-60 flex items-center gap-1"
                    >
                      {verifyingId === b.id ? (
                        <span className="material-icons-round animate-spin text-lg">refresh</span>
                      ) : (
                        <>
                          <span className="material-icons-round text-lg">check_circle</span>
                          核销
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default StoreStaffApp;

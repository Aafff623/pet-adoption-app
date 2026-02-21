import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchMyBookings, getServiceTypeLabel } from '../lib/api/stores';
import type { StoreBookingWithStore, StoreBookingStatus } from '../types';

const STATUS_LABELS: Record<StoreBookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  used: '已核销',
  cancelled: '已取消',
};

const STATUS_CLASS: Record<StoreBookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  confirmed: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
  used: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400',
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StoreMyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<StoreBookingWithStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StoreBookingStatus | 'all'>('all');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchMyBookings(user.id, {
        status: filter === 'all' ? undefined : filter,
      });
      setBookings(data);
    } catch {
      showToast('加载预约失败');
    } finally {
      setLoading(false);
    }
  }, [user, filter, showToast]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    load();
  }, [user, load, navigate]);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex-1">我的预约</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'pending', 'confirmed', 'used', 'cancelled'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                filter === opt
                  ? 'bg-primary text-black'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {opt === 'all' ? '全部' : STATUS_LABELS[opt]}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <span className="material-icons-round text-4xl text-primary animate-spin mb-3">
              refresh
            </span>
            <p className="text-sm text-gray-500 dark:text-zinc-400">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-6xl text-gray-300 dark:text-zinc-600 mb-3">
              event_busy
            </span>
            <p className="text-gray-500 dark:text-zinc-400 mb-4">暂无预约</p>
            <button
              onClick={() => navigate('/stores')}
              className="px-4 py-2 rounded-full bg-primary text-black font-medium"
            >
              去预约
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((b) => (
              <li key={b.id}>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                      {b.storeName ?? '门店'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[b.status]}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {getServiceTypeLabel(b.serviceType)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                    {formatDateTime(b.bookingAt)}
                  </p>
                  {b.storeAddress && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">
                      {b.storeAddress}
                    </p>
                  )}
                  {b.pointsUsed > 0 && (
                    <p className="text-xs text-primary mt-1">已抵扣 {b.pointsUsed} 积分</p>
                  )}
                  <button
                    onClick={() => navigate(`/stores/${b.storeId}`)}
                    className="mt-3 text-sm font-medium text-primary"
                  >
                    查看门店
                  </button>
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

export default StoreMyBookings;

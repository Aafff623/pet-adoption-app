import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchStoreById, createStoreBooking, getServiceTypeLabel } from '../lib/api/stores';
import { fetchAdoptedPets } from '../lib/api/pets';
import type { Store, StoreServiceType } from '../types';
import type { Pet } from '../types';

const SERVICE_OPTIONS: Array<{ id: StoreServiceType; label: string; pointsCost: number }> = [
  { id: 'visit', label: '到店体验', pointsCost: 0 },
  { id: 'grooming', label: '美容护理', pointsCost: 50 },
  { id: 'training', label: '训练课程', pointsCost: 80 },
  { id: 'checkup', label: '健康体检', pointsCost: 100 },
  { id: 'other', label: '其他服务', pointsCost: 30 },
];

const todayDateStr = (): string => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const toDateTimeLocal = (dateStr: string, hour: number): string => {
  const d = new Date(dateStr);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const StoreBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState<StoreServiceType>('visit');
  const [bookingDate, setBookingDate] = useState(todayDateStr());
  const [bookingHour, setBookingHour] = useState(10);
  const [petId, setPetId] = useState<string>('');
  const [note, setNote] = useState('');

  const selectedService = SERVICE_OPTIONS.find((s) => s.id === serviceType);
  const pointsCost = selectedService?.pointsCost ?? 0;

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [storeData, petsData] = await Promise.all([
          fetchStoreById(id),
          fetchAdoptedPets(user.id),
        ]);
        setStore(storeData ?? null);
        setPets(petsData ?? []);
      } catch {
        showToast('加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, navigate, showToast]);

  const handleSubmit = async () => {
    if (!store || !user) return;
    const bookingAt = toDateTimeLocal(bookingDate, bookingHour);
    if (new Date(bookingAt) < new Date()) {
      showToast('请选择未来的时间');
      return;
    }
    setSubmitting(true);
    try {
      await createStoreBooking(
        {
          storeId: store.id,
          serviceType,
          bookingAt,
          petId: petId || undefined,
          pointsCost: pointsCost > 0 ? pointsCost : undefined,
          note: note || undefined,
        },
        user.id
      );
      showToast('预约成功');
      navigate(`/stores/${store.id}`, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '预约失败';
      if (msg.includes('INSUFFICIENT_POINTS')) {
        showToast('积分不足');
      } else {
        showToast(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  const hourOptions = Array.from({ length: 9 }, (_, i) => i + 9);

  return (
    <div className="pb-24 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">预约到店</h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{store.name}</p>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">服务类型</h2>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setServiceType(opt.id)}
                className={`p-3 rounded-xl text-left border transition-colors ${
                  serviceType === opt.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                {opt.pointsCost > 0 && (
                  <span className="block text-xs mt-1 text-gray-500 dark:text-zinc-400">
                    {opt.pointsCost} 积分
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">预约时间</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">日期</label>
              <input
                type="date"
                value={bookingDate}
                min={todayDateStr()}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">时段</label>
              <select
                value={bookingHour}
                onChange={(e) => setBookingHour(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}:00 - {h + 1}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {pets.length > 0 && (
          <section className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">
              选择宠物（可选）
            </h2>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
            >
              <option value="">不指定</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（{p.breed}）
                </option>
              ))}
            </select>
          </section>
        )}

        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3">备注</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如有特殊需求可在此说明"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 resize-none"
          />
        </section>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-primary text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60 active:scale-[0.98]"
        >
          {submitting ? (
            <span className="material-icons-round animate-spin">refresh</span>
          ) : (
            <>
              <span className="material-icons-round">check_circle</span>
              确认预约
              {pointsCost > 0 && `（${pointsCost} 积分）`}
            </>
          )}
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default StoreBookingPage;

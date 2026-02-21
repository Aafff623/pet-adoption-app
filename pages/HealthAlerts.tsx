import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchHealthAlerts, markAlertRead, generateHealthAlerts } from '../lib/api/healthAdvisor';
import { fetchPetById, fetchAdoptedPets, fetchMyPublishedPets } from '../lib/api/pets';
import BottomNav from '../components/BottomNav';
import type { HealthAlert } from '../types';

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: '低', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  medium: { label: '中', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  high: { label: '高', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const HealthAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [petNames, setPetNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchHealthAlerts(user.id);
        setAlerts(list);
        const ids = [...new Set(list.map(a => a.petId))];
        const names: Record<string, string> = {};
        await Promise.all(
          ids.map(async id => {
            const pet = await fetchPetById(id);
            if (pet) names[id] = pet.name;
          })
        );
        setPetNames(names);
      } catch {
        showToast('加载预警列表失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const handleGenerateAlerts = async () => {
    if (!user || generating) return;
    setGenerating(true);
    try {
      const [adopted, published] = await Promise.all([
        fetchAdoptedPets(user.id),
        fetchMyPublishedPets(user.id),
      ]);
      const allPets = [...adopted];
      const seen = new Set(adopted.map(p => p.id));
      published.forEach(p => { if (!seen.has(p.id)) allPets.push(p); });
      const newAlerts: HealthAlert[] = [];
      if (allPets.length === 0) {
        showToast('暂无宠物，请先领养或发布宠物');
        return;
      }
      for (const pet of allPets) {
        const created = await generateHealthAlerts({ petId: pet.id, userId: user.id });
        newAlerts.push(...created);
      }
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
        showToast(`已生成 ${newAlerts.length} 条预警`);
      } else {
        showToast('当前无异常，健康状态良好');
      }
    } catch {
      showToast('生成预警失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkRead = async (alert: HealthAlert) => {
    if (alert.readAt) return;
    try {
      await markAlertRead(alert.id);
      setAlerts(prev =>
        prev.map(a => (a.id === alert.id ? { ...a, readAt: new Date().toISOString() } : a))
      );
    } catch {
      showToast('操作失败');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/my-pets', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-zinc-900 pb-20">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <div className="ml-2 flex-1">
          <h1 className="font-bold text-lg text-gray-900 dark:text-zinc-100">健康预警</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">基于健康日记的异常提醒</p>
        </div>
        <button
          onClick={handleGenerateAlerts}
          disabled={generating}
          className="px-3 py-1.5 rounded-lg bg-primary text-black text-sm font-medium disabled:opacity-50"
        >
          {generating ? '检查中...' : '检查预警'}
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-zinc-400">
          <span className="material-icons-round text-5xl mb-4 block opacity-50">notifications_none</span>
          <p>暂无健康预警</p>
          <p className="text-sm mt-1">持续记录健康日记，系统将自动分析并提醒</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {alerts.map(alert => {
            const cfg = severityConfig[alert.severity] ?? severityConfig.low;
            return (
              <div
                key={alert.id}
                onClick={() => handleMarkRead(alert)}
                className={`rounded-xl p-4 border ${cfg.bg} ${
                  alert.readAt
                    ? 'border-gray-200 dark:border-zinc-600 opacity-75'
                    : 'border-gray-300 dark:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${cfg.color}`}>
                    {cfg.label} · {petNames[alert.petId] ?? '宠物'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {formatDate(alert.createdAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-1">{alert.title}</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">
                  {alert.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default HealthAlerts;

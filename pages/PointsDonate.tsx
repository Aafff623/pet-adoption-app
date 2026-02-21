import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { donatePoints } from '../lib/api/points';
import { getPointsPartnerByKey } from '../lib/config/pointsPartners';

const PointsDonate: React.FC = () => {
  const navigate = useNavigate();
  const { partnerKey = '' } = useParams<{ partnerKey: string }>();
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const partner = getPointsPartnerByKey(partnerKey);

  if (!partner) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col items-center justify-center px-6">
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">未找到该捐赠项目</p>
        <button
          onClick={() => navigate('/points/tasks', { replace: true })}
          className="px-4 py-2 rounded-xl bg-primary text-black font-semibold"
        >
          返回成长任务
        </button>
      </div>
    );
  }

  const handleSubmitDonation = async () => {
    if (!profile?.id || submitting) {
      return;
    }

    if ((profile.points ?? 0) < partner.points) {
      showToast(`当前积分不足，还差 ${partner.points - (profile.points ?? 0)} 分`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await donatePoints({
        partnerKey: partner.key,
        points: partner.points,
        note: note.trim() || undefined,
      });
      await refreshProfile();
      showToast(`感谢捐赠！已向 ${partner.name} 捐出 ${partner.points} 分，剩余 ${result.remainingPoints} 分`);
      navigate('/points/tasks', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '捐赠失败';
      showToast(`捐赠失败：${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 fade-in bg-background-light dark:bg-zinc-900 min-h-screen">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/points/tasks', { replace: true });
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
            aria-label="返回"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-main dark:text-zinc-100">积分公益捐赠</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">留言后确认捐赠，帮助公益机构精准援助</p>
          </div>
        </div>
      </header>

      <main className="px-6 mt-4 space-y-4">
        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-text-main dark:text-zinc-100">{partner.name}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{partner.impact}</p>
            </div>
            <p className="text-2xl font-extrabold text-primary">{partner.points} 分</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3">当前可用积分：{profile?.points ?? 0} 分</p>
        </section>

        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-text-main dark:text-zinc-100 mb-3">捐赠方式</h2>
          <div className="space-y-2">
            {partner.methods.map((method) => (
              <div key={method} className="rounded-xl bg-background-light dark:bg-zinc-900 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300">
                {method}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-text-main dark:text-zinc-100 mb-2">留言板</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="可填写用途建议、受助对象期待或给志愿者的话"
            className="w-full min-h-28 rounded-xl bg-background-light dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
            maxLength={120}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
            <span>留言将随捐赠记录存档</span>
            <span>{note.length}/120</span>
          </div>
          <button
            onClick={() => navigate('/feedback')}
            className="mt-3 text-xs text-primary underline"
          >
            提交反馈建议
          </button>
        </section>

        <button
          onClick={handleSubmitDonation}
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-primary text-black font-bold active:scale-[0.97] transition-all disabled:opacity-60"
        >
          {submitting ? '捐赠中…' : `确认捐赠 ${partner.points} 分`}
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default PointsDonate;

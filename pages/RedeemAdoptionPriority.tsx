import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import { redeemPoints } from '../lib/api/points';

const COST = 300;

const BENEFITS = [
  { icon: 'rocket_launch', text: '领养申请优先展示给宠物主人' },
  { icon: 'schedule', text: '有效期 30 天，单次使用' },
  { icon: 'verified', text: '兑换后自动发放至账户' },
  { icon: 'repeat', text: '每账户每月最多兑换 2 张' },
];

const RedeemAdoptionPriority: React.FC = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const points = profile?.points ?? 0;
  const canRedeem = points >= COST;
  const pct = Math.min(100, Math.round((points / COST) * 100));

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/points', { replace: true });
  };

  const handleRedeem = async () => {
    if (!canRedeem) return;
    setLoading(true);
    try {
      const result = await redeemPoints({
        itemKey: 'adoption-priority',
        cost: COST,
      });
      await refreshProfile();
      showToast(`兑换成功！已扣除 ${COST} 积分，剩余 ${result.remainingPoints} 积分`);
      navigate('/points', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '兑换失败';
      if (message.includes('INSUFFICIENT_POINTS')) {
        showToast('积分不足，无法兑换');
      } else if (message.includes('function public.redeem_points')) {
        showToast('兑换功能未启用，请先执行最新数据库迁移');
      } else {
        showToast(`兑换失败：${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 fade-in">
      {/* 渐变英雄区 */}
      <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700 pt-12 pb-8 px-6 shadow-xl">
        {/* 返回按钮透明叠加 */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.97] transition-all backdrop-blur-sm"
          aria-label="返回"
        >
          <span className="material-icons-round text-white">arrow_back</span>
        </button>

        {/* 图标 + 标题 */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-icons-round text-white text-5xl">card_giftcard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">领养优先券</h1>
          <p className="text-pink-100 text-sm mb-4">让你的申请排在最前面</p>
          <div className="bg-white/25 rounded-full px-6 py-2 backdrop-blur-sm shadow-md">
            <span className="text-white font-bold text-lg">{COST} 积分兑换</span>
          </div>
        </div>
      </div>

      <main className="px-6 space-y-5 mt-5">
        {/* 进度卡片 */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">当前积分</p>
            <p className={`text-2xl font-extrabold ${canRedeem ? 'text-pink-500' : 'text-red-500'}`}>{points}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{pct}%</span>
          </div>
          {!canRedeem && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center">还差 {COST - points} 积分</p>
          )}
        </div>

        {/* 权益说明 */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-4">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-pink-500 text-xl">workspace_premium</span>
            权益说明
          </h3>
          {BENEFITS.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-pink-500 text-lg">{item.icon}</span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-2">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-pink-500 text-xl">info</span>
            使用方式
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            兑换成功后，在领养申请页面选择使用"领养优先券"，申请将自动置顶展示给宠物主人审核。
          </p>
        </div>
      </main>

      {/* 底部兑换按钮 */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-24 pt-4 z-30 bg-gradient-to-t from-background-light dark:from-zinc-900 via-background-light/95 dark:via-zinc-900/95 to-transparent">
        <button
          onClick={handleRedeem}
          disabled={!canRedeem || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl active:scale-[0.97] transition-all ${
            canRedeem
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
          } ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-icons-round text-base animate-spin">refresh</span>兑换中…
            </span>
          ) : canRedeem ? `立即兑换 · ${COST} 积分` : `积分不足（差 ${COST - points} 分）`}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default RedeemAdoptionPriority;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import { redeemPoints } from '../lib/api/points';

const COST = 220;

const BENEFITS = [
  { icon: 'groups', text: '社群活动优先报名、可携带 1 位伙伴同行' },
  { icon: 'auto_graph', text: '专属分享会与专家 QA 环节，线上回看永久可用' },
  { icon: 'construction', text: '专属资料仓与预约政策优先体验更新' },
  { icon: 'volunteer_activism', text: '参与公益议题讨论可获得额外积分加成' },
];

const EVENTS = [
  { title: '社群分享会', detail: '都市救助人/兽医谈成长路径，优先 120 名入场' },
  { title: '城市合伙人训练营', detail: '线下 1 日训练营，包含行动计划拆解与实操' },
  { title: '爱宠讲堂', detail: '每周直播带货 + 宠物护理小课堂优先提问' },
];

const RULES = [
  { icon: 'calendar_month', text: '卡片有效期 60 天，兑换后需绑定手机号+社区昵称' },
  { icon: 'groups', text: '每场活动可额外带 1 位伙伴，需提前提交同行信息' },
  { icon: 'info', text: '活动日程会同步到「社群日历」，出席后自动记录到积分账户' },
];

const usageTips = [
  '兑换后将在社群入口收到专属 QR Code，凭卡片优先入场。',
  '可在个人设置中选择关注的城市节奏，接收抢票提醒。',
  '参与活动后自动解锁 10 分复购奖励，提高再兑换动力。',
];

const RedeemCommunityPass: React.FC = () => {
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
        itemKey: 'community-pass',
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
      <div className="relative bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 pt-12 pb-8 px-6 shadow-xl">
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.97] transition-all backdrop-blur-sm"
          aria-label="返回"
        >
          <span className="material-icons-round text-white">arrow_back</span>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-icons-round text-white text-5xl">celebration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">社群优先报名卡</h1>
          <p className="text-indigo-100 text-sm mb-4">面向活跃用户的线下/线上社群权益</p>
          <div className="bg-white/25 rounded-full px-6 py-2 backdrop-blur-sm shadow-md">
            <span className="text-white font-bold text-lg">{COST} 积分兑换</span>
          </div>
        </div>
      </div>

      <main className="px-6 space-y-5 mt-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">当前积分</p>
            <p className={`text-2xl font-extrabold ${canRedeem ? 'text-purple-500' : 'text-red-500'}`}>{points}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{pct}%</span>
          </div>
          {!canRedeem && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center">还差 {COST - points} 积分</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-4">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-purple-500 text-xl">workspace_premium</span>
            权益说明
          </h3>
          {BENEFITS.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-purple-500 text-lg">{item.icon}</span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-purple-500 text-xl">event</span>
            适用活动
          </h3>
          <div className="space-y-3">
            {EVENTS.map((event) => (
              <div key={event.title} className="rounded-2xl border border-gray-100 dark:border-zinc-700 px-4 py-3 bg-gray-50 dark:bg-zinc-900/60">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{event.title}</p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 leading-tight">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-purple-500 text-xl">info</span>
            使用方式
          </h3>
          <div className="space-y-2">
            {usageTips.map((tip) => (
              <p key={tip} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {tip}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-purple-500 text-xl">account_balance</span>
            活动规则
          </h3>
          {RULES.map((rule) => (
            <div key={rule.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-purple-500 text-lg">{rule.icon}</span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">{rule.text}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-24 pt-4 z-30 bg-gradient-to-t from-background-light dark:from-zinc-900 via-background-light/95 dark:via-zinc-900/95 to-transparent">
        <button
          onClick={handleRedeem}
          disabled={!canRedeem || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl active:scale-[0.97] transition-all ${
            canRedeem
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
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

export default RedeemCommunityPass;

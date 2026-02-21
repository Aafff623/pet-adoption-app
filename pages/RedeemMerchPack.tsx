import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import { redeemPoints } from '../lib/api/points';

const COST = 200;

const PACK_ITEMS = [
  '联名帆布袋（可折叠、印有 PetConnect 字样）',
  '宠物防水贴纸套装 + 纪念徽章',
  '昵称定制胶囊玩具 + 护养手札',
];

const RULES = [
  { icon: 'local_shipping', text: '限量 200 份，系统依次分批发货，预计 7 个工作日内到达' },
  { icon: 'emoji_events', text: '实物周边可叠加「周边礼遇券」，即刻兑换未来专属活动' },
  { icon: 'support', text: '支持全国包邮，若地址信息变更请在 3 天内联系客服' },
];

const deliverySteps = [
  '兑换成功后填写收货地址与备用联系方式，优先排单。',
  '运营会通过系统通知告知当前制作阶段与预计发货时间。',
  '收到包裹后在社区晒图并标注 #PetConnect 积分周边，自动获得 20 分回馈。',
];

const RedeemMerchPack: React.FC = () => {
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
        itemKey: 'merch-pack',
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
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 pt-12 pb-8 px-6 shadow-xl">
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.97] transition-all backdrop-blur-sm"
          aria-label="返回"
        >
          <span className="material-icons-round text-white">arrow_back</span>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-icons-round text-white text-5xl">redeem</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">周边限量礼包</h1>
          <p className="text-amber-100 text-sm mb-4">成套好物，及时晒图支持公益</p>
          <div className="bg-white/25 rounded-full px-6 py-2 backdrop-blur-sm shadow-md">
            <span className="text-white font-bold text-lg">{COST} 积分兑换</span>
          </div>
        </div>
      </div>

      <main className="px-6 space-y-5 mt-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">当前积分</p>
            <p className={`text-2xl font-extrabold ${canRedeem ? 'text-amber-500' : 'text-red-500'}`}>{points}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{pct}%</span>
          </div>
          {!canRedeem && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center">还差 {COST - points} 积分</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-amber-500 text-xl">inventory</span>
            礼包内容
          </h3>
          <ul className="space-y-2 list-disc marker:text-amber-500 marker:text-base marker:ml-4">
            {PACK_ITEMS.map((item) => (
              <li key={item} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-amber-500 text-xl">info</span>
            配送说明
          </h3>
          <div className="space-y-2">
            {deliverySteps.map((step) => (
              <p key={step} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-amber-500 text-xl">rule</span>
            活动规则
          </h3>
          {RULES.map((rule) => (
            <div key={rule.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-amber-500 text-lg">{rule.icon}</span>
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
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
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

export default RedeemMerchPack;

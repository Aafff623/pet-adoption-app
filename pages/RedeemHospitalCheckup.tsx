import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import { redeemPoints } from '../lib/api/points';

const COST = 250;

const BENEFITS = [
  { icon: 'local_hospital', text: '合作医院 7 折专项体检，含基础 X 光与血液常规' },
  { icon: 'schedule', text: '预约加急通道，原价单号 3 个工作日内安排' },
  { icon: 'spa', text: '含专属医护解读，提供报告录音与复查提醒' },
  { icon: 'verified', text: '与院方合作的复检保障期 14 天' },
];

const PARTNERS = ['宠物之心医院（上海）', '绿茵守护兽医（杭州）', '安爪宠医诊所（成都）', '星河救助站医疗室（广州）'];

const RULES = [
  { icon: 'event', text: '兑换后请在 14 天内通过运营微信号提交预约信息' },
  { icon: 'edit_calendar', text: '预约需提前 48 小时，取消需在 12 小时前提出' },
  { icon: 'payments', text: '体检中额外项目需用户自费，积分仅抵基础套餐' },
  { icon: 'article', text: '医院会在完成后上传报告至「健康日记」' },
];

const checkupSteps = [
  '兑换成功后，系统会发送确认短信与院方预约链接。',
  '填写宠物基本信息并上传近照以获取绿色优先号。',
  '到院签到请出示积分兑换凭证，医护将绑定报告到账号。',
];

const RedeemHospitalCheckup: React.FC = () => {
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
        itemKey: 'hospital-checkup',
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
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 pt-12 pb-8 px-6 shadow-xl">
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.97] transition-all backdrop-blur-sm"
          aria-label="返回"
        >
          <span className="material-icons-round text-white">arrow_back</span>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-icons-round text-white text-5xl">medical_services</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">医院体检礼遇</h1>
          <p className="text-emerald-100 text-sm mb-4">覆盖总部/城市合作医疗，守护宠物健康</p>
          <div className="bg-white/25 rounded-full px-6 py-2 backdrop-blur-sm shadow-md">
            <span className="text-white font-bold text-lg">{COST} 积分兑换</span>
          </div>
        </div>
      </div>

      <main className="px-6 space-y-5 mt-5">
        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">当前积分</p>
            <p className={`text-2xl font-extrabold ${canRedeem ? 'text-emerald-500' : 'text-red-500'}`}>{points}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
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
            <span className="material-icons-round text-emerald-500 text-xl">workspace_premium</span>
            权益说明
          </h3>
          {BENEFITS.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-emerald-500 text-lg">{item.icon}</span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-emerald-500 text-xl">pets</span>
            合作医院
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PARTNERS.map((hospital) => (
              <div key={hospital} className="rounded-2xl border border-gray-100 dark:border-zinc-700 px-3 py-2 bg-gray-50 dark:bg-zinc-900/60">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-tight">{hospital}</p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">预约优先 / 现场专属接待</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-emerald-500 text-xl">info</span>
            使用说明
          </h3>
          <div className="space-y-2">
            {checkupSteps.map((step) => (
              <p key={step} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="material-icons-round text-emerald-500 text-xl">grade</span>
            活动规则
          </h3>
          {RULES.map((rule) => (
            <div key={rule.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-emerald-500 text-lg">{rule.icon}</span>
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
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
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

export default RedeemHospitalCheckup;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPointsLevelState } from '../lib/api/points';
import BottomNav from '../components/BottomNav';

interface RedeemItem {
  icon: string;
  gradient: string;
  title: string;
  desc: string;
  tag: string;
  cost: number;
  route: string;
}

const REDEEM_ITEMS: RedeemItem[] = [
  {
    icon: 'card_giftcard',
    gradient: 'from-pink-500 to-rose-600',
    title: '领养优先券',
    desc: '申请置顶，优先被宠物主看到',
    tag: '最受欢迎',
    cost: 300,
    route: '/points/adoption-priority',
  },
  {
    icon: 'health_and_safety',
    gradient: 'from-cyan-500 to-teal-600',
    title: 'AI 健康报告',
    desc: '一键生成宠物专属健康档案',
    tag: 'AI 驱动',
    cost: 180,
    route: '/points/health-report',
  },
  {
    icon: 'redeem',
    gradient: 'from-amber-500 to-orange-600',
    title: '公益抽奖券',
    desc: '随机赢取宠物好物，善款助力救助站',
    tag: '公益',
    cost: 120,
    route: '/points/lucky-draw',
  },
  {
    icon: 'local_hospital',
    gradient: 'from-emerald-500 to-emerald-700',
    title: '医院健康体检券',
    desc: '合作医院体检 7 折并享预约加急通道',
    tag: '合作福利',
    cost: 250,
    route: '/points/hospital-checkup',
  },
  {
    icon: 'groups',
    gradient: 'from-purple-500 to-indigo-600',
    title: '社群优先报名卡',
    desc: '锁定线下沙龙、专家训练营优先名额',
    tag: '社群权益',
    cost: 220,
    route: '/points/community-pass',
  },
  {
    icon: 'backpack',
    gradient: 'from-amber-500 to-rose-500',
    title: '周边限量礼包',
    desc: '联名帆布袋、贴纸、胶囊玩具等好物',
    tag: '限量',
    cost: 200,
    route: '/points/merch-pack',
  },
];

const EVENT_UPDATES = [
  {
    tag: '医院联动',
    title: '合作诊所健康体检',
    detail: '覆盖 6 家合作诊所，凭券可享 7 折体检与现场加号。',
  },
  {
    tag: '社群权益',
    title: '绿茵社区优先入场',
    detail: '积分用户可在本期分享会、课程与救助站开放日中抢先报名。',
  },
  {
    tag: '周边',
    title: '联名周边礼盒',
    detail: '限量 200 份，内含帆布袋、徽章、贴纸等公益周边。',
  },
];

const MAX_REQUIREMENT = Math.max(300, ...REDEEM_ITEMS.map((item) => item.cost));

const HOW_TO_EARN = [
  { icon: 'pets', label: '完成领养', pts: '+50' },
  { icon: 'edit_note', label: '撰写日记', pts: '+10' },
  { icon: 'share', label: '邀请好友', pts: '+30' },
  { icon: 'task_alt', label: '完成回访', pts: '+20' },
  { icon: 'volunteer_activism', label: '参与社群活动', pts: '+15' },
];

const Points: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const points = profile?.points ?? 0;
  const levelState = getPointsLevelState(points);
  const pct = Math.min(100, Math.round((points / MAX_REQUIREMENT) * 100));
  const levelTheme = levelState.current.key === 'gold'
    ? {
        wrap: 'bg-gradient-to-br from-amber-500/20 via-rose-500/15 to-orange-500/20 border-amber-300/40 dark:border-amber-500/30',
        badge: 'bg-amber-500 text-black',
        icon: 'emoji_events',
      }
    : levelState.current.key === 'silver'
      ? {
          wrap: 'bg-gradient-to-br from-slate-300/20 via-slate-500/10 to-slate-600/20 border-slate-300/40 dark:border-slate-500/30',
          badge: 'bg-slate-600 text-white',
          icon: 'military_tech',
        }
      : {
          wrap: 'bg-gradient-to-br from-amber-600/15 via-amber-400/10 to-orange-600/15 border-amber-500/30 dark:border-amber-700/40',
          badge: 'bg-amber-700 text-white',
          icon: 'shield',
        };

  return (
    <div className="pb-28 fade-in bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <header className="px-5 pt-5 pb-4 sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center gap-3">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/', { replace: true });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          aria-label="返回"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-200">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">我的积分</h1>
      </header>

      <div className="px-4 space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-pink-500 to-rose-600 p-6 shadow-xl shadow-pink-300/30 dark:shadow-pink-900/40">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <p className="text-white/80 text-sm font-medium mb-1">当前可用积分</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-6xl font-black text-white leading-none tracking-tight">{points}</span>
            <span className="text-white/70 text-base mb-1">分</span>
          </div>
          <div className="mb-1 flex items-center justify-between text-xs text-white/70">
            <span>解锁全部兑换权益</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-white/60">最高 {MAX_REQUIREMENT} 积分即可兑换本期全部权益</p>
          <p className="text-xs text-white/80">每次兑换都会让部分积分转入公益救助站，推动本地救援与复养支持。</p>
        </div>

        <div className="space-y-3">
          <div className={`rounded-2xl border px-4 py-4 shadow-sm ${levelTheme.wrap}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-8 px-2 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${levelTheme.badge}`}>
                  <span className="material-icons-round text-sm">{levelTheme.icon}</span>
                  <span>{levelState.current.label}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-tight break-words">{levelState.current.description}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-primary sm:text-right leading-snug break-words">
                {levelState.next ? `距 ${levelState.next.label} 还差 ${levelState.pointsToNext} 分` : '已达最高等级'}
              </span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(1, Math.max(0, levelState.progress)) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/points/tasks')}
              className="flex-1 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3 text-sm font-semibold text-text-main dark:text-zinc-100 hover:border-primary active:scale-[0.97] transition-all"
            >
              成长任务
            </button>
            <button
              onClick={() => navigate('/points/rank')}
              className="flex-1 rounded-2xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3 text-sm font-semibold text-text-main dark:text-zinc-100 hover:border-primary active:scale-[0.97] transition-all"
            >
              积分榜
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-4 pt-4 pb-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-3">如何获得积分</p>
          <div className="grid grid-cols-4 gap-2">
            {HOW_TO_EARN.map(({ icon, label, pts }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 py-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-icons-round text-primary text-xl">{icon}</span>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 text-center leading-tight">{label}</span>
                <span className="text-xs font-bold text-primary">{pts}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-3 px-1">积分商城</p>
          <div className="space-y-3">
            {REDEEM_ITEMS.map((item) => {
              const affordable = points >= item.cost;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className="w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-sm overflow-hidden flex items-stretch active:scale-[0.98] transition-all hover:shadow-md text-left"
                >
                  <div className={`bg-gradient-to-br ${item.gradient} w-20 flex-shrink-0 flex items-center justify-center`}>
                    <span className="material-icons-round text-white text-3xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 px-4 py-3.5 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{item.title}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${affordable ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-400'}`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{item.desc}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-base font-extrabold ${affordable ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>{item.cost}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">积分</span>
                      {!affordable && <span className="ml-1 text-[10px] text-red-400 font-medium">差 {item.cost - points} 分</span>}
                    </div>
                  </div>
                  <div className="pr-3 flex items-center">
                    <span className="material-icons-round text-gray-300 dark:text-zinc-600">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm px-4 py-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">本期运营亮点</p>
            <span className="text-[10px] font-semibold text-primary">02/21 - 03/07</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {EVENT_UPDATES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 dark:border-zinc-700 p-3 bg-gray-50 dark:bg-zinc-900/60"
              >
                <p className="text-[11px] font-semibold text-primary mb-1">{item.tag}</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{item.title}</p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-tight mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-3">
            运营文案与兑换规则已整理在内部文档，确保医院、社群与周边礼包的物料同步。积分也可选择转为公益，优先支持合作救助站。
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Points;

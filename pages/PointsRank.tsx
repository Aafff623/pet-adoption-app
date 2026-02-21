import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const RANKING = [
  { rank: 1, name: '星愿酱', points: 1840, detail: '累计 32 次成长任务，热心捐赠 4 次' },
  { rank: 2, name: '晴晓', points: 1720, detail: '救援任务达人，完成月榜目标' },
  { rank: 3, name: '暖习', points: 1605, detail: '发布 9 条领养更新与 2 次捐赠' },
  { rank: 4, name: '泡泡', points: 1460, detail: '社群活跃榜 Top 3，协助 6 个家庭' },
  { rank: 5, name: '小履米', points: 1280, detail: '完成试养回访、分享日记并推荐好友' },
];

const PointsRank: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-28 fade-in bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <header className="px-5 pt-5 pb-4 sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center gap-3">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/points', { replace: true });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          aria-label="返回"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-200">arrow_back</span>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">积分榜</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">每期榜单依据任务完成与公益捐赠累积积分排序</p>
        </div>
      </header>

      <main className="px-5 space-y-5">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-zinc-700">
          {RANKING.map((item) => (
            <div key={item.rank} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  #{item.rank}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{item.name}</p>
                  <p className="text-[12px] text-gray-500 dark:text-zinc-400 mt-0.5">{item.detail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-primary">{item.points}</p>
                <p className="text-[12px] text-gray-500 dark:text-zinc-400">积分总量</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-4 py-3 text-xs text-gray-500 dark:text-zinc-400">
          当前榜单为静态演示，后续会接入排行榜 API 并同步捐赠/救援贡献。
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PointsRank;

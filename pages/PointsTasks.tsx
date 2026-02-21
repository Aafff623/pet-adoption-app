import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  grantPoints,
  POINT_TASKS,
  fetchPointTasks,
} from '../lib/api/points';
import { POINTS_PARTNERS } from '../lib/config/pointsPartners';
import type { PointTaskProgress } from '../types';

const PointsTasks: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const activityAnchorRef = useRef<HTMLDivElement>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<Record<string, PointTaskProgress>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;

    const loadProgress = async () => {
      setLoadingProgress(true);
      try {
        const progress = await fetchPointTasks(profile.id);
        if (cancelled) return;
        setTaskProgress(progress.reduce<Record<string, PointTaskProgress>>((acc, item) => {
          acc[item.key] = item;
          return acc;
        }, {}));
      } catch (error) {
        const message = error instanceof Error ? error.message : '任务进度加载失败';
        showToast(message.includes('UNAUTHENTICATED') ? '请先登录查看任务进度' : `任务进度加载失败：${message}`);
      } finally {
        if (!cancelled) setLoadingProgress(false);
      }
    };

    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, showToast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldScroll = params.get('from') === 'play-center' || params.get('anchor') === 'activity-zone';
    if (!shouldScroll) return;
    const timer = window.setTimeout(() => {
      activityAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.search]);

  const taskSummaries = useMemo(() => {
    let completed = 0;
    let total = 0;

    const entries = POINT_TASKS.map((task) => {
      const progress = taskProgress[task.key] ?? {
        key: task.key,
        completed: 0,
        limit: task.limitCount,
        lastCompletedAt: null,
      };
      const safeCompleted = Math.min(progress.completed, progress.limit);
      completed += safeCompleted;
      total += task.limitCount;
      return { task, progress, safeCompleted };
    });

    return {
      entries,
      completed,
      total,
      rate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [taskProgress]);

  const handleClaim = async (task: typeof POINT_TASKS[number]) => {
    if (task.key === 'publish-adopt-request') {
      navigate('/publish-adopt-request');
      return;
    }
    if (task.key === 'engage-rescue') {
      navigate('/rescue-board');
      return;
    }

    if (claiming) return;
    setClaiming(task.key);
    try {
      const result = await grantPoints({ taskKey: task.key, points: task.points });
      await refreshProfile();
      showToast(`任务完成，获得 ${task.points} 分，当前 ${result.remainingPoints} 分`);
      setTaskProgress((prev) => {
        const current = prev[task.key];
        return {
          ...prev,
          [task.key]: {
            key: task.key,
            completed: Math.min((current?.completed ?? 0) + 1, task.limitCount),
            limit: task.limitCount,
            lastCompletedAt: new Date().toISOString(),
          },
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '领取失败';
      if (message.includes('UNAUTHENTICATED')) {
        showToast('请先登录以领取任务奖励');
        navigate('/login?redirect=/points/tasks', { replace: true });
      } else {
        showToast(`任务领取失败：${message}`);
      }
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="pb-24 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/points', { replace: true });
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
            aria-label="返回"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-main dark:text-zinc-100">成长任务书</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">完成任务即可获得积分与公益回馈</p>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-5 mt-4">
        <div ref={activityAnchorRef} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">成长任务完成率</p>
              <p className="text-3xl font-extrabold text-primary">
                {loadingProgress ? '加载中…' : `${taskSummaries.rate}%`}
              </p>
            </div>
            <button
              onClick={() => navigate('/points/rank')}
              className="text-xs text-primary underline"
            >
              查看积分榜
            </button>
          </div>
          <div className="h-2 rounded-full bg-background-light dark:bg-zinc-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${loadingProgress ? 0 : taskSummaries.rate}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400">
            本期完成 {loadingProgress ? '加载中' : `${taskSummaries.completed}/${taskSummaries.total}`} 个任务
          </p>
        </div>

        <div className="space-y-4">
          {POINT_TASKS.map((task) => {
            const progress = taskSummaries.entries.find((item) => item.task.key === task.key)?.progress;
            const ratio = progress ? progress.completed / task.limitCount : 0;
            const reachedLimit = (progress?.completed ?? 0) >= task.limitCount;
            const isRouteTask = task.key === 'publish-adopt-request' || task.key === 'engage-rescue';
            return (
              <div key={task.key} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">{task.badge}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{task.limitLabel}</p>
                    </div>
                    <h2 className="text-lg font-bold text-text-main dark:text-zinc-100">{task.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{task.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-xl font-bold text-primary">+{task.points}</span>
                    <button
                      onClick={() => handleClaim(task)}
                      disabled={claiming === task.key || !profile || reachedLimit}
                      className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full hover:bg-primary/80 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {reachedLimit
                        ? '已完成'
                        : isRouteTask
                          ? '去完成'
                          : (claiming === task.key ? '领取中…' : '立即完成')}
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="h-1.5 rounded-full bg-background-light dark:bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(1, Math.max(0, ratio)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400">
                    <span>
                      {task.periodLabel}进度：{progress?.completed ?? 0}/{task.limitCount}
                    </span>
                    <span>
                      {progress?.lastCompletedAt
                        ? new Date(progress.lastCompletedAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '尚未开始'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">积分公益捐赠</p>
              <p className="text-xs text-gray-400">捐赠记录会写入 points_transactions，合作伙伴详情见文档</p>
            </div>
            <a
              href="/docs/enterprise/points-partners.md"
              className="text-xs text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              查看合作伙伴
            </a>
          </div>
          <div className="space-y-3">
            {POINTS_PARTNERS.map((partner) => (
              <div key={partner.key} className="border border-gray-100 dark:border-zinc-700 rounded-2xl px-4 py-3 bg-background-light dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-main dark:text-zinc-100">{partner.name}</p>
                    <p className="text-[12px] text-gray-500 dark:text-zinc-400 mt-0.5">{partner.impact}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{partner.points} 分</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/points/donate/${partner.key}`)}
                  className="mt-3 w-full text-sm font-semibold text-white bg-primary rounded-2xl py-2 active:scale-[0.97] transition-all"
                >
                  前往捐赠详情
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default PointsTasks;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { applyRescueTask, createRescueTask, fetchRescueTasks } from '../lib/api/rescueTasks';
import { cacheRescueTasks, getCachedRescueTasks } from '../lib/offline/cache';
import { enqueue } from '../lib/offline/syncQueue';
import type { RescueTask, RescueTaskStatus, RescueTaskType } from '../types';

const TYPE_LABEL: Record<RescueTaskType, string> = {
  feeding: '喂养',
  medical: '送医',
  transport: '接送',
  foster: '临时寄养',
  supplies: '物资采购',
};

const STATUS_LABEL: Record<RescueTaskStatus, string> = {
  open: '待接单',
  claimed: '执行中',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_CLASS: Record<RescueTaskStatus, string> = {
  open: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  claimed: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
  completed: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400',
};

const FILTERS: Array<{ id: 'all' | RescueTaskStatus; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'open', label: '待接单' },
  { id: 'claimed', label: '执行中' },
  { id: 'completed', label: '已完成' },
];

const RescueBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<RescueTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | RescueTaskStatus>('all');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<RescueTaskType>('feeding');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [maxAssigneesInput, setMaxAssigneesInput] = useState('1');

  const load = async (status?: RescueTaskStatus) => {
    setLoading(true);
    try {
      const data = await fetchRescueTasks(status, user?.id);
      setTasks(data);
      setUsingCache(false);
      // 全量缓存（不区分筛选状态）
      if (!status) cacheRescueTasks(data);
    } catch {
      // 网络失败时尝试读取离线缓存
      const cached = getCachedRescueTasks();
      if (cached && cached.length > 0) {
        const filtered = status
          ? cached.filter(t => t.status === status)
          : cached;
        setTasks(filtered);
        setUsingCache(true);
        showToast('网络不可用，显示缓存数据');
      } else {
        showToast('加载任务失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 仅挂载时拉一次全量数据，切换 Tab 全部走本地过滤，避免反复请求
  useEffect(() => {
    void load(undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter(task => activeFilter === 'all' || task.status === activeFilter)
      .map(task => ({
        ...task,
        isExpired: task.status !== 'completed' && task.status !== 'cancelled' && new Date(task.windowEnd).getTime() < now,
      }));
  }, [tasks, activeFilter]);

  const resetForm = () => {
    setTitle('');
    setTaskType('feeding');
    setDescription('');
    setLocationText('');
    setWindowStart('');
    setWindowEnd('');
    setMaxAssigneesInput('1');
    setCreateError('');
  };

  const handleCreateTask = async () => {
    if (!user) return;
    if (!title.trim()) {
      setCreateError('请先填写任务标题');
      showToast('请输入任务标题');
      return;
    }
    if (!windowStart || !windowEnd) {
      setCreateError('请先选择完整的任务时间窗（开始与结束时间）');
      showToast('请选择任务时间窗');
      return;
    }
    if (new Date(windowEnd).getTime() <= new Date(windowStart).getTime()) {
      setCreateError('结束时间需晚于开始时间');
      showToast('结束时间需晚于开始时间');
      return;
    }

    const parsedMaxAssignees = Number.parseInt(maxAssigneesInput, 10);
    if (!Number.isFinite(parsedMaxAssignees) || parsedMaxAssignees < 1 || parsedMaxAssignees > 20) {
      setCreateError('人数上限需为 1-20 的整数');
      showToast('请填写有效的人数上限（1-20）');
      return;
    }

    setSubmitting(true);
    setCreateError('');
    try {
      const created = await createRescueTask(
        {
          title: title.trim(),
          taskType,
          description: description.trim() || undefined,
          locationText: locationText.trim() || undefined,
          windowStart: new Date(windowStart).toISOString(),
          windowEnd: new Date(windowEnd).toISOString(),
          maxAssignees: parsedMaxAssignees,
        },
        user.id
      );
      setShowCreateSheet(false);
      resetForm();
      setTasks(prev => [created, ...prev]);
      showToast('任务已发布，等待志愿者申请接单');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '创建失败，请稍后重试');
      showToast(err instanceof Error ? err.message : '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (taskId: string) => {
    if (!user) return;
    setClaimingId(taskId);
    // 离线时入队延迟处理
    if (!navigator.onLine) {
      enqueue('claim_task', { taskId, userId: user.id });
      showToast('当前离线，申请已加入队列，联网后自动同步');
      setClaimingId(null);
      return;
    }
    try {
      const updated = await applyRescueTask(taskId, user.id);
      setTasks(prev => prev.map(item => (item.id === taskId ? updated : item)));
      showToast('已提交申请，等待发布者审核');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '申请失败，请重试');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="pb-24 fade-in bg-background-light dark:bg-zinc-900 min-h-screen">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/', { replace: true });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
            >
              <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-text-main dark:text-zinc-100">救助协作任务板</h1>
          </div>
          <button
            onClick={() => setShowCreateSheet(true)}
            className="px-3 py-2 rounded-xl bg-primary text-black text-sm font-bold active:scale-[0.97] transition-all"
          >
            发布任务
          </button>
        </div>

        {/* 离线缓存提示 */}
        {usingCache && (
          <div className="flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 text-xs">
            <span className="material-icons-round text-sm">history</span>
            <span>当前显示最近缓存的数据，恢复网络后将自动更新</span>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-1 flex shadow-sm border border-gray-100 dark:border-zinc-700">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeFilter === filter.id
                  ? 'bg-primary text-black'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(key => (
              <div key={key} className="bg-white dark:bg-zinc-800 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-24 text-gray-400 dark:text-zinc-500">
            <span className="material-icons-round text-5xl">task_alt</span>
            <p className="mt-3 text-sm">当前暂无任务</p>
          </div>
        ) : (
          displayedTasks.map(task => (
            <div
              key={task.id}
              className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-text-main dark:text-zinc-100 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    {TYPE_LABEL[task.taskType]} · {new Date(task.windowStart).toLocaleString()} - {new Date(task.windowEnd).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLASS[task.status]}`}>
                  {STATUS_LABEL[task.status]}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-zinc-300 line-clamp-2">{task.description || '暂无任务说明'}</p>
              {task.locationText && <p className="text-xs text-gray-500 dark:text-zinc-400">📍 {task.locationText}</p>}
              <p className="text-xs text-gray-500 dark:text-zinc-400">👥 已通过 {task.claimedCount}/{task.maxAssignees}</p>
              {task.assignees.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                  执行人：{task.assignees.map(item => `${item.nickname}${item.status === 'completed' ? '（已完成）' : ''}`).join('、')}
                </p>
              )}
              {task.pendingApplicants.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-300">⏳ 待审核申请 {task.pendingApplicants.length} 人</p>
              )}
              {task.isExpired && <p className="text-xs text-amber-500">⚠ 该任务已超出时间窗，请谨慎接单</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/rescue-board/${task.id}`)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm text-gray-600 dark:text-zinc-300 active:scale-[0.97] transition-all"
                >
                  查看详情
                </button>
                {task.status !== 'cancelled' && task.status !== 'completed' && task.creatorId !== user?.id && !task.claimedByMe && !task.appliedByMe && task.claimedCount < task.maxAssignees && (
                  <button
                    onClick={() => handleApply(task.id)}
                    disabled={claimingId === task.id}
                    className="flex-1 py-2 rounded-xl bg-primary text-black text-sm font-bold disabled:opacity-50 active:scale-[0.97] transition-all"
                  >
                    {claimingId === task.id ? '提交中...' : '申请接单'}
                  </button>
                )}
                {task.appliedByMe && !task.claimedByMe && (
                  <button
                    disabled
                    className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-zinc-700 text-sm text-gray-500 dark:text-zinc-300"
                  >
                    已申请待审核
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      {showCreateSheet && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-end"
          onClick={() => !submitting && setShowCreateSheet(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-t-3xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">发布救助任务</h3>
            {createError && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs">
                {createError}
              </div>
            )}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="任务标题（如：今晚喂养流浪猫）"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_LABEL) as RescueTaskType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTaskType(type)}
                  className={`py-2 rounded-lg text-xs font-semibold ${
                    taskType === type ? 'bg-primary/15 text-primary' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {TYPE_LABEL[type]}
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="任务说明（可选）"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm resize-none"
            />
            <input
              value={locationText}
              onChange={e => setLocationText(e.target.value)}
              placeholder="地点（可选）"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={windowStart}
                onChange={e => setWindowStart(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm"
              />
              <input
                type="datetime-local"
                value={windowEnd}
                onChange={e => setWindowEnd(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 dark:text-zinc-400">人数上限（1-20）</label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxAssigneesInput}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '') {
                    setMaxAssigneesInput('');
                    return;
                  }
                  if (/^\d+$/.test(value)) {
                    setMaxAssigneesInput(value);
                  }
                }}
                onBlur={() => {
                  const parsed = Number.parseInt(maxAssigneesInput, 10);
                  if (!Number.isFinite(parsed)) {
                    setMaxAssigneesInput('1');
                    return;
                  }
                  setMaxAssigneesInput(String(Math.max(1, Math.min(20, parsed))));
                }}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateSheet(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-bold"
                disabled={submitting}
              >
                {submitting ? '提交中...' : '发布任务'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default RescueBoard;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  applyRescueTask,
  approveRescueTaskApplicant,
  cancelRescueTask,
  completeRescueTask,
  creatorCompleteTask,
  fetchRescueTaskById,
} from '../lib/api/rescueTasks';
import type { RescueTask, RescueTaskType } from '../types';

const TYPE_LABEL: Record<RescueTaskType, string> = {
  feeding: '喂养',
  medical: '送医',
  transport: '接送',
  foster: '临时寄养',
  supplies: '物资采购',
};

const RescueTaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [task, setTask] = useState<RescueTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completeNote, setCompleteNote] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRescueTaskById(id, user?.id);
        setTask(data);
      } catch {
        showToast('加载任务失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, showToast, user?.id]);

  const refresh = async () => {
    if (!id) return;
    const data = await fetchRescueTaskById(id, user?.id);
    setTask(data);
  };

  const handleApply = async () => {
    if (!user || !task) return;
    setSubmitting(true);
    try {
      const updated = await applyRescueTask(task.id, user.id);
      setTask(updated);
      showToast('已提交申请，等待发布者审核');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '申请失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (applicantId: string) => {
    if (!user || !task) return;
    setSubmitting(true);
    try {
      const updated = await approveRescueTaskApplicant(task.id, applicantId, user.id);
      setTask(updated);
      showToast('审核通过，已加入执行名单');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '审核失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !task) return;
    if (!completeNote.trim()) {
      showToast('请填写完成反馈');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await completeRescueTask(task.id, user.id, completeNote);
      setTask(updated);
      showToast('已提交完成反馈');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !task) return;
    setSubmitting(true);
    try {
      const updated = await cancelRescueTask(task.id, user.id);
      setTask(updated);
      showToast('任务已取消');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '取消失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatorComplete = async () => {
    if (!user || !task) return;
    setSubmitting(true);
    try {
      const updated = await creatorCompleteTask(task.id, user.id);
      setTask(updated);
      showToast('任务已结束');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const isCreator = user?.id === task?.creatorId;
  const isAssignee = Boolean(task && user && task.assignees.some(item => item.userId === user.id));
  const isPendingApplicant = Boolean(task && task.appliedByMe && !task.claimedByMe);
  const canApply = Boolean(
    task &&
      task.status !== 'cancelled' &&
      task.status !== 'completed' &&
      !isCreator &&
      !isAssignee &&
      !isPendingApplicant &&
      task.claimedCount < task.maxAssignees
  );
  const canSubmitComplete = Boolean(task && isAssignee && task.status === 'claimed');

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-8 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/rescue-board', { replace: true });
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-text-main dark:text-zinc-100">任务详情</h1>
        </div>
      </header>

      <main className="px-6 space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl h-60 animate-pulse" />
        ) : !task ? (
          <div className="text-center py-24 text-gray-400 dark:text-zinc-500">任务不存在或已删除</div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700 space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{task.title}</h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300">类型：{TYPE_LABEL[task.taskType]}</p>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                状态：{task.status === 'open' ? '待接单' : task.status === 'claimed' ? '执行中' : task.status === 'completed' ? '已完成' : '已取消'}
              </p>
              <p className="text-sm text-gray-600 dark:text-zinc-300">人数：已通过 {task.claimedCount}/{task.maxAssignees}</p>
              {task.assignees.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-zinc-300">
                  执行人：{task.assignees.map(item => `${item.nickname}${item.status === 'completed' ? '（已完成）' : ''}`).join('、')}
                </p>
              )}
              {task.pendingApplicants.length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  待审核：{task.pendingApplicants.map(item => item.nickname).join('、')}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                时间窗：{new Date(task.windowStart).toLocaleString()} - {new Date(task.windowEnd).toLocaleString()}
              </p>
              {task.locationText && <p className="text-sm text-gray-600 dark:text-zinc-300">地点：{task.locationText}</p>}
              <p className="text-sm text-gray-600 dark:text-zinc-300">说明：{task.description || '暂无说明'}</p>
              {task.completedNote && (
                <p className="text-sm text-green-600 dark:text-green-300">完成反馈：{task.completedNote}</p>
              )}
            </div>

            {canApply && (
              <button
                onClick={handleApply}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-black font-bold active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {submitting ? '提交中...' : '申请接单'}
              </button>
            )}

            {isPendingApplicant && (
              <div className="w-full py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-center text-sm font-semibold">
                你的申请待发布者审核
              </div>
            )}

            {isCreator && task.pendingApplicants.length > 0 && task.status !== 'cancelled' && task.status !== 'completed' && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 space-y-3">
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">审核接单申请</p>
                {task.pendingApplicants.map(applicant => (
                  <div key={applicant.userId} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-zinc-700 px-3 py-2">
                    <span className="text-sm text-gray-700 dark:text-zinc-200">{applicant.nickname}</span>
                    <button
                      onClick={() => handleApprove(applicant.userId)}
                      disabled={submitting || task.claimedCount >= task.maxAssignees}
                      className="px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold disabled:opacity-50"
                    >
                      通过
                    </button>
                  </div>
                ))}
              </div>
            )}

            {canSubmitComplete && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 space-y-3">
                <textarea
                  value={completeNote}
                  onChange={e => setCompleteNote(e.target.value)}
                  rows={4}
                  placeholder="填写完成反馈（如：已送医并完成检查）"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm resize-none"
                />
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary text-black font-bold disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交完成反馈'}
                </button>
              </div>
            )}

            {(task.status === 'open' || task.status === 'claimed') && isCreator && (
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 dark:text-red-400 font-bold disabled:opacity-50"
              >
                {submitting ? '处理中...' : '取消任务'}
              </button>
            )}

            {task.status === 'claimed' && isCreator && (
              <button
                onClick={handleCreatorComplete}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-green-500 dark:bg-green-600 text-white font-bold disabled:opacity-50 active:scale-[0.97] transition-all"
              >
                {submitting ? '处理中...' : '结束任务'}
              </button>
            )}

            <button
              onClick={() => void refresh()}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-300"
            >
              刷新状态
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default RescueTaskDetail;

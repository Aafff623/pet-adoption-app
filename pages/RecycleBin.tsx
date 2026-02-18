import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchTrashedMessageGroups,
  restoreTrashedMessages,
  permanentlyDeleteMessages,
} from '../lib/api/messages';
import type { TrashedGroup } from '../types';

const TRASH_RETENTION_DAYS = 3;

const calcDaysLeft = (expiresAt: string): number => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const RecycleBin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [groups, setGroups] = useState<TrashedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmGroup, setConfirmGroup] = useState<TrashedGroup | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchTrashedMessageGroups(user.id);
      setGroups(data);
    } catch {
      showToast('加载回收站失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRestore = async (group: TrashedGroup) => {
    setActionId(group.conversation.id);
    try {
      await restoreTrashedMessages(group.conversation.id);
      setGroups(prev => prev.filter(g => g.conversation.id !== group.conversation.id));
      showToast('消息已还原');
    } catch {
      showToast('还原失败，请重试');
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async (group: TrashedGroup) => {
    setConfirmGroup(null);
    setActionId(group.conversation.id);
    try {
      await permanentlyDeleteMessages(group.conversation.id);
      setGroups(prev => prev.filter(g => g.conversation.id !== group.conversation.id));
      showToast('已彻底删除');
    } catch {
      showToast('删除失败，请重试');
    } finally {
      setActionId(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/messages', { replace: true });
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-700 px-4 py-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">消息回收站</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500">已清空的消息保留 {TRASH_RETENTION_DAYS} 天后自动彻底删除</p>
        </div>
        <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-2xl">delete_sweep</span>
      </header>

      <main className="flex-1 px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <span className="material-icons-round text-gray-300 dark:text-zinc-600 text-4xl">delete_outline</span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 font-medium">回收站为空</p>
            <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">清空聊天记录后可在此找回</p>
          </div>
        ) : (
          groups.map(group => {
            const daysLeft = calcDaysLeft(group.expiresAt);
            const isActing = actionId === group.conversation.id;
            const isUrgent = daysLeft <= 1;

            return (
              <div
                key={group.conversation.id}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  {group.conversation.otherUserAvatar ? (
                    <img
                      src={group.conversation.otherUserAvatar}
                      alt={group.conversation.otherUserName}
                      className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-zinc-700 shrink-0"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-gray-400 dark:text-zinc-500">
                        {group.conversation.isSystem ? 'notifications' : 'person'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                      {group.conversation.otherUserName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      {group.messageCount} 条消息 · 清空于 {formatDate(group.trashedAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                    isUrgent
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                      : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                  }`}>
                    {daysLeft === 0 ? '今日到期' : `${daysLeft}天后到期`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(group)}
                    disabled={isActing}
                    className="flex-1 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isActing ? (
                      <span className="material-icons-round text-sm animate-spin">refresh</span>
                    ) : (
                      <span className="material-icons-round text-sm">restore</span>
                    )}
                    还原消息
                  </button>
                  <button
                    onClick={() => setConfirmGroup(group)}
                    disabled={isActing}
                    className="flex-1 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    <span className="material-icons-round text-sm">delete_forever</span>
                    彻底删除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 彻底删除确认弹窗 */}
      {confirmGroup && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setConfirmGroup(null)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <span className="material-icons-round text-red-500 text-2xl">delete_forever</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">彻底删除</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                将永久删除与「{confirmGroup.conversation.otherUserName}」的 {confirmGroup.messageCount} 条消息，此操作不可恢复。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmGroup(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handlePermanentDelete(confirmGroup)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;

import React, { useEffect, useState, useRef } from 'react';
import { applyRescueTask, completeRescueTask, cancelRescueTask } from '../lib/api/rescueTasks';
import {
  getQueue,
  hasQueuedItems,
  processQueue,
  type SyncQueueItem,
} from '../lib/offline/syncQueue';

type SyncState = 'idle' | 'syncing' | 'done' | 'error';

const NetworkBanner: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshPendingCount = () => {
    setPendingCount(getQueue().length);
  };

  const runSync = async () => {
    if (!hasQueuedItems()) {
      setSyncState('idle');
      return;
    }
    setSyncState('syncing');
    try {
      const { failed } = await processQueue({
        claim_task: async (item: SyncQueueItem) => {
          const { taskId, userId } = item.payload as { taskId: string; userId: string };
          await applyRescueTask(taskId, userId);
        },
        complete_task: async (item: SyncQueueItem) => {
          const { taskId, userId, note } = item.payload as {
            taskId: string;
            userId: string;
            note: string;
          };
          await completeRescueTask(taskId, userId, note);
        },
        cancel_task: async (item: SyncQueueItem) => {
          const { taskId, userId } = item.payload as { taskId: string; userId: string };
          await cancelRescueTask(taskId, userId);
        },
      });

      refreshPendingCount();
      setSyncState(failed > 0 ? 'error' : 'done');
      // 2 秒后重置为 idle
      syncTimeoutRef.current = setTimeout(() => setSyncState('idle'), 2000);
    } catch {
      setSyncState('error');
    }
  };

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setOnline(true);
      void runSync();
    };
    const handleOffline = () => {
      setOnline(false);
      setSyncState('idle');
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 完全在线且队列为空 —— 不显示
  if (online && pendingCount === 0 && syncState === 'idle') return null;

  // 离线状态
  if (!online) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 text-white text-sm font-medium shadow-md">
        <span className="material-icons-round text-base">wifi_off</span>
        <span>
          当前处于离线模式，显示缓存数据
          {pendingCount > 0 && `，${pendingCount} 条操作待同步`}
        </span>
      </div>
    );
  }

  // 同步中
  if (syncState === 'syncing') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white text-sm font-medium shadow-md">
        <span className="material-icons-round text-base animate-spin">refresh</span>
        <span>正在同步离线操作…</span>
      </div>
    );
  }

  // 同步完成
  if (syncState === 'done') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 bg-green-500 text-white text-sm font-medium shadow-md">
        <span className="material-icons-round text-base">check_circle</span>
        <span>离线操作已同步成功</span>
      </div>
    );
  }

  // 同步失败 + 待重试
  if (syncState === 'error' || (online && pendingCount > 0)) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-2 py-2 px-4 bg-red-500 text-white text-sm font-medium shadow-md">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-base">sync_problem</span>
          <span>
            {pendingCount > 0
              ? `${pendingCount} 条离线操作同步失败`
              : '部分操作同步失败'}
          </span>
        </div>
        <button
          onClick={() => void runSync()}
          className="underline text-white/90 hover:text-white active:opacity-70"
        >
          重试
        </button>
      </div>
    );
  }

  return null;
};

export default NetworkBanner;

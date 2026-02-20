/**
 * 离线同步队列
 * 在无网络时将写操作入队，联网后按 FIFO 顺序重放。
 */

const QUEUE_KEY = 'pc_offline_sync_queue';

// ──────────────────────────────────
// 类型定义
// ──────────────────────────────────

export type SyncActionType = 'claim_task' | 'complete_task' | 'cancel_task';

export interface SyncQueueItem {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  createdAt: number;
  /** 重试次数 */
  retries: number;
}

export type SyncHandler = (item: SyncQueueItem) => Promise<void>;
export type SyncHandlerMap = Partial<Record<SyncActionType, SyncHandler>>;

// ──────────────────────────────────
// 内部读写
// ──────────────────────────────────

function readQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncQueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: SyncQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // 存储空间不足时静默忽略
  }
}

// ──────────────────────────────────
// 公开 API
// ──────────────────────────────────

/** 将一个动作加入离线队列 */
export function enqueue(
  type: SyncActionType,
  payload: Record<string, unknown>,
): SyncQueueItem {
  const item: SyncQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  };
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
  return item;
}

/** 获取当前队列（只读副本） */
export function getQueue(): SyncQueueItem[] {
  return readQueue();
}

/** 从队列中删除一条记录 */
export function dequeue(id: string): void {
  writeQueue(readQueue().filter(item => item.id !== id));
}

/** 批量处理整个队列，成功的条目自动移除，失败的增加重试计数 */
export async function processQueue(handlers: SyncHandlerMap): Promise<{
  succeeded: number;
  failed: number;
}> {
  const queue = readQueue();
  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    const handler = handlers[item.type];
    if (!handler) {
      // 无对应处理器，跳过但保留队列中
      failed++;
      continue;
    }
    try {
      await handler(item);
      dequeue(item.id);
      succeeded++;
    } catch {
      // 增加重试次数，最多保留 5 次，超出后移除
      const updated = readQueue().map(q =>
        q.id === item.id ? { ...q, retries: q.retries + 1 } : q,
      );
      writeQueue(updated.filter(q => q.retries <= 5));
      failed++;
    }
  }

  return { succeeded, failed };
}

/** 清空整个队列（谨慎使用） */
export function clearQueue(): void {
  writeQueue([]);
}

/** 队列中是否有待处理条目 */
export function hasQueuedItems(): boolean {
  return readQueue().length > 0;
}

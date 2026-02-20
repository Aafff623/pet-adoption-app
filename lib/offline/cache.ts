/**
 * 离线缓存模块
 * 使用 localStorage 缓存最近浏览的警报、救助任务，供离线场景使用。
 */
import type { LostPetAlert, RescueTask } from '../../types';

const KEYS = {
  LOST_ALERTS: 'pc_offline_lost_alerts',
  RESCUE_TASKS: 'pc_offline_rescue_tasks',
  RESCUE_TASKS_TS: 'pc_offline_rescue_tasks_ts',
  LOST_ALERTS_TS: 'pc_offline_lost_alerts_ts',
} as const;

/** 最长缓存有效期（12 小时） */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储空间不足时静默忽略
  }
}

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ──────────────────────────────────
// 失踪警报缓存
// ──────────────────────────────────

export function cacheLostAlerts(alerts: LostPetAlert[]): void {
  safeWrite(KEYS.LOST_ALERTS, alerts);
  safeWrite(KEYS.LOST_ALERTS_TS, Date.now());
}

export function getCachedLostAlerts(): LostPetAlert[] | null {
  const ts = safeRead<number>(KEYS.LOST_ALERTS_TS);
  if (!ts || Date.now() - ts > MAX_AGE_MS) return null;
  return safeRead<LostPetAlert[]>(KEYS.LOST_ALERTS);
}

// ──────────────────────────────────
// 救助任务缓存
// ──────────────────────────────────

export function cacheRescueTasks(tasks: RescueTask[]): void {
  safeWrite(KEYS.RESCUE_TASKS, tasks);
  safeWrite(KEYS.RESCUE_TASKS_TS, Date.now());
}

export function getCachedRescueTasks(): RescueTask[] | null {
  const ts = safeRead<number>(KEYS.RESCUE_TASKS_TS);
  if (!ts || Date.now() - ts > MAX_AGE_MS) return null;
  return safeRead<RescueTask[]>(KEYS.RESCUE_TASKS);
}

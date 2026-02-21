import { supabase } from '../supabase';
import type {
  PointTaskDefinition,
  PointTaskProgress,
  PointsLevelInfo,
  PointsLevelState,
} from '../../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface RedeemPointsParams {
  itemKey: string;
  cost: number;
}

export interface RedeemPointsResult {
  remainingPoints: number;
}

export const redeemPoints = async (params: RedeemPointsParams): Promise<RedeemPointsResult> => {
  const { data, error } = await supabase.rpc('redeem_points', {
    p_item_key: params.itemKey,
    p_cost: params.cost,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    remainingPoints: typeof data === 'number' ? data : 0,
  };
};

export interface GrantPointsParams {
  taskKey: string;
  points: number;
}

export interface GrantPointsResult {
  remainingPoints: number;
}

export const grantPoints = async (params: GrantPointsParams): Promise<GrantPointsResult> => {
  const { data, error } = await supabase.rpc('grant_points', {
    p_item_key: params.taskKey,
    p_points: params.points,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    remainingPoints: typeof data === 'number' ? data : 0,
  };
};

export const POINT_TASKS: PointTaskDefinition[] = [
  {
    key: 'daily-signin',
    title: '每日签到',
    description: '完成今日签到并分享当日感想',
    points: 50,
    badge: '日常任务',
    limitLabel: '每日一次',
    limitCount: 1,
    windowDays: 1,
    periodLabel: '今日',
  },
  {
    key: 'publish-adopt-request',
    title: '发布求领养',
    description: '提交领养请求并通过审核',
    points: 120,
    badge: '周常任务',
    limitLabel: '每周 1 次',
    limitCount: 1,
    windowDays: 7,
    periodLabel: '本周',
  },
  {
    key: 'engage-rescue',
    title: '救援任务参与',
    description: '完成志愿救援或动态更新',
    points: 90,
    badge: '影响力任务',
    limitLabel: '每月 2 次',
    limitCount: 2,
    windowDays: 30,
    periodLabel: '本月',
  },
];

const POINT_TASK_MAP = new Map(POINT_TASKS.map((task) => [task.key, task]));

export const fetchPointTasks = async (userId: string): Promise<PointTaskProgress[]> => {
  const defaultProgress = POINT_TASKS.map((task) => ({
    key: task.key,
    completed: 0,
    limit: task.limitCount,
    lastCompletedAt: null as string | null,
  }));

  if (!userId) {
    return defaultProgress;
  }

  const maxWindowDays = Math.max(...POINT_TASKS.map((task) => task.windowDays));
  const since = new Date(Date.now() - maxWindowDays * MS_PER_DAY).toISOString();

  const { data, error } = await supabase
    .from('points_transactions')
    .select('item_key,created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .in('item_key', POINT_TASKS.map((task) => task.key));

  if (error) {
    throw new Error(error.message);
  }

  const summary = new Map<string, { completed: number; lastCompletedAt: string | null }>();

  (data ?? []).forEach((row) => {
    const key = row.item_key as string;
    const task = POINT_TASK_MAP.get(key);
    if (!task || !row.created_at) {
      return;
    }

    const createdTime = new Date(row.created_at as string).getTime();
    const cutoff = Date.now() - task.windowDays * MS_PER_DAY;
    if (createdTime < cutoff) {
      return;
    }

    const record = summary.get(key) ?? { completed: 0, lastCompletedAt: null };
    record.completed += 1;
    if (record.lastCompletedAt === null || createdTime > new Date(record.lastCompletedAt).getTime()) {
      record.lastCompletedAt = new Date(createdTime).toISOString();
    }
    summary.set(key, record);
  });

  return POINT_TASKS.map((task) => {
    const record = summary.get(task.key);
    const completed = Math.min(record?.completed ?? 0, task.limitCount);
    return {
      key: task.key,
      completed,
      limit: task.limitCount,
      lastCompletedAt: record?.lastCompletedAt ?? null,
    };
  });
};

const POINTS_LEVELS: PointsLevelInfo[] = [
  {
    key: 'bronze',
    label: '铜牌守护者',
    description: '完成初始成长任务，建立积分基础',
    minPoints: 0,
    accent: 'from-amber-400 to-amber-600',
    icon: 'shield',
  },
  {
    key: 'silver',
    label: '银牌守护者',
    description: '志愿 + 参与救援，稳步向上',
    minPoints: 500,
    accent: 'from-slate-500 to-slate-700',
    icon: 'sparkles',
  },
  {
    key: 'gold',
    label: '金牌守护者',
    description: '影响力辐射更多家庭与救助站',
    minPoints: 1000,
    accent: 'from-amber-500 to-rose-500',
    icon: 'star',
  },
];

export const getPointsLevelState = (points: number): PointsLevelState => {
  const safePoints = Math.max(0, points);
  let currentIndex = 0;
  for (let i = 0; i < POINTS_LEVELS.length; i += 1) {
    if (safePoints >= POINTS_LEVELS[i].minPoints) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const current = POINTS_LEVELS[currentIndex];
  const next = POINTS_LEVELS[currentIndex + 1];

  if (!next) {
    return {
      current,
      progress: 1,
      pointsToNext: 0,
    };
  }

  const range = next.minPoints - current.minPoints;
  const earned = safePoints - current.minPoints;

  return {
    current,
    next,
    progress: Math.min(1, Math.max(0, earned / Math.max(1, range))),
    pointsToNext: Math.max(0, next.minPoints - safePoints),
  };
};

export interface DonatePointsParams {
  partnerKey: string;
  points: number;
  note?: string;
}

export interface DonatePointsResult {
  remainingPoints: number;
}

export const donatePoints = async (params: DonatePointsParams): Promise<DonatePointsResult> => {
  const { data, error } = await supabase.rpc('donate_points', {
    p_partner_key: params.partnerKey,
    p_points: params.points,
    p_note: params.note ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    remainingPoints: typeof data === 'number' ? data : 0,
  };
};

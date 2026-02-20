import { supabase } from '../supabase';
import type {
  CreateRescueTaskParams,
  RescueTask,
  RescueTaskStatus,
  RescueTaskType,
} from '../../types';

interface RescueTaskClaimRow {
  task_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'completed';
  completed_note: string | null;
}

const mapTaskRowBase = (row: Record<string, unknown>): RescueTask => ({
  id: row.id as string,
  creatorId: row.creator_id as string,
  title: row.title as string,
  taskType: row.task_type as RescueTaskType,
  description: (row.description as string | null) ?? null,
  locationText: (row.location_text as string | null) ?? null,
  latitude: (row.latitude as number | null) ?? null,
  longitude: (row.longitude as number | null) ?? null,
  windowStart: row.window_start as string,
  windowEnd: row.window_end as string,
  status: row.status as RescueTaskStatus,
  assigneeId: (row.assignee_id as string | null) ?? null,
  assigneeName: null,
  assignees: [],
  pendingApplicants: [],
  maxAssignees: (row.max_assignees as number) ?? 1,
  claimedCount: (row.claimed_count as number) ?? 0,
  claimedByMe: false,
  appliedByMe: false,
  completedNote: (row.completed_note as string | null) ?? null,
  completedAt: (row.completed_at as string | null) ?? null,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const hydrateTaskRelations = async (
  tasks: RescueTask[],
  currentUserId?: string
): Promise<RescueTask[]> => {
  if (tasks.length === 0) return tasks;

  const taskIds = tasks.map(task => task.id);
  const { data: claimRows, error: claimsError } = await supabase
    .from('rescue_task_claims')
    .select('task_id,user_id,status,completed_note')
    .in('task_id', taskIds);

  if (claimsError) throw new Error(claimsError.message);

  const claims = (claimRows ?? []) as RescueTaskClaimRow[];
  const userIds = Array.from(new Set(claims.map(row => row.user_id).filter(Boolean)));

  let profileMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id,nickname')
      .in('id', userIds);

    if (profileError) throw new Error(profileError.message);
    profileMap = new Map((profiles ?? []).map(row => [row.id as string, (row.nickname as string) ?? '志愿者']));
  }

  return tasks.map(task => {
    const taskClaims = claims.filter(claim => claim.task_id === task.id);
    const approvedClaims = taskClaims.filter(
      claim => claim.status === 'approved' || claim.status === 'completed'
    );
    const assignees = approvedClaims.map(claim => ({
      userId: claim.user_id,
      nickname: profileMap.get(claim.user_id) ?? '志愿者',
      status: claim.status as 'approved' | 'completed',
    }));
    const pendingApplicants = taskClaims
      .filter(claim => claim.status === 'pending')
      .map(claim => ({
        userId: claim.user_id,
        nickname: profileMap.get(claim.user_id) ?? '志愿者',
      }));

    const primary = assignees[0];
    return {
      ...task,
      assigneeId: primary?.userId ?? null,
      assigneeName: primary?.nickname ?? null,
      assignees,
      pendingApplicants,
      claimedCount: assignees.length,
      claimedByMe: Boolean(currentUserId && assignees.some(item => item.userId === currentUserId)),
      appliedByMe: Boolean(
        currentUserId && taskClaims.some(item => item.user_id === currentUserId && item.status === 'pending')
      ),
    };
  });
};

const syncTaskClaimSummary = async (taskId: string): Promise<void> => {
  const { data: claimRows, error: claimError } = await supabase
    .from('rescue_task_claims')
    .select('status')
    .eq('task_id', taskId);

  if (claimError) throw new Error(claimError.message);

  const claims = (claimRows ?? []) as Array<{ status: 'pending' | 'approved' | 'completed' }>;
  const activeCount = claims.filter(item => item.status === 'approved' || item.status === 'completed').length;
  const inProgressCount = claims.filter(item => item.status === 'approved').length;
  const hasCompleted = claims.some(item => item.status === 'completed');

  const nextStatus: RescueTaskStatus = inProgressCount > 0 ? 'claimed' : hasCompleted ? 'completed' : 'open';
  const nextCompletedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

  const { error: updateError } = await supabase
    .from('rescue_tasks')
    .update({
      claimed_count: activeCount,
      status: nextStatus,
      completed_at: nextCompletedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (updateError) throw new Error(updateError.message);
};

export const fetchRescueTasks = async (
  status?: RescueTaskStatus,
  currentUserId?: string
): Promise<RescueTask[]> => {
  let query = supabase
    .from('rescue_tasks')
    .select('*')
    .order('window_start', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const tasks = (data ?? []).map(row => mapTaskRowBase(row as Record<string, unknown>));
  return hydrateTaskRelations(tasks, currentUserId);
};

export const fetchRescueTaskById = async (
  id: string,
  currentUserId?: string
): Promise<RescueTask | null> => {
  const { data, error } = await supabase
    .from('rescue_tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [task] = await hydrateTaskRelations([mapTaskRowBase(data as Record<string, unknown>)], currentUserId);
  return task;
};

export const createRescueTask = async (
  params: CreateRescueTaskParams,
  creatorId: string
): Promise<RescueTask> => {
  const { data, error } = await supabase
    .from('rescue_tasks')
    .insert({
      creator_id: creatorId,
      title: params.title,
      task_type: params.taskType,
      description: params.description ?? null,
      location_text: params.locationText ?? null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      window_start: params.windowStart,
      window_end: params.windowEnd,
      status: 'open',
      max_assignees: params.maxAssignees,
      claimed_count: 0,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? '创建任务失败');
  const [task] = await hydrateTaskRelations([mapTaskRowBase(data as Record<string, unknown>)], creatorId);
  return task;
};

export const applyRescueTask = async (taskId: string, userId: string): Promise<RescueTask> => {
  const current = await fetchRescueTaskById(taskId, userId);
  if (!current) throw new Error('任务不存在');
  if (current.status === 'cancelled' || current.status === 'completed') {
    throw new Error('任务已结束，无法申请');
  }
  if (current.claimedByMe || current.appliedByMe) {
    throw new Error('你已申请过该任务');
  }
  if (current.claimedCount >= current.maxAssignees) {
    throw new Error('任务已达到人数上限，暂不可申请');
  }

  const { error: claimError } = await supabase
    .from('rescue_task_claims')
    .insert({
      task_id: taskId,
      user_id: userId,
      status: 'pending',
    });

  if (claimError) {
    const msg = claimError.message.toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      throw new Error('你已申请过该任务');
    }
    throw new Error(claimError.message);
  }

  const latest = await fetchRescueTaskById(taskId, userId);
  if (!latest) throw new Error('任务状态刷新失败');
  return latest;
};

export const approveRescueTaskApplicant = async (
  taskId: string,
  applicantId: string,
  reviewerId: string
): Promise<RescueTask> => {
  const current = await fetchRescueTaskById(taskId, reviewerId);
  if (!current) throw new Error('任务不存在');
  if (current.creatorId !== reviewerId) throw new Error('仅发布者可审核申请');
  if (current.status === 'cancelled' || current.status === 'completed') throw new Error('任务已结束，无法审核');
  if (current.claimedCount >= current.maxAssignees) throw new Error('任务人数已满，无法继续通过');

  const { data, error } = await supabase
    .from('rescue_task_claims')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('task_id', taskId)
    .eq('user_id', applicantId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('该申请不存在或已被处理');

  await syncTaskClaimSummary(taskId);

  const latest = await fetchRescueTaskById(taskId, reviewerId);
  if (!latest) throw new Error('任务状态刷新失败');
  return latest;
};

export const completeRescueTask = async (
  taskId: string,
  userId: string,
  note: string
): Promise<RescueTask> => {
  const { data: claim, error: claimFetchError } = await supabase
    .from('rescue_task_claims')
    .select('id,status')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (claimFetchError) throw new Error(claimFetchError.message);
  if (!claim || claim.status !== 'approved') throw new Error('仅审核通过的接单人可提交完成反馈');

  const now = new Date().toISOString();
  const { error: claimUpdateError } = await supabase
    .from('rescue_task_claims')
    .update({
      status: 'completed',
      completed_note: note.trim(),
      completed_at: now,
      updated_at: now,
    })
    .eq('id', claim.id as string);

  if (claimUpdateError) throw new Error(claimUpdateError.message);

  await syncTaskClaimSummary(taskId);

  const { error: taskError } = await supabase
    .from('rescue_tasks')
    .update({
      completed_note: note.trim(),
      updated_at: now,
    })
    .eq('id', taskId);

  if (taskError) throw new Error(taskError.message);

  const latest = await fetchRescueTaskById(taskId, userId);
  if (!latest) throw new Error('任务状态刷新失败');
  return latest;
};

export const cancelRescueTask = async (taskId: string, userId: string): Promise<RescueTask> => {
  const { data, error } = await supabase
    .from('rescue_tasks')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('creator_id', userId)
    .in('status', ['open', 'claimed'])
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('仅任务发起人可取消未完成任务');

  const latest = await fetchRescueTaskById(taskId, userId);
  if (!latest) throw new Error('任务状态刷新失败');
  return latest;
};

export const creatorCompleteTask = async (taskId: string, userId: string): Promise<RescueTask> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('rescue_tasks')
    .update({
      status: 'completed',
      completed_at: now,
      updated_at: now,
    })
    .eq('id', taskId)
    .eq('creator_id', userId)
    .eq('status', 'claimed')
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('仅任务发起人可在执行中状态结束任务');

  const latest = await fetchRescueTaskById(taskId, userId);
  if (!latest) throw new Error('任务状态刷新失败');
  return latest;
};

export const claimRescueTask = applyRescueTask;

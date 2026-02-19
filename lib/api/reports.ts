import { supabase } from '../supabase';

export interface SubmitReportParams {
  reporterId: string;
  targetType: 'user' | 'pet' | 'message';
  targetId: string;
  reason: string;
  detail?: string;
}

/** 提交举报 */
export const submitReport = async (params: SubmitReportParams): Promise<void> => {
  const { error } = await supabase.from('reports').insert({
    reporter_id: params.reporterId,
    target_type: params.targetType,
    target_id: params.targetId,
    reason: params.reason,
    detail: params.detail ?? '',
  });
  if (error) throw new Error(error.message);
};

/** 屏蔽用户 */
export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const { error } = await supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });
  if (error && !error.message.includes('unique')) throw new Error(error.message);
};

/** 取消屏蔽 */
export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw new Error(error.message);
};

/** 检查是否已屏蔽某用户 */
export const checkIsBlocked = async (blockerId: string, blockedId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  if (error) return false;
  return !!data;
};

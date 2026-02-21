import { supabase } from '../supabase';
import type {
  ExpertProfile,
  ExpertWithProfile,
  ExpertTip,
  ExpertEarning,
  ExpertCertificationType,
  ExpertLevel,
} from '../../types';

const mapRowToExpertProfile = (row: Record<string, unknown>): ExpertProfile => ({
  id: row.id as string,
  userId: row.user_id as string,
  level: (row.level as ExpertLevel) ?? 'bronze',
  certificationType: (row.certification_type as ExpertCertificationType) ?? 'trainer',
  columnBio: (row.column_bio as string) ?? '',
  status: (row.status as ExpertProfile['status']) ?? 'pending',
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapRowToExpertTip = (row: Record<string, unknown>): ExpertTip => ({
  id: row.id as string,
  tipperId: row.tipper_id as string,
  expertId: row.expert_id as string,
  points: (row.points as number) ?? 0,
  platformTake: (row.platform_take as number) ?? 0,
  expertReceived: (row.expert_received as number) ?? 0,
  createdAt: row.created_at as string,
});

const mapRowToExpertEarning = (row: Record<string, unknown>): ExpertEarning => ({
  id: row.id as string,
  expertId: row.expert_id as string,
  source: 'tip',
  amount: (row.amount as number) ?? 0,
  tipId: (row.tip_id as string | null) ?? null,
  createdAt: row.created_at as string,
});

const CERTIFICATION_LABELS: Record<ExpertCertificationType, string> = {
  trainer: '金牌训练师',
  nutritionist: '营养师',
  medical_volunteer: '医疗志愿者',
};

export const getCertificationLabel = (type: ExpertCertificationType): string =>
  CERTIFICATION_LABELS[type] ?? type;

/** 获取达人列表（仅已审核通过） */
export const fetchExpertList = async (params?: {
  limit?: number;
  offset?: number;
  currentUserId?: string;
}): Promise<ExpertWithProfile[]> => {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const { data: rows, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const userIds = rows.map((r: Record<string, unknown>) => r.user_id as string);

  // 并行执行三个查询
  const [profilesResult, followCountsResult, myFollowsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nickname, avatar_url, bio, city')
      .in('id', userIds),
    supabase
      .from('expert_follows')
      .select('expert_id'),
    params?.currentUserId
      ? supabase
          .from('expert_follows')
          .select('expert_id')
          .eq('follower_id', params.currentUserId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profileMap = new Map(
    (profilesResult.data ?? []).map((p: Record<string, unknown>) => [
      p.id as string,
      {
        nickname: (p.nickname as string) ?? '达人',
        avatarUrl: (p.avatar_url as string) ?? '',
        bio: (p.bio as string) ?? '',
        city: (p.city as string) ?? '',
      },
    ])
  );

  const followCountMap = new Map<string, number>();
  (followCountsResult.data ?? []).forEach((row: Record<string, unknown>) => {
    const eid = row.expert_id as string;
    followCountMap.set(eid, (followCountMap.get(eid) ?? 0) + 1);
  });

  const followingSet = new Set(
    (myFollowsResult.data ?? []).map((r: Record<string, unknown>) => r.expert_id as string)
  );

  return rows.map((row: Record<string, unknown>) => {
    const ep = mapRowToExpertProfile(row);
    const p = profileMap.get(ep.userId) ?? { nickname: '达人', avatarUrl: '', bio: '', city: '' };
    return {
      ...ep,
      nickname: p.nickname,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      city: p.city,
      followerCount: followCountMap.get(ep.userId) ?? 0,
      isFollowing: followingSet.has(ep.userId),
    };
  });
};

/** 获取精选达人（首页运营位） */
export const fetchFeaturedExperts = async (limit = 4): Promise<ExpertWithProfile[]> =>
  fetchExpertList({ limit, offset: 0 });

/** 获取单个达人详情 */
export const fetchExpertById = async (
  expertUserId: string,
  currentUserId?: string
): Promise<ExpertWithProfile | null> => {
  // 并行执行所有查询
  const [expertResult, profileResult, followCountResult, isFollowingResult] = await Promise.all([
    supabase
      .from('expert_profiles')
      .select('*')
      .eq('user_id', expertUserId)
      .eq('status', 'approved')
      .single(),
    supabase
      .from('profiles')
      .select('id, nickname, avatar_url, bio, city')
      .eq('id', expertUserId)
      .single(),
    supabase
      .from('expert_follows')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', expertUserId),
    currentUserId
      ? supabase
          .from('expert_follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('expert_id', expertUserId)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (expertResult.error || !expertResult.data) return null;

  const row = expertResult.data;
  const profile = profileResult.data as Record<string, unknown> | null;
  const isFollowing = !!isFollowingResult.data;

  const ep = mapRowToExpertProfile(row as Record<string, unknown>);
  return {
    ...ep,
    nickname: (profile?.nickname as string) ?? '达人',
    avatarUrl: (profile?.avatar_url as string) ?? '',
    bio: (profile?.bio as string) ?? '',
    city: (profile?.city as string) ?? '',
    followerCount: followCountResult.count ?? 0,
    isFollowing,
  };
};

export interface ApplyExpertParams {
  certificationType: ExpertCertificationType;
  columnBio: string;
}

/** 申请达人认证 */
export const applyExpert = async (params: ApplyExpertParams, userId: string): Promise<ExpertProfile> => {
  const { data, error } = await supabase
    .from('expert_profiles')
    .insert({
      user_id: userId,
      certification_type: params.certificationType,
      column_bio: params.columnBio,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapRowToExpertProfile((data ?? {}) as Record<string, unknown>);
};

/** 关注达人 */
export const followExpert = async (followerId: string, expertId: string): Promise<void> => {
  const { error } = await supabase.from('expert_follows').insert({
    follower_id: followerId,
    expert_id: expertId,
  });
  if (error) throw new Error(error.message);
};

/** 取消关注 */
export const unfollowExpert = async (followerId: string, expertId: string): Promise<void> => {
  const { error } = await supabase
    .from('expert_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('expert_id', expertId);
  if (error) throw new Error(error.message);
};

/** 检查是否已关注 */
export const checkIsFollowingExpert = async (
  followerId: string,
  expertId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('expert_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('expert_id', expertId)
    .single();
  if (error) return false;
  return !!data;
};

export interface TipExpertResult {
  remainingPoints: number;
}

/** 打赏达人 */
export const tipExpert = async (
  expertId: string,
  points: number,
  _tipperId: string
): Promise<TipExpertResult> => {
  const { data, error } = await supabase.rpc('tip_expert', {
    p_expert_id: expertId,
    p_points: points,
  });

  if (error) throw new Error(error.message);
  return {
    remainingPoints: typeof data === 'number' ? data : 0,
  };
};

/** 获取达人收益流水（仅达人本人可查） */
export const fetchExpertEarnings = async (
  expertId: string,
  limit = 50
): Promise<ExpertEarning[]> => {
  const { data, error } = await supabase
    .from('expert_earnings')
    .select('*')
    .eq('expert_id', expertId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRowToExpertEarning(row as Record<string, unknown>));
};

/** 获取达人收到的打赏记录 */
export const fetchExpertTipsReceived = async (
  expertId: string,
  limit = 20
): Promise<ExpertTip[]> => {
  const { data, error } = await supabase
    .from('expert_tips')
    .select('*')
    .eq('expert_id', expertId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRowToExpertTip(row as Record<string, unknown>));
};

/** 获取当前用户的达人申请状态 */
export const fetchMyExpertApplication = async (
  userId: string
): Promise<ExpertProfile | null> => {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return mapRowToExpertProfile(data as Record<string, unknown>);
};

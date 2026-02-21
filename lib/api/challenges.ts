import { supabase } from '../supabase';
import { grantPoints } from './points';
import type {
  Challenge,
  ChallengeParticipant,
  ChallengeTeam,
  AchievementBadge,
  ChallengeStatus,
  ChallengeRewardType,
  JoinChallengeParams,
  CreateChallengeTeamParams,
} from '../../types';

const mapRowToChallenge = (row: Record<string, unknown>): Challenge => ({
  id: row.id as string,
  title: (row.title as string) ?? '',
  description: (row.description as string) ?? '',
  cityName: (row.city_name as string) ?? '',
  rewardType: (row.reward_type as ChallengeRewardType) ?? 'points',
  rewardValue: (row.reward_value as number) ?? 0,
  rewardDesc: (row.reward_desc as string | null) ?? null,
  minTeamSize: (row.min_team_size as number) ?? 1,
  maxTeamSize: (row.max_team_size as number) ?? 5,
  sponsorName: (row.sponsor_name as string | null) ?? null,
  status: (row.status as ChallengeStatus) ?? 'active',
  startAt: row.start_at as string,
  endAt: row.end_at as string,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapRowToParticipant = (row: Record<string, unknown>): ChallengeParticipant => ({
  id: row.id as string,
  challengeId: row.challenge_id as string,
  userId: row.user_id as string,
  teamId: (row.team_id as string | null) ?? null,
  score: (row.score as number) ?? 0,
  status: (row.status as ChallengeParticipant['status']) ?? 'joined',
  joinedAt: row.joined_at as string,
  completedAt: (row.completed_at as string | null) ?? null,
  nickname: row.nickname as string | undefined,
  avatarUrl: row.avatar_url as string | undefined,
  teamName: row.team_name as string | undefined,
  rank: row.rank as number | undefined,
});

const mapRowToTeam = (row: Record<string, unknown>): ChallengeTeam => ({
  id: row.id as string,
  challengeId: row.challenge_id as string,
  name: (row.name as string) ?? '',
  leaderId: row.leader_id as string,
  memberCount: (row.member_count as number) ?? 0,
  totalScore: (row.total_score as number) ?? 0,
  leaderNickname: row.leader_nickname as string | undefined,
  leaderAvatarUrl: row.leader_avatar_url as string | undefined,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapRowToBadge = (row: Record<string, unknown>): AchievementBadge => ({
  id: row.id as string,
  userId: row.user_id as string,
  badgeKey: (row.badge_key as string) ?? '',
  title: (row.title as string) ?? '',
  description: (row.description as string) ?? '',
  challengeId: (row.challenge_id as string | null) ?? null,
  imageUrl: (row.image_url as string | null) ?? null,
  earnedAt: row.earned_at as string,
  createdAt: row.created_at as string,
});

export const REWARD_TYPE_LABELS: Record<ChallengeRewardType, string> = {
  points: '积分',
  points_double: '积分翻倍',
  merch: '周边',
  cash: '现金',
};

/** 获取挑战赛列表（月度城市挑战） */
export const fetchChallenges = async (params?: {
  status?: ChallengeStatus;
  cityName?: string;
  limit?: number;
  currentUserId?: string;
}): Promise<Challenge[]> => {
  let q = supabase
    .from('challenges')
    .select('*')
    .order('start_at', { ascending: false });

  if (params?.status) {
    q = q.eq('status', params.status);
  }
  if (params?.cityName) {
    q = q.eq('city_name', params.cityName);
  }

  const limit = params?.limit ?? 20;
  q = q.limit(limit);

  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const challenges = rows.map((r) => mapRowToChallenge(r as Record<string, unknown>));
  const ids = challenges.map((c) => c.id);

  // 参与人数
  const { data: counts } = await supabase
    .from('challenge_participants')
    .select('challenge_id');
  const countMap = new Map<string, number>();
  (counts ?? []).forEach((row: Record<string, unknown>) => {
    const cid = row.challenge_id as string;
    countMap.set(cid, (countMap.get(cid) ?? 0) + 1);
  });

  // 当前用户参与状态
  let myParticipantMap = new Map<string, ChallengeParticipant>();
  if (params?.currentUserId) {
    const { data: myParts } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('user_id', params.currentUserId)
      .in('challenge_id', ids);
    (myParts ?? []).forEach((row: Record<string, unknown>) => {
      const p = mapRowToParticipant(row);
      myParticipantMap.set(p.challengeId, p);
    });
  }

  return challenges.map((c) => ({
    ...c,
    participantCount: countMap.get(c.id) ?? 0,
    myParticipant: myParticipantMap.get(c.id) ?? null,
  }));
};

/** 获取单个挑战赛详情 */
export const fetchChallengeById = async (
  id: string,
  currentUserId?: string
): Promise<Challenge | null> => {
  const { data: row, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !row) return null;

  const challenge = mapRowToChallenge(row as Record<string, unknown>);

  const { count } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id);
  challenge.participantCount = count ?? 0;

  if (currentUserId) {
    const { data: myPart } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', id)
      .eq('user_id', currentUserId)
      .single();
    if (myPart) {
      challenge.myParticipant = mapRowToParticipant(myPart as Record<string, unknown>);
    }
  }

  return challenge;
};

/** 参与挑战 */
export const joinChallenge = async (
  params: JoinChallengeParams,
  userId: string
): Promise<ChallengeParticipant> => {
  const { data, error } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: params.challengeId,
      user_id: userId,
      team_id: params.teamId ?? null,
      status: 'joined',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapRowToParticipant((data ?? {}) as Record<string, unknown>);
};

/** 创建小队 */
export const createChallengeTeam = async (
  params: CreateChallengeTeamParams,
  userId: string
): Promise<ChallengeTeam> => {
  const { data: team, error: teamErr } = await supabase
    .from('challenge_teams')
    .insert({
      challenge_id: params.challengeId,
      name: params.name,
      leader_id: userId,
    })
    .select('*')
    .single();

  if (teamErr) throw new Error(teamErr.message);

  const t = team as Record<string, unknown>;
  const teamId = t.id as string;

  // 队长自动加入参与记录并关联小队
  await supabase
    .from('challenge_participants')
    .upsert(
      {
        challenge_id: params.challengeId,
        user_id: userId,
        team_id: teamId,
        status: 'joined',
      },
      { onConflict: 'challenge_id,user_id' }
    );

  return mapRowToTeam({ ...t, member_count: 1, total_score: 0 });
};

/** 加入小队 */
export const joinChallengeTeam = async (
  teamId: string,
  challengeId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('challenge_participants')
    .update({ team_id: teamId })
    .eq('challenge_id', challengeId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

/** 获取挑战赛排行榜 */
export const fetchChallengeLeaderboard = async (
  challengeId: string,
  limit = 20
): Promise<ChallengeParticipant[]> => {
  const { data: rows, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const userIds = rows.map((r: Record<string, unknown>) => r.user_id as string);
  const teamIds = rows.map((r: Record<string, unknown>) => r.team_id as string).filter(Boolean);

  const [profRes, teamRes] = await Promise.all([
    supabase.from('profiles').select('id, nickname, avatar_url').in('id', userIds),
    teamIds.length > 0
      ? supabase.from('challenge_teams').select('id, name').in('id', teamIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map(
    (profRes.data ?? []).map((p: Record<string, unknown>) => [
      p.id as string,
      { nickname: p.nickname as string, avatarUrl: p.avatar_url as string },
    ])
  );
  const teamMap = new Map(
    (teamRes.data ?? []).map((t: Record<string, unknown>) => [t.id as string, t.name as string])
  );

  return rows.map((row, idx) => {
    const p = mapRowToParticipant(row as Record<string, unknown>);
    const prof = profileMap.get(p.userId);
    if (prof) {
      p.nickname = prof.nickname;
      p.avatarUrl = prof.avatarUrl;
    }
    if (p.teamId) p.teamName = teamMap.get(p.teamId);
    p.rank = idx + 1;
    return p;
  });
};

/** 获取挑战赛小队列表 */
export const fetchChallengeTeams = async (challengeId: string): Promise<ChallengeTeam[]> => {
  const { data: rows, error } = await supabase
    .from('challenge_teams')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const teamIds = rows.map((r: Record<string, unknown>) => r.id as string);
  const leaderIds = rows.map((r: Record<string, unknown>) => r.leader_id as string);

  const [countRes, scoreRes, profRes] = await Promise.all([
    supabase.from('challenge_participants').select('team_id').in('team_id', teamIds),
    supabase.from('challenge_participants').select('team_id, score').in('team_id', teamIds),
    supabase.from('profiles').select('id, nickname, avatar_url').in('id', leaderIds),
  ]);

  const countMap = new Map<string, number>();
  (countRes.data ?? []).forEach((row: Record<string, unknown>) => {
    const tid = row.team_id as string;
    if (tid) countMap.set(tid, (countMap.get(tid) ?? 0) + 1);
  });
  const scoreMap = new Map<string, number>();
  (scoreRes.data ?? []).forEach((row: Record<string, unknown>) => {
    const tid = row.team_id as string;
    if (tid) scoreMap.set(tid, (scoreMap.get(tid) ?? 0) + (row.score as number));
  });
  const profileMap = new Map(
    (profRes.data ?? []).map((p: Record<string, unknown>) => [
      p.id as string,
      { nickname: p.nickname as string, avatarUrl: p.avatar_url as string },
    ])
  );

  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    const leaderId = row.leader_id as string;
    const prof = profileMap.get(leaderId);
    return mapRowToTeam({
      ...row,
      member_count: countMap.get(row.id as string) ?? 0,
      total_score: scoreMap.get(row.id as string) ?? 0,
      leader_nickname: prof?.nickname,
      leader_avatar_url: prof?.avatarUrl,
    });
  });
};

/** 获取小队成员列表 */
export const fetchTeamMembers = async (teamId: string): Promise<ChallengeParticipant[]> => {
  const { data: rows, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('team_id', teamId)
    .order('score', { ascending: false });

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const userIds = rows.map((r: Record<string, unknown>) => r.user_id as string);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: Record<string, unknown>) => [
      p.id as string,
      { nickname: p.nickname as string, avatarUrl: p.avatar_url as string },
    ])
  );

  return rows.map((row, idx) => {
    const p = mapRowToParticipant(row as Record<string, unknown>);
    const prof = profileMap.get(p.userId);
    if (prof) {
      p.nickname = prof.nickname;
      p.avatarUrl = prof.avatarUrl;
    }
    p.rank = idx + 1;
    return p;
  });
};

/** 获取用户成就徽章 */
export const fetchUserBadges = async (userId: string): Promise<AchievementBadge[]> => {
  const { data, error } = await supabase
    .from('achievement_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRowToBadge(r as Record<string, unknown>));
};

/** 发放挑战完成奖励（积分） */
export const grantChallengeReward = async (
  userId: string,
  challengeId: string,
  points: number
): Promise<void> => {
  await grantPoints({
    taskKey: `challenge:${challengeId}`,
    points,
  });
};

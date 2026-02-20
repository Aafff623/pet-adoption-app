import { supabase } from '../supabase';
import type {
  LostPetAlert,
  LostPetSighting,
  CreateLostAlertParams,
  SubmitSightingParams,
  LostPetGender,
} from '../../types';

// ============================================================
// 字段映射
// ============================================================
const mapRowToAlert = (row: Record<string, unknown>): LostPetAlert => ({
  id: row.id as string,
  userId: row.user_id as string,
  petName: row.pet_name as string,
  petType: row.pet_type as string,
  petBreed: (row.pet_breed as string | null) ?? null,
  petColor: (row.pet_color as string | null) ?? null,
  petGender: (row.pet_gender as LostPetGender | null) ?? null,
  petAgeText: (row.pet_age_text as string | null) ?? null,
  avatarUrl: (row.avatar_url as string | null) ?? null,
  description: row.description as string,
  lostAt: row.lost_at as string,
  lastSeenAt: (row.last_seen_at as string | null) ?? null,
  locationText: (row.location_text as string | null) ?? null,
  latitude: (row.latitude as number | null) ?? null,
  longitude: (row.longitude as number | null) ?? null,
  radiusKm: (row.radius_km as number) ?? 10,
  rewardText: (row.reward_text as string | null) ?? null,
  contactNote: (row.contact_note as string | null) ?? null,
  status: row.status as 'active' | 'closed',
  isUrgent: row.is_urgent as boolean,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
  closedAt: (row.closed_at as string | null) ?? null,
});

const mapRowToSighting = (row: Record<string, unknown>): LostPetSighting => ({
  id: row.id as string,
  alertId: row.alert_id as string,
  reporterId: row.reporter_id as string,
  sightingNote: row.sighting_note as string,
  locationText: (row.location_text as string | null) ?? null,
  latitude: (row.latitude as number | null) ?? null,
  longitude: (row.longitude as number | null) ?? null,
  sightedAt: row.sighted_at as string,
  contactHint: (row.contact_hint as string | null) ?? null,
  createdAt: row.created_at as string,
});

// ============================================================
// Haversine 距离计算（km）
// ============================================================
export const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================
// 查询
// ============================================================

/** 拉取 active 警报列表（客户端再做半径精筛） */
export const fetchLostAlerts = async (params?: {
  userLat?: number;
  userLon?: number;
  radiusKm?: number;
}): Promise<LostPetAlert[]> => {
  const { data, error } = await supabase
    .from('lost_pet_alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const alerts = (data ?? []).map(row =>
    mapRowToAlert(row as Record<string, unknown>)
  );

  // 若有定位信息则做半径精筛
  if (
    params?.userLat != null &&
    params?.userLon != null &&
    params?.radiusKm != null
  ) {
    return alerts.filter(a => {
      if (a.latitude == null || a.longitude == null) return true; // 无坐标不过滤
      return (
        haversineKm(params.userLat!, params.userLon!, a.latitude, a.longitude) <=
        params.radiusKm!
      );
    });
  }
  return alerts;
};

/** 获取我发布的警报 */
export const fetchMyLostAlerts = async (userId: string): Promise<LostPetAlert[]> => {
  const { data, error } = await supabase
    .from('lost_pet_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapRowToAlert(row as Record<string, unknown>));
};

/** 获取单条警报详情 */
export const fetchLostAlertById = async (id: string): Promise<LostPetAlert | null> => {
  const { data, error } = await supabase
    .from('lost_pet_alerts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRowToAlert(data as Record<string, unknown>);
};

/** 获取警报的线索列表 */
export const fetchSightingsByAlertId = async (alertId: string): Promise<LostPetSighting[]> => {
  const { data, error } = await supabase
    .from('lost_pet_sightings')
    .select('*')
    .eq('alert_id', alertId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapRowToSighting(row as Record<string, unknown>));
};

// ============================================================
// 写入
// ============================================================

/** 发布失踪警报 */
export const createLostAlert = async (
  params: CreateLostAlertParams,
  userId: string
): Promise<LostPetAlert> => {
  const { data, error } = await supabase
    .from('lost_pet_alerts')
    .insert({
      user_id: userId,
      pet_name: params.petName,
      pet_type: params.petType,
      pet_breed: params.petBreed ?? null,
      pet_color: params.petColor ?? null,
      pet_gender: params.petGender ?? null,
      pet_age_text: params.petAgeText ?? null,
      avatar_url: params.avatarUrl ?? null,
      description: params.description,
      lost_at: params.lostAt,
      last_seen_at: params.lastSeenAt ?? null,
      location_text: params.locationText ?? null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      radius_km: params.radiusKm,
      reward_text: params.rewardText ?? null,
      contact_note: params.contactNote ?? null,
      is_urgent: params.isUrgent,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToAlert(data as Record<string, unknown>);
};

/** 提交线索 */
export const submitSighting = async (
  params: SubmitSightingParams,
  reporterId: string
): Promise<LostPetSighting> => {
  const { data, error } = await supabase
    .from('lost_pet_sightings')
    .insert({
      alert_id: params.alertId,
      reporter_id: reporterId,
      sighting_note: params.sightingNote,
      location_text: params.locationText ?? null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      sighted_at: params.sightedAt,
      contact_hint: params.contactHint ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToSighting(data as Record<string, unknown>);
};

/** 关闭警报 */
export const closeLostAlert = async (alertId: string): Promise<void> => {
  const { error } = await supabase
    .from('lost_pet_alerts')
    .update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw new Error(error.message);
};

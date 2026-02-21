import { supabase } from '../supabase';
import type {
  Store,
  StoreBooking,
  StoreBookingWithStore,
  StoreMembership,
  StoreStaff,
  StoreType,
  StoreServiceType,
} from '../../types';

const mapRowToStore = (row: Record<string, unknown>): Store => ({
  id: row.id as string,
  name: row.name as string,
  storeType: (row.store_type as StoreType) ?? 'clinic',
  address: (row.address as string) ?? '',
  province: (row.province as string) ?? undefined,
  cityName: (row.city_name as string) ?? undefined,
  latitude: (row.latitude as number | null) ?? null,
  longitude: (row.longitude as number | null) ?? null,
  coverImage: (row.cover_image as string) ?? '',
  description: (row.description as string) ?? '',
  businessHours: (row.business_hours as string) ?? '',
  contactPhone: (row.contact_phone as string) ?? '',
  isActive: (row.is_active as boolean) ?? true,
  sortOrder: (row.sort_order as number) ?? 0,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapRowToStoreBooking = (row: Record<string, unknown>): StoreBooking => ({
  id: row.id as string,
  userId: row.user_id as string,
  storeId: row.store_id as string,
  petId: (row.pet_id as string | null) ?? null,
  serviceType: (row.service_type as StoreServiceType) ?? 'visit',
  bookingAt: row.booking_at as string,
  status: (row.status as StoreBooking['status']) ?? 'pending',
  pointsUsed: (row.points_used as number) ?? 0,
  couponCode: (row.coupon_code as string | null) ?? null,
  note: (row.note as string | null) ?? null,
  verifiedAt: (row.verified_at as string | null) ?? null,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapRowToStoreMembership = (row: Record<string, unknown>): StoreMembership => ({
  id: row.id as string,
  userId: row.user_id as string,
  storeId: row.store_id as string,
  membershipType: (row.membership_type as StoreMembership['membershipType']) ?? 'basic',
  points: (row.points as number) ?? 0,
  validUntil: (row.valid_until as string | null) ?? null,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const STORE_TYPE_LABELS: Record<StoreType, string> = {
  hospital: '宠物医院',
  clinic: '宠物诊所',
  grooming: '宠物美容',
  training: '训练基地',
  other: '其他',
};

export const getStoreTypeLabel = (type: StoreType): string => STORE_TYPE_LABELS[type] ?? type;

const SERVICE_TYPE_LABELS: Record<StoreServiceType, string> = {
  visit: '到店体验',
  grooming: '美容护理',
  training: '训练课程',
  checkup: '健康体检',
  other: '其他服务',
};

export const getServiceTypeLabel = (type: StoreServiceType): string =>
  SERVICE_TYPE_LABELS[type] ?? type;

/** 获取门店列表 */
export const fetchStoreList = async (params?: {
  province?: string;
  cityName?: string;
  storeType?: StoreType;
  limit?: number;
  offset?: number;
}): Promise<Store[]> => {
  let q = supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (params?.province) q = q.eq('province', params.province);
  if (params?.cityName) q = q.eq('city_name', params.cityName);
  if (params?.storeType) q = q.eq('store_type', params.storeType);

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRowToStore(row as Record<string, unknown>));
};

/** 获取单个门店详情 */
export const fetchStoreById = async (storeId: string): Promise<Store | null> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return mapRowToStore(data as Record<string, unknown>);
};

export interface CreateStoreBookingParams {
  storeId: string;
  serviceType: StoreServiceType;
  bookingAt: string;
  petId?: string;
  pointsCost?: number;
  note?: string;
}

/** 创建预约（积分核销） */
export const createStoreBooking = async (
  params: CreateStoreBookingParams,
  userId: string
): Promise<string> => {
  const { data, error } = await supabase.rpc('store_booking_redeem', {
    p_store_id: params.storeId,
    p_service_type: params.serviceType,
    p_booking_at: params.bookingAt,
    p_pet_id: params.petId ?? null,
    p_points_cost: params.pointsCost ?? 0,
    p_note: params.note ?? '',
  });

  if (error) throw new Error(error.message);
  return data as string;
};

/** 获取用户预约列表 */
export const fetchMyBookings = async (
  userId: string,
  params?: { status?: StoreBooking['status']; limit?: number }
): Promise<StoreBookingWithStore[]> => {
  const { data: rows, error } = await supabase
    .from('store_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(params?.limit ?? 20);

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return [];

  const storeIds = [...new Set(rows.map((r: Record<string, unknown>) => r.store_id as string))];
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, address')
    .in('id', storeIds);

  const storeMap = new Map(
    (stores ?? []).map((s: Record<string, unknown>) => [
      s.id as string,
      { name: s.name as string, address: s.address as string },
    ])
  );

  let result = rows as Record<string, unknown>[];
  if (params?.status) result = result.filter((r) => r.status === params.status);

  return result.map((row) => {
    const b = mapRowToStoreBooking(row);
    const s = storeMap.get(b.storeId);
    return {
      ...b,
      storeName: s?.name,
      storeAddress: s?.address,
    };
  });
};

/** 核销预约（店员调用） */
export const verifyStoreBooking = async (bookingId: string): Promise<void> => {
  const { error } = await supabase.rpc('store_booking_verify', { p_booking_id: bookingId });
  if (error) throw new Error(error.message);
};

/** 获取门店会员卡 */
export const fetchStoreMembership = async (
  userId: string,
  storeId: string
): Promise<StoreMembership | null> => {
  const { data, error } = await supabase
    .from('store_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('store_id', storeId)
    .single();

  if (error || !data) return null;
  return mapRowToStoreMembership(data as Record<string, unknown>);
};

/** 绑定会员卡（首次到店自动创建 basic） */
export const bindStoreMembership = async (
  userId: string,
  storeId: string,
  membershipType: StoreMembership['membershipType'] = 'basic'
): Promise<StoreMembership> => {
  const { data, error } = await supabase
    .from('store_memberships')
    .upsert(
      {
        user_id: userId,
        store_id: storeId,
        membership_type: membershipType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,store_id' }
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapRowToStoreMembership((data ?? {}) as Record<string, unknown>);
};

/** 获取店员所属门店列表 */
export const fetchStoreStaffStores = async (userId: string): Promise<Store[]> => {
  const { data: staffRows, error: staffError } = await supabase
    .from('store_staff')
    .select('store_id')
    .eq('user_id', userId);

  if (staffError || !staffRows || staffRows.length === 0) return [];

  const storeIds = staffRows.map((r: Record<string, unknown>) => r.store_id as string);
  const { data: storeRows, error } = await supabase
    .from('stores')
    .select('*')
    .in('id', storeIds);

  if (error) throw new Error(error.message);
  return (storeRows ?? []).map((row) => mapRowToStore(row as Record<string, unknown>));
};

/** 获取门店待核销预约列表（店员调用） */
export const fetchStorePendingBookings = async (
  storeId: string,
  staffUserId: string,
  limit = 50
): Promise<StoreBooking[]> => {
  const { data: staff } = await supabase
    .from('store_staff')
    .select('id')
    .eq('store_id', storeId)
    .eq('user_id', staffUserId)
    .single();

  if (!staff) return [];

  const { data, error } = await supabase
    .from('store_bookings')
    .select('*')
    .eq('store_id', storeId)
    .in('status', ['pending', 'confirmed'])
    .order('booking_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRowToStoreBooking(row as Record<string, unknown>));
};

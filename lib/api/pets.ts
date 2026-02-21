import { supabase } from '../supabase';
import type { Pet } from '../../types';

type PetCategory = 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other';

const mapRowToPet = (row: Record<string, unknown>): Pet => ({
  id: row.id as string,
  name: row.name as string,
  breed: row.breed as string,
  age: row.age_text as string,
  distance: row.distance as string,
  gender: row.gender as 'male' | 'female',
  imageUrl: row.image_url as string,
  price: row.price as number,
  location: row.location as string,
  province: (row.province as string | null) ?? '',
  cityName: (row.city_name as string | null) ?? '',
  locationDetail: (row.location_detail as string | null) ?? '',
  weight: row.weight as string,
  description: row.description as string,
  tags: (row.tags as string[]) ?? [],
  isUrgent: row.is_urgent as boolean,
  story: row.story as string,
  health: row.health as Pet['health'],
  fosterParent: {
    name: row.foster_parent_name as string,
    avatar: row.foster_parent_avatar as string,
  },
  category: row.category as PetCategory,
  status: row.status as Pet['status'],
  userId: (row.user_id as string | null) ?? null,
});

export interface FetchPetListParams {
  category?: PetCategory;
  gender?: 'male' | 'female' | 'all';
  isUrgent?: boolean;
  keyword?: string;
  location?: string;
}

export const fetchPetList = async (
  categoryOrParams: PetCategory | FetchPetListParams = 'all'
): Promise<Pet[]> => {
  const params: FetchPetListParams =
    typeof categoryOrParams === 'string'
      ? { category: categoryOrParams }
      : categoryOrParams;

  let query = supabase
    .from('pets')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }
  if (params.gender && params.gender !== 'all') {
    query = query.eq('gender', params.gender);
  }
  if (params.isUrgent) {
    query = query.eq('is_urgent', true);
  }
  if (params.keyword && params.keyword.trim()) {
    const kw = `%${params.keyword.trim()}%`;
    query = query.or(`name.ilike.${kw},breed.ilike.${kw},description.ilike.${kw}`);
  }
  if (params.location && params.location.trim()) {
    const kw = `%${params.location.trim()}%`;
    query = query.or(`location.ilike.${kw},province.ilike.${kw},city_name.ilike.${kw}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapRowToPet(row as Record<string, unknown>));
};

export const fetchRecommendedPet = async (): Promise<Pet | null> => {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('is_urgent', true)
    .eq('status', 'available')
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapRowToPet(data as Record<string, unknown>);
};

export const fetchRecommendedPets = async (limit = 4): Promise<Pet[]> => {
  const { data: urgentData } = await supabase
    .from('pets')
    .select('*')
    .eq('is_urgent', true)
    .eq('status', 'available')
    .limit(limit);

  const urgent = (urgentData ?? []).map(row => mapRowToPet(row as Record<string, unknown>));

  if (urgent.length >= limit) return urgent.slice(0, limit);

  const remaining = limit - urgent.length;
  const urgentIds = urgent.map(p => p.id);

  const { data: extraData } = await supabase
    .from('pets')
    .select('*')
    .eq('status', 'available')
    .not('id', 'in', `(${urgentIds.length > 0 ? urgentIds.join(',') : 'null'})`)
    .order('created_at', { ascending: false })
    .limit(remaining);

  const extra = (extraData ?? []).map(row => mapRowToPet(row as Record<string, unknown>));
  return [...urgent, ...extra];
};

export const fetchPetById = async (id: string): Promise<Pet | null> => {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapRowToPet(data as Record<string, unknown>);
};

export const fetchAdoptedPets = async (userId: string): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from('adoption_applications')
    .select('pet_id, pets(*)')
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error || !data) return [];
  return data
    .filter((row: { pets: unknown }) => row.pets)
    .map((row: { pets: unknown }) => mapRowToPet(row.pets as Record<string, unknown>));
};

/** 用户发布宠物（UGC 送养） */
export interface AddPetParams {
  name: string;
  breed: string;
  ageText: string;
  gender: 'male' | 'female';
  category: PetCategory;
  location: string;
  province?: string;
  cityName?: string;
  locationDetail?: string;
  weight: string;
  description: string;
  story: string;
  isUrgent: boolean;
  price: number;
  tags: string[];
  imageUrl: string;
  fosterParentName: string;
  fosterParentAvatar: string;
}

export const addPet = async (params: AddPetParams, userId: string): Promise<Pet> => {
  const newId = crypto.randomUUID();
  const { data, error } = await supabase
    .from('pets')
    .insert({
      id: newId,
      name: params.name,
      breed: params.breed,
      age_text: params.ageText,
      gender: params.gender,
      category: params.category,
      location: params.location,
      province: params.province ?? '',
      city_name: params.cityName ?? '',
      location_detail: params.locationDetail ?? '',
      distance: '未知',
      weight: params.weight,
      description: params.description,
      story: params.story,
      is_urgent: params.isUrgent,
      price: params.price,
      tags: params.tags,
      image_url: params.imageUrl,
      foster_parent_name: params.fosterParentName,
      foster_parent_avatar: params.fosterParentAvatar,
      status: 'pending_review',
      user_id: userId,
      health: {},
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? '发布失败');
  return mapRowToPet(data as Record<string, unknown>);
};

/** 查询用户自己发布的宠物 */
export const fetchMyPublishedPets = async (userId: string): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(row => mapRowToPet(row as Record<string, unknown>));
};

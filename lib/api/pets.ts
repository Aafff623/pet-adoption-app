import { supabase } from '../supabase';
import type { Pet } from '../../types';

type PetCategory = 'all' | 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';

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
});

export const fetchPetList = async (category: PetCategory = 'all'): Promise<Pet[]> => {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (category !== 'all') {
    query = query.eq('category', category);
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

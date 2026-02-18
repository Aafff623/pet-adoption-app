import { supabase } from '../supabase';
import type { Pet } from '../../types';

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
  category: row.category as Pet['category'],
  status: row.status as Pet['status'],
});

export const fetchFavoritePets = async (userId: string): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('pet_id, pets(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data
    .filter((row: { pets: unknown }) => row.pets)
    .map((row: { pets: unknown }) => mapRowToPet(row.pets as Record<string, unknown>));
};

export const fetchFavoritePetIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('pet_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map(row => row.pet_id);
};

export const addFavorite = async (userId: string, petId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, pet_id: petId });

  if (error) throw new Error(error.message);
};

export const removeFavorite = async (userId: string, petId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('pet_id', petId);

  if (error) throw new Error(error.message);
};

export const checkIsFavorited = async (userId: string, petId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .single();

  if (error) return false;
  return !!data;
};

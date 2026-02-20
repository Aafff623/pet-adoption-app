import { supabase } from '../supabase';
import type { PetHealthDiary, CreateHealthDiaryParams } from '../../types';

const mapRow = (row: Record<string, unknown>): PetHealthDiary => ({
  id: row.id as string,
  petId: row.pet_id as string,
  authorId: row.author_id as string,
  moodLevel: (row.mood_level as number) ?? null,
  appetiteLevel: (row.appetite_level as number) ?? null,
  energyLevel: (row.energy_level as number) ?? null,
  sleepHours: (row.sleep_hours as number) ?? null,
  weightKg: (row.weight_kg as number) ?? null,
  symptoms: (row.symptoms as string) ?? null,
  note: (row.note as string) ?? null,
  imageUrl: (row.image_url as string) ?? null,
  recordedAt: row.recorded_at as string,
  createdAt: row.created_at as string,
});

export const fetchHealthDiaries = async (
  petId: string,
  limitDays = 90
): Promise<PetHealthDiary[]> => {
  const since = new Date();
  since.setDate(since.getDate() - limitDays);

  const { data, error } = await supabase
    .from('pet_health_diary')
    .select('*')
    .eq('pet_id', petId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapRow(row as Record<string, unknown>));
};

export const createHealthDiary = async (
  params: CreateHealthDiaryParams & { authorId: string }
): Promise<PetHealthDiary> => {
  const { data, error } = await supabase
    .from('pet_health_diary')
    .insert({
      pet_id: params.petId,
      author_id: params.authorId,
      mood_level: params.moodLevel ?? null,
      appetite_level: params.appetiteLevel ?? null,
      energy_level: params.energyLevel ?? null,
      sleep_hours: params.sleepHours ?? null,
      weight_kg: params.weightKg ?? null,
      symptoms: params.symptoms ?? null,
      note: params.note ?? null,
      image_url: params.imageUrl ?? null,
      recorded_at: params.recordedAt ?? new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? '创建健康日记失败');
  return mapRow(data as Record<string, unknown>);
};

export const deleteHealthDiary = async (diaryId: string): Promise<void> => {
  const { error } = await supabase
    .from('pet_health_diary')
    .delete()
    .eq('id', diaryId);

  if (error) throw new Error(error.message);
};

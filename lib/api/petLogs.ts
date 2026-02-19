import { supabase } from '../supabase';
import type { PetLog } from '../../types';

const mapRowToPetLog = (row: Record<string, unknown>): PetLog => ({
  id: row.id as string,
  petId: row.pet_id as string,
  authorId: row.author_id as string,
  content: row.content as string,
  imageUrl: (row.image_url as string) ?? '',
  createdAt: row.created_at as string,
});

export const fetchPetLogs = async (petId: string): Promise<PetLog[]> => {
  const { data, error } = await supabase
    .from('pet_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(row => mapRowToPetLog(row as Record<string, unknown>));
};

export const createPetLog = async (params: {
  petId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
}): Promise<PetLog> => {
  const { data, error } = await supabase
    .from('pet_logs')
    .insert({
      pet_id: params.petId,
      author_id: params.authorId,
      content: params.content,
      image_url: params.imageUrl ?? '',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '发布成长日志失败');
  }

  return mapRowToPetLog(data as Record<string, unknown>);
};

export const deletePetLog = async (logId: string): Promise<void> => {
  const { error } = await supabase
    .from('pet_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    throw new Error(error.message);
  }
};

export const updatePetLog = async (params: {
  logId: string;
  content: string;
}): Promise<PetLog> => {
  const { data, error } = await supabase
    .from('pet_logs')
    .update({
      content: params.content,
    })
    .eq('id', params.logId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '更新成长日志失败');
  }

  return mapRowToPetLog(data as Record<string, unknown>);
};

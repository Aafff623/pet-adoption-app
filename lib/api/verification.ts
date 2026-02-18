import { supabase } from '../supabase';
import type { Verification } from '../../types';

export const fetchVerification = async (userId: string): Promise<Verification | null> => {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    realName: data.real_name,
    idType: data.id_type,
    idNumber: data.id_number,
    status: data.status as Verification['status'],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const submitVerification = async (
  userId: string,
  realName: string,
  idType: string,
  idNumber: string
): Promise<void> => {
  const existing = await fetchVerification(userId);

  if (existing) {
    const { error } = await supabase
      .from('verifications')
      .update({
        real_name: realName,
        id_type: idType,
        id_number: idNumber,
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('verifications').insert({
      user_id: userId,
      real_name: realName,
      id_type: idType,
      id_number: idNumber,
      status: 'pending',
    });
    if (error) throw new Error(error.message);
  }
};

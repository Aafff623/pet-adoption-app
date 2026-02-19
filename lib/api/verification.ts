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
    idNumber: data.id_number ?? null,
    idNumberHash: data.id_number_hash ?? null,
    idNumberLast4: data.id_number_last4 ?? null,
    status: data.status as Verification['status'],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/** 计算 SHA-256 哈希 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const submitVerification = async (
  userId: string,
  realName: string,
  idType: string,
  idNumber: string
): Promise<void> => {
  const trimmed = idNumber.replace(/\s/g, '');
  const [hash, last4] = await Promise.all([
    sha256Hex(trimmed),
    Promise.resolve(trimmed.slice(-4)),
  ]);

  const payload = {
    real_name: realName,
    id_type: idType,
    id_number_hash: hash,
    id_number_last4: last4,
    // 废弃明文存储
    id_number: null,
    status: 'pending',
    updated_at: new Date().toISOString(),
  };

  const existing = await fetchVerification(userId);
  if (existing) {
    const { error } = await supabase
      .from('verifications')
      .update(payload)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('verifications').insert({
      user_id: userId,
      ...payload,
    });
    if (error) throw new Error(error.message);
  }
};

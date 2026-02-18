import { supabase } from '../supabase';
import type { UserProfile } from '../../types';

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    if (
      uploadError.message.includes('Bucket not found') ||
      uploadError.message.includes('storage/bucket-not-found') ||
      uploadError.message.includes('not found')
    ) {
      throw new Error(
        '头像上传失败：请先在 Supabase Dashboard → Storage 中创建名为 avatars 的公开 Bucket'
      );
    }
    throw new Error(`上传失败：${uploadError.message}`);
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = data.publicUrl;

  await updateProfile(userId, { avatarUrl: publicUrl });
  return publicUrl;
};

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    nickname: data.nickname,
    avatarUrl: data.avatar_url,
    bio: data.bio ?? '',
    city: data.city ?? '',
    followingCount: data.following_count,
    applyingCount: data.applying_count,
    adoptedCount: data.adopted_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateProfile = async (
  userId: string,
  updates: { nickname?: string; avatarUrl?: string; bio?: string; city?: string }
): Promise<void> => {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.nickname !== undefined) payload.nickname = updates.nickname;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.city !== undefined) payload.city = updates.city;

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  if (error) throw new Error(error.message);
};

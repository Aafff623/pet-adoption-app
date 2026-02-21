import { supabase } from '../supabase';
import type { UserProfile } from '../../types';

export class AvatarUploadError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = 'AvatarUploadError';
  }
}

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (
      msg.includes('bucket not found') ||
      msg.includes('storage/bucket-not-found') ||
      (msg.includes('bucket') && msg.includes('not found'))
    ) {
      throw new AvatarUploadError(
        uploadError.message,
        '头像上传失败：请先在 Supabase Dashboard → Storage 中创建名为 avatars 的公开 Bucket，并执行 supabase/storage_policies.sql 配置策略'
      );
    }
    if (msg.includes('policy') || msg.includes('row level security') || msg.includes('rls') || msg.includes('permission') || msg.includes('denied')) {
      throw new AvatarUploadError(
        uploadError.message,
        '头像上传失败：Storage 权限不足，请在 Supabase 中执行 supabase/storage_policies.sql 配置上传策略'
      );
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      throw new AvatarUploadError(uploadError.message, '头像上传失败：网络异常，请检查网络后重试');
    }
    throw new AvatarUploadError(uploadError.message, `上传失败：${uploadError.message}`);
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = data.publicUrl;

  try {
    await updateProfile(userId, { avatarUrl: publicUrl });
  } catch (profileError) {
    throw new AvatarUploadError(
      profileError instanceof Error ? profileError.message : 'updateProfile failed',
      '头像已上传但资料更新失败，请重试'
    );
  }
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
    province: data.province ?? '',
    cityName: data.city_name ?? '',
    followingCount: data.following_count,
    applyingCount: data.applying_count,
    adoptedCount: data.adopted_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateProfile = async (
  userId: string,
  updates: {
    nickname?: string;
    avatarUrl?: string;
    bio?: string;
    city?: string;
    province?: string;
    cityName?: string;
  }
): Promise<void> => {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.nickname !== undefined) payload.nickname = updates.nickname;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.province !== undefined) payload.province = updates.province;
  if (updates.cityName !== undefined) payload.city_name = updates.cityName;

  const hasNickname = updates.nickname !== undefined;
  if (hasNickname) {
    const upsertPayload = { id: userId, ...payload };
    const { error } = await supabase
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);
    if (error) throw new Error(error.message);
  }
};

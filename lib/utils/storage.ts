import { supabase } from '../supabase';

export function loadLocalSettings<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocalSettings<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

/**
 * Upload image to Supabase Storage
 * @param bucket - Storage bucket name (e.g., 'health-diary-images')
 * @param userId - User ID for path organization
 * @param file - Image file to upload
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (
  bucket: string,
  userId: string,
  file: File
): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const path = `${userId}/${timestamp}_${random}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (msg.includes('bucket not found')) {
      throw new Error(`请先在 Supabase Storage 中创建 ${bucket} bucket`);
    }
    if (msg.includes('policy') || msg.includes('permission')) {
      throw new Error('上传权限不足，请检查 Storage 策略配置');
    }
    throw new Error(`上传失败：${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param url - Public URL of the image
 */
export const deleteImage = async (bucket: string, url: string): Promise<void> => {
  // Extract path from public URL
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`));
  if (!pathMatch) return;

  const path = pathMatch[1];
  await supabase.storage.from(bucket).remove([path]);
};

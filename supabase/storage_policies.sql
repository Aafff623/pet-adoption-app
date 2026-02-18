-- ============================================================
-- PetConnect Storage 策略（头像上传）
-- 在 Supabase SQL Editor 中执行此文件
-- 执行前请先在 Dashboard → Storage 中创建名为 avatars 的公开 Bucket
-- ============================================================

-- 1. 允许认证用户上传头像到自己的文件夹
-- 路径格式：{user_id}/{timestamp}.{ext}，确保用户只能上传到自己的目录
CREATE POLICY "avatars_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允许认证用户更新/删除自己文件夹内的文件
CREATE POLICY "avatars_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 公开读取（avatars 为 Public bucket 时，所有人可读取）
CREATE POLICY "avatars_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================
-- Phase 5: 健康日记图片存储配置
-- 在 Supabase SQL Editor 中执行此文件
-- 执行前请先在 Dashboard → Storage 中创建名为 health-diary-images 的公开 Bucket
-- 配置: public=true, file size limit=5MB, allowed mime types: image/*
-- ============================================================

-- 1. 允许认证用户上传图片到自己的目录
-- 路径格式：{user_id}/{timestamp}_{random}.{ext}
CREATE POLICY "health_diary_images_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允许认证用户更新/删除自己文件夹内的文件
CREATE POLICY "health_diary_images_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "health_diary_images_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 公开读取（health-diary-images 为 Public bucket 时，所有人可读取）
CREATE POLICY "health_diary_images_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'health-diary-images');

-- ============================================================
-- Phase 5: 健康日记图片存储配置
-- ============================================================

-- 创建 health-diary-images bucket (如果不存在)
-- 请在 Supabase Dashboard -> Storage 中手动创建该 bucket
-- 配置: public=true, file size limit=5MB, allowed mime types: image/*

-- 允许认证用户上传图片到自己的目录
INSERT INTO storage.policies (id, bucket_id, name, definition)
VALUES (
  'health-diary-upload-own',
  'health-diary-images',
  'Users can upload images to their own folder',
  '(bucket_id = ''health-diary-images'') AND (auth.uid()::text = (storage.foldername(name))[1])'
) ON CONFLICT (id) DO NOTHING;

-- 允许所有人读取图片（公开）
INSERT INTO storage.policies (id, bucket_id, name, definition)
VALUES (
  'health-diary-read-all',
  'health-diary-images',
  'Anyone can view health diary images',
  '(bucket_id = ''health-diary-images'')'
) ON CONFLICT (id) DO NOTHING;

-- 允许用户删除自己上传的图片
INSERT INTO storage.policies (id, bucket_id, name, definition)
VALUES (
  'health-diary-delete-own',
  'health-diary-images',
  'Users can delete their own images',
  '(bucket_id = ''health-diary-images'') AND (auth.uid()::text = (storage.foldername(name))[1])'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 为 profiles 添加 INSERT 策略（支持 upsert，解决部分用户无 profile 导致保存失败）
-- 若已执行过完整 schema.sql，只需在 Supabase SQL Editor 中执行本文件
-- ============================================================
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

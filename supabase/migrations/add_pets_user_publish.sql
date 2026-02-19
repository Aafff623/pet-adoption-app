-- ============================================================
-- Task 6: 宠物 UGC 发布支持
-- 允许认证用户发布宠物，审核后上架
-- ============================================================

-- 1. 为 pets 表添加发布者 user_id
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. 扩展 status 枚举支持 pending_review（待审核状态）
--    先删除旧约束再重建
ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_status_check;
ALTER TABLE public.pets
  ADD CONSTRAINT pets_status_check
  CHECK (status IN ('available', 'adopted', 'pending', 'pending_review'));

-- 3. RLS：用户可以 INSERT 自己发布的宠物
DROP POLICY IF EXISTS "pets_insert_own" ON public.pets;
CREATE POLICY "pets_insert_own" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. RLS：用户可以修改自己处于待审核状态的宠物
DROP POLICY IF EXISTS "pets_update_own" ON public.pets;
CREATE POLICY "pets_update_own" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending_review');

-- 5. user_id 查询索引
CREATE INDEX IF NOT EXISTS pets_user_id_idx
  ON public.pets(user_id)
  WHERE user_id IS NOT NULL;

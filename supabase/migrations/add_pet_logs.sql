-- ============================================================
-- 新增 pet_logs（领养后成长日志）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_logs_pet_id_created_at
  ON public.pet_logs (pet_id, created_at DESC);

ALTER TABLE public.pet_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pet_logs_select_all" ON public.pet_logs;
CREATE POLICY "pet_logs_select_all" ON public.pet_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pet_logs_insert_adopter" ON public.pet_logs;
CREATE POLICY "pet_logs_insert_adopter" ON public.pet_logs
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1
      FROM public.adoption_applications aa
      WHERE aa.pet_id = pet_logs.pet_id
        AND aa.user_id = auth.uid()
        AND aa.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "pet_logs_delete_own" ON public.pet_logs;
CREATE POLICY "pet_logs_delete_own" ON public.pet_logs
  FOR DELETE USING (auth.uid() = author_id);

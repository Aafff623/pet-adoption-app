-- ============================================================
-- pet_logs 更新策略：仅作者可编辑
-- ============================================================

ALTER TABLE public.pet_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pet_logs_update_own" ON public.pet_logs;
CREATE POLICY "pet_logs_update_own" ON public.pet_logs
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

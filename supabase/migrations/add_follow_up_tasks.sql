-- ============================================================
-- 新增 follow_up_tasks（领养后回访任务）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  feedback TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_user_status_due
  ON public.follow_up_tasks (user_id, status, due_date);

ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follow_up_tasks_select_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_select_own" ON public.follow_up_tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "follow_up_tasks_insert_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_insert_own" ON public.follow_up_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "follow_up_tasks_update_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_update_own" ON public.follow_up_tasks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

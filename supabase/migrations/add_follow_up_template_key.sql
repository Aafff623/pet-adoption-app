-- ============================================================
-- follow_up_tasks 模板键（用于自动生成任务去重）
-- ============================================================

ALTER TABLE public.follow_up_tasks
  ADD COLUMN IF NOT EXISTS template_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_follow_up_tasks_template_key
  ON public.follow_up_tasks (user_id, pet_id, template_key)
  WHERE template_key IS NOT NULL;

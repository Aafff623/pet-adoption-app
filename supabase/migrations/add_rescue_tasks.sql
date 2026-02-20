-- Phase 4: 救助协作任务板

CREATE TABLE IF NOT EXISTS public.rescue_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('feeding', 'medical', 'transport', 'foster', 'supplies')),
  description TEXT,
  location_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_assignees INTEGER NOT NULL DEFAULT 1 CHECK (max_assignees >= 1),
  claimed_count INTEGER NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
  completed_note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rescue_task_window CHECK (window_end > window_start)
);

ALTER TABLE public.rescue_tasks ADD COLUMN IF NOT EXISTS max_assignees INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.rescue_tasks ADD COLUMN IF NOT EXISTS claimed_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.rescue_task_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.rescue_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'completed')),
  completed_note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rescue_tasks_status_window
  ON public.rescue_tasks (status, window_start);

CREATE INDEX IF NOT EXISTS idx_rescue_tasks_assignee_status
  ON public.rescue_tasks (assignee_id, status);

CREATE INDEX IF NOT EXISTS idx_rescue_task_claims_task_status
  ON public.rescue_task_claims (task_id, status);

CREATE INDEX IF NOT EXISTS idx_rescue_task_claims_user
  ON public.rescue_task_claims (user_id, status);

ALTER TABLE public.rescue_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_task_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read rescue tasks" ON public.rescue_tasks;
DROP POLICY IF EXISTS "Users can create own rescue tasks" ON public.rescue_tasks;
DROP POLICY IF EXISTS "Creator or assignee can update rescue tasks" ON public.rescue_tasks;

CREATE POLICY "Authenticated users can read rescue tasks"
  ON public.rescue_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own rescue tasks"
  ON public.rescue_tasks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator or assignee can update rescue tasks"
  ON public.rescue_tasks FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = assignee_id)
  WITH CHECK (auth.uid() = creator_id OR auth.uid() = assignee_id);

CREATE POLICY "Authenticated users can read rescue task claims"
  ON public.rescue_task_claims FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own rescue task claims"
  ON public.rescue_task_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rescue task claims"
  ON public.rescue_task_claims FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

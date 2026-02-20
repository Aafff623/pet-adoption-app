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

CREATE TABLE IF NOT EXISTS public.rescue_task_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.rescue_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
  completed_note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.rescue_task_claims
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.rescue_task_claims
SET status = 'approved'
WHERE status = 'claimed';

ALTER TABLE public.rescue_task_claims
  DROP CONSTRAINT IF EXISTS rescue_task_claims_status_check;

ALTER TABLE public.rescue_task_claims
  ADD CONSTRAINT rescue_task_claims_status_check
  CHECK (status IN ('pending', 'approved', 'completed'));

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
DROP POLICY IF EXISTS "Authenticated users can read rescue task claims" ON public.rescue_task_claims;
DROP POLICY IF EXISTS "Users can create own rescue task claims" ON public.rescue_task_claims;
DROP POLICY IF EXISTS "Users can update own rescue task claims" ON public.rescue_task_claims;
DROP POLICY IF EXISTS "Creators can approve rescue task claims" ON public.rescue_task_claims;

CREATE POLICY "Authenticated users can read rescue tasks"
  ON public.rescue_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own rescue tasks"
  ON public.rescue_tasks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator or assignee can update rescue tasks"
  ON public.rescue_tasks FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM public.rescue_task_claims c
      WHERE c.task_id = rescue_tasks.id
        AND c.user_id = auth.uid()
        AND c.status IN ('approved', 'completed')
    )
  )
  WITH CHECK (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM public.rescue_task_claims c
      WHERE c.task_id = rescue_tasks.id
        AND c.user_id = auth.uid()
        AND c.status IN ('approved', 'completed')
    )
  );

CREATE POLICY "Authenticated users can read rescue task claims"
  ON public.rescue_task_claims FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create own rescue task claims"
  ON public.rescue_task_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can update own rescue task claims"
  ON public.rescue_task_claims FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'completed'
  );

CREATE POLICY "Creators can approve rescue task claims"
  ON public.rescue_task_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.rescue_tasks t
      WHERE t.id = rescue_task_claims.task_id
        AND t.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.rescue_tasks t
      WHERE t.id = rescue_task_claims.task_id
        AND t.creator_id = auth.uid()
    )
    AND status IN ('pending', 'approved', 'completed')
  );

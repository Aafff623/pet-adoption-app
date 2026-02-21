CREATE TABLE IF NOT EXISTS public.admin_rescue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('lost_alert', 'rescue_task')),
  source_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('escalate', 'set_visibility', 'dispatch', 'hide', 'close', 'note')),
  status TEXT CHECK (status IN ('pending_review', 'in_progress', 'closed')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  visibility TEXT CHECK (visibility IN ('public', 'volunteer_only', 'hidden')),
  note TEXT,
  actor_name TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_rescue_reviews_source
  ON public.admin_rescue_reviews (source_type, source_id, created_at DESC);

ALTER TABLE public.admin_rescue_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read admin rescue reviews" ON public.admin_rescue_reviews;
CREATE POLICY "Public can read admin rescue reviews"
ON public.admin_rescue_reviews
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert admin rescue reviews" ON public.admin_rescue_reviews;
CREATE POLICY "Public can insert admin rescue reviews"
ON public.admin_rescue_reviews
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read rescue tasks" ON public.rescue_tasks;
CREATE POLICY "Authenticated users can read rescue tasks"
ON public.rescue_tasks
FOR SELECT USING (true);

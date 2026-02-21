-- Add adopt_requests table for求领养（adopt requests）
BEGIN;

CREATE TABLE IF NOT EXISTS public.adopt_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL DEFAULT 'other',
  age_pref      TEXT        DEFAULT '',
  city          TEXT        DEFAULT '',
  location_detail TEXT      DEFAULT '',
  contact       TEXT        DEFAULT '',
  image_url     TEXT        DEFAULT '',
  status        TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','matched')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adopt_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adopt_requests_select_own" ON public.adopt_requests;
CREATE POLICY "adopt_requests_select_own" ON public.adopt_requests FOR SELECT USING (auth.uid() = user_id OR status = 'open');

DROP POLICY IF EXISTS "adopt_requests_insert_own" ON public.adopt_requests;
CREATE POLICY "adopt_requests_insert_own" ON public.adopt_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "adopt_requests_update_own" ON public.adopt_requests;
CREATE POLICY "adopt_requests_update_own" ON public.adopt_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_adopt_requests_user ON public.adopt_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_adopt_requests_city ON public.adopt_requests(city);

COMMIT;

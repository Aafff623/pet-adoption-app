-- ============================================================
-- Phase 5: 宠物情绪与健康日记
-- ============================================================

-- ────────── pet_health_diary ──────────
CREATE TABLE IF NOT EXISTS public.pet_health_diary (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_level    SMALLINT    CHECK (mood_level BETWEEN 1 AND 5),
  appetite_level SMALLINT   CHECK (appetite_level BETWEEN 1 AND 5),
  energy_level  SMALLINT    CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours   NUMERIC(4,1),
  weight_kg     NUMERIC(5,2),
  symptoms      TEXT,
  note          TEXT,
  image_url     TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_health_diary_pet_recorded
  ON public.pet_health_diary (pet_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_pet_health_diary_author
  ON public.pet_health_diary (author_id);

ALTER TABLE public.pet_health_diary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author can read own diary" ON public.pet_health_diary;
CREATE POLICY "Author can read own diary"
  ON public.pet_health_diary FOR SELECT
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Author can insert diary" ON public.pet_health_diary;
CREATE POLICY "Author can insert diary"
  ON public.pet_health_diary FOR INSERT
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Author can update diary" ON public.pet_health_diary;
CREATE POLICY "Author can update diary"
  ON public.pet_health_diary FOR UPDATE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Author can delete diary" ON public.pet_health_diary;
CREATE POLICY "Author can delete diary"
  ON public.pet_health_diary FOR DELETE
  USING (author_id = auth.uid());

-- ────────── pet_health_insights ──────────
CREATE TABLE IF NOT EXISTS public.pet_health_insights (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_days     SMALLINT    NOT NULL,
  insight_summary TEXT        NOT NULL,
  risk_level      TEXT        NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  signals         JSONB       DEFAULT '[]',
  suggestions     JSONB       DEFAULT '[]',
  raw_payload     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_health_insights_pet_user
  ON public.pet_health_insights (pet_id, user_id, created_at DESC);

ALTER TABLE public.pet_health_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can read own insights" ON public.pet_health_insights;
CREATE POLICY "Owner can read own insights"
  ON public.pet_health_insights FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can insert insights" ON public.pet_health_insights;
CREATE POLICY "Owner can insert insights"
  ON public.pet_health_insights FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can delete insights" ON public.pet_health_insights;
CREATE POLICY "Owner can delete insights"
  ON public.pet_health_insights FOR DELETE
  USING (user_id = auth.uid());

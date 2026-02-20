-- Phase 1: 失踪宠物应急广播
-- 新增 lost_pet_alerts 和 lost_pet_sightings 表

-- ============================================================
-- 主表：失踪宠物警报
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lost_pet_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name      TEXT NOT NULL,
  pet_type      TEXT NOT NULL DEFAULT 'other',
  pet_breed     TEXT,
  pet_color     TEXT,
  pet_gender    TEXT CHECK (pet_gender IN ('male', 'female', 'unknown')),
  pet_age_text  TEXT,
  avatar_url    TEXT,
  description   TEXT NOT NULL,
  lost_at       TIMESTAMPTZ NOT NULL,
  last_seen_at  TIMESTAMPTZ,
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  radius_km     INTEGER NOT NULL DEFAULT 10,
  reward_text   TEXT,
  contact_note  TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  is_urgent     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at     TIMESTAMPTZ
);

-- ============================================================
-- 线索表：目击举报
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lost_pet_sightings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id      UUID NOT NULL REFERENCES public.lost_pet_alerts(id) ON DELETE CASCADE,
  reporter_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sighting_note TEXT NOT NULL,
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  sighted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_hint  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lost_alerts_status_created
  ON public.lost_pet_alerts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lost_alerts_geo
  ON public.lost_pet_alerts (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_lost_sightings_alert_created
  ON public.lost_pet_sightings (alert_id, created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.lost_pet_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pet_sightings ENABLE ROW LEVEL SECURITY;

-- lost_pet_alerts 策略
CREATE POLICY "Active alerts readable by all"
  ON public.lost_pet_alerts FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authors can insert own alerts"
  ON public.lost_pet_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own alerts"
  ON public.lost_pet_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- lost_pet_sightings 策略
CREATE POLICY "Sightings readable by alert owner or reporter"
  ON public.lost_pet_sightings FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.lost_pet_alerts a
      WHERE a.id = alert_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Logged in users can insert sightings"
  ON public.lost_pet_sightings FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

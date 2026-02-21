-- ============================================================
-- Ecosystem 6: AI 宠物健康顾问升级
-- health_alerts, health_consultation_logs
-- ============================================================

BEGIN;

-- ────────── health_alerts 异常预警记录 ──────────
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity        TEXT        NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  title           TEXT        NOT NULL,
  message         TEXT        NOT NULL DEFAULT '',
  source_snapshot JSONB,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_alerts_user_created
  ON public.health_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_pet
  ON public.health_alerts (pet_id);

ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own health alerts" ON public.health_alerts;
CREATE POLICY "Users can read own health alerts"
  ON public.health_alerts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health alerts" ON public.health_alerts;
CREATE POLICY "Users can insert own health alerts"
  ON public.health_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own health alerts" ON public.health_alerts;
CREATE POLICY "Users can update own health alerts"
  ON public.health_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- ────────── health_consultation_logs 咨询对话日志 ──────────
CREATE TABLE IF NOT EXISTS public.health_consultation_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id     TEXT        REFERENCES public.pets(id) ON DELETE SET NULL,
  session_id UUID        NOT NULL DEFAULT gen_random_uuid(),
  role       TEXT        NOT NULL CHECK (role IN ('user', 'model')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_consultation_logs_user_session
  ON public.health_consultation_logs (user_id, session_id, created_at);

ALTER TABLE public.health_consultation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own consultation logs" ON public.health_consultation_logs;
CREATE POLICY "Users can read own consultation logs"
  ON public.health_consultation_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consultation logs" ON public.health_consultation_logs;
CREATE POLICY "Users can insert own consultation logs"
  ON public.health_consultation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;

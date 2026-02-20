-- Phase 2: AI 领养匹配评分
-- 新增 adoption_match_scores 表

CREATE TABLE IF NOT EXISTS public.adoption_match_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id            TEXT NOT NULL,
  application_id    UUID,
  -- 评分维度（满分 100）
  overall_score     INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  stability_score   INTEGER NOT NULL CHECK (stability_score BETWEEN 0 AND 100),
  time_score        INTEGER NOT NULL CHECK (time_score BETWEEN 0 AND 100),
  cost_score        INTEGER NOT NULL CHECK (cost_score BETWEEN 0 AND 100),
  experience_score  INTEGER NOT NULL CHECK (experience_score BETWEEN 0 AND 100),
  -- 过敏风险
  allergy_risk_level TEXT NOT NULL DEFAULT 'low' CHECK (allergy_risk_level IN ('low', 'medium', 'high')),
  -- 文本结果
  summary           TEXT NOT NULL,
  risk_notes        TEXT,
  suggestions       TEXT,
  -- 原始 AI 输出（调试用）
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_scores_user_pet
  ON public.adoption_match_scores (user_id, pet_id);

CREATE INDEX IF NOT EXISTS idx_match_scores_pet
  ON public.adoption_match_scores (pet_id);

ALTER TABLE public.adoption_match_scores ENABLE ROW LEVEL SECURITY;

-- 本人可读写自己的评分
CREATE POLICY "Users can read own match scores"
  ON public.adoption_match_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own match scores"
  ON public.adoption_match_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 送养方可读与其宠物关联的评分摘要（通过 pets 表关联）
CREATE POLICY "Pet owners can read scores for their pets"
  ON public.adoption_match_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = adoption_match_scores.pet_id AND p.user_id = auth.uid()
    )
  );

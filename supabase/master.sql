-- ============================================================
-- PetConnect master.sql（全库一键重建脚本）
-- 用法：在 Supabase SQL Editor 中直接执行本文件，可从零建立完整数据库
-- 包含：完整 Schema（20 张表）+ Storage 策略 + 初始种子数据
-- 最后更新：2026-02-20
-- ============================================================

-- ============================================================
-- PetConnect 数据库 Schema（完整最终版）
-- 此文件反映当前数据库的完整状态，可用于在全新环境中一键重建
-- 执行顺序：schema.sql -> seed.sql（可选）
-- 最后更新：2026-02-20
-- ============================================================

-- ============================================================
-- 1. profiles 用户资料表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname        TEXT        NOT NULL DEFAULT '宠物爱好者',
  avatar_url      TEXT        DEFAULT '',
  bio             TEXT        DEFAULT '',
  city            TEXT        DEFAULT '',
  following_count INTEGER     NOT NULL DEFAULT 0,
  applying_count  INTEGER     NOT NULL DEFAULT 0,
  adopted_count   INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '宠物爱好者'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. pets 宠物信息表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id                   TEXT        PRIMARY KEY,
  name                 TEXT        NOT NULL,
  breed                TEXT        NOT NULL,
  age_text             TEXT        NOT NULL,
  distance             TEXT        NOT NULL DEFAULT '未知',
  gender               TEXT        NOT NULL CHECK (gender IN ('male', 'female')),
  image_url            TEXT        NOT NULL DEFAULT '',
  price                INTEGER     NOT NULL DEFAULT 0,
  location             TEXT        NOT NULL DEFAULT '',
  weight               TEXT        NOT NULL DEFAULT '',
  description          TEXT        NOT NULL DEFAULT '',
  tags                 TEXT[]      DEFAULT '{}',
  is_urgent            BOOLEAN     NOT NULL DEFAULT FALSE,
  story                TEXT        NOT NULL DEFAULT '',
  health               JSONB       NOT NULL DEFAULT '{}',
  foster_parent_name   TEXT        NOT NULL DEFAULT '',
  foster_parent_avatar TEXT        NOT NULL DEFAULT '',
  category             TEXT        NOT NULL DEFAULT 'all'
                         CHECK (category IN ('all','dog','cat','rabbit','bird','hamster','turtle','fish','other')),
  status               TEXT        NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available','adopted','pending','pending_review')),
  user_id              UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_select_all" ON public.pets;
CREATE POLICY "pets_select_all" ON public.pets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pets_insert_own" ON public.pets;
CREATE POLICY "pets_insert_own" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pets_update_own" ON public.pets;
CREATE POLICY "pets_update_own" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending_review');

CREATE INDEX IF NOT EXISTS pets_user_id_idx ON public.pets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS pets_gender_idx ON public.pets(gender);
CREATE INDEX IF NOT EXISTS pets_urgent_idx ON public.pets(is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX IF NOT EXISTS pets_status_category_created_idx ON public.pets(status, category, created_at DESC);
CREATE INDEX IF NOT EXISTS pets_location_idx ON public.pets(location);

-- ============================================================
-- 3. favorites 收藏表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id     TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. adoption_applications 领养申请表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.adoption_applications (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id         TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL,
  age            TEXT        NOT NULL,
  occupation     TEXT        NOT NULL,
  housing_type   TEXT        NOT NULL,
  living_status  TEXT        NOT NULL,
  has_experience BOOLEAN     NOT NULL DEFAULT FALSE,
  message        TEXT        NOT NULL DEFAULT '',
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own" ON public.adoption_applications;
CREATE POLICY "applications_select_own" ON public.adoption_applications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "applications_insert_own" ON public.adoption_applications;
CREATE POLICY "applications_insert_own" ON public.adoption_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. conversations 会话表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_name   TEXT        NOT NULL,
  other_user_avatar TEXT        NOT NULL DEFAULT '',
  last_message      TEXT        NOT NULL DEFAULT '',
  last_message_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count      INTEGER     NOT NULL DEFAULT 0,
  is_system         BOOLEAN     NOT NULL DEFAULT FALSE,
  agent_type        TEXT        DEFAULT NULL,
  other_user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS conversations_p2p_unique
  ON public.conversations(user_id, other_user_id)
  WHERE other_user_id IS NOT NULL AND is_system = FALSE;

DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;
CREATE POLICY "conversations_update_own" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "conversations_delete_own" ON public.conversations;
CREATE POLICY "conversations_delete_own" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 6. chat_messages 聊天消息表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  is_self         BOOLEAN     NOT NULL DEFAULT TRUE,
  sender_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS chat_messages_sender_idx ON public.chat_messages(sender_id) WHERE sender_id IS NOT NULL;

DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "chat_messages_update_own" ON public.chat_messages;
CREATE POLICY "chat_messages_update_own" ON public.chat_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "chat_messages_delete_own" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- ============================================================
-- 7. verifications 实名认证表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  real_name       TEXT        NOT NULL,
  id_type         TEXT        NOT NULL DEFAULT '居民身份证',
  id_number       TEXT,
  id_number_hash  TEXT,
  id_number_last4 TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verifications_select_own" ON public.verifications;
CREATE POLICY "verifications_select_own" ON public.verifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "verifications_insert_own" ON public.verifications;
CREATE POLICY "verifications_insert_own" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "verifications_update_own" ON public.verifications;
CREATE POLICY "verifications_update_own" ON public.verifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 8. feedback 意见反馈表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  content    TEXT        NOT NULL,
  contact    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 9. lost_pet_alerts 失踪宠物警报表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lost_pet_alerts (
  id            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name      TEXT             NOT NULL,
  pet_type      TEXT             NOT NULL DEFAULT 'other',
  pet_breed     TEXT,
  pet_color     TEXT,
  pet_gender    TEXT             CHECK (pet_gender IN ('male', 'female', 'unknown')),
  pet_age_text  TEXT,
  avatar_url    TEXT,
  description   TEXT             NOT NULL,
  lost_at       TIMESTAMPTZ      NOT NULL,
  last_seen_at  TIMESTAMPTZ,
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  radius_km     INTEGER          NOT NULL DEFAULT 10,
  reward_text   TEXT,
  contact_note  TEXT,
  status        TEXT             NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  is_urgent     BOOLEAN          NOT NULL DEFAULT FALSE,
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lost_pet_alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lost_alerts_status_created ON public.lost_pet_alerts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_alerts_geo ON public.lost_pet_alerts (latitude, longitude);

DROP POLICY IF EXISTS "Active alerts readable by all" ON public.lost_pet_alerts;
CREATE POLICY "Active alerts readable by all" ON public.lost_pet_alerts FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Authors can insert own alerts" ON public.lost_pet_alerts;
CREATE POLICY "Authors can insert own alerts" ON public.lost_pet_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authors can update own alerts" ON public.lost_pet_alerts;
CREATE POLICY "Authors can update own alerts" ON public.lost_pet_alerts FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 10. lost_pet_sightings 目击线索表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lost_pet_sightings (
  id            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id      UUID             NOT NULL REFERENCES public.lost_pet_alerts(id) ON DELETE CASCADE,
  reporter_id   UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sighting_note TEXT             NOT NULL,
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  sighted_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  contact_hint  TEXT,
  created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lost_pet_sightings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lost_sightings_alert_created ON public.lost_pet_sightings (alert_id, created_at DESC);

DROP POLICY IF EXISTS "Sightings readable by alert owner or reporter" ON public.lost_pet_sightings;
CREATE POLICY "Sightings readable by alert owner or reporter" ON public.lost_pet_sightings FOR SELECT
  USING (reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.lost_pet_alerts a WHERE a.id = alert_id AND a.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Logged in users can insert sightings" ON public.lost_pet_sightings;
CREATE POLICY "Logged in users can insert sightings" ON public.lost_pet_sightings FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- 11. adoption_match_scores AI 领养匹配评分表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.adoption_match_scores (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id             TEXT        NOT NULL,
  application_id     UUID,
  overall_score      INTEGER     NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  stability_score    INTEGER     NOT NULL CHECK (stability_score BETWEEN 0 AND 100),
  time_score         INTEGER     NOT NULL CHECK (time_score BETWEEN 0 AND 100),
  cost_score         INTEGER     NOT NULL CHECK (cost_score BETWEEN 0 AND 100),
  experience_score   INTEGER     NOT NULL CHECK (experience_score BETWEEN 0 AND 100),
  allergy_risk_level TEXT        NOT NULL DEFAULT 'low' CHECK (allergy_risk_level IN ('low', 'medium', 'high')),
  summary            TEXT        NOT NULL,
  risk_notes         TEXT,
  suggestions        TEXT,
  raw_payload        JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adoption_match_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_match_scores_user_pet ON public.adoption_match_scores (user_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_pet ON public.adoption_match_scores (pet_id);

DROP POLICY IF EXISTS "Users can read own match scores" ON public.adoption_match_scores;
CREATE POLICY "Users can read own match scores" ON public.adoption_match_scores FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own match scores" ON public.adoption_match_scores;
CREATE POLICY "Users can insert own match scores" ON public.adoption_match_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Pet owners can read scores for their pets" ON public.adoption_match_scores;
CREATE POLICY "Pet owners can read scores for their pets" ON public.adoption_match_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = adoption_match_scores.pet_id AND p.user_id = auth.uid()));

-- ============================================================
-- 12. adoption_milestones 领养流程里程碑表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.adoption_milestones (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id       UUID        NOT NULL REFERENCES public.adoption_applications(id) ON DELETE CASCADE,
  pet_id               TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage                TEXT        NOT NULL CHECK (stage IN ('chatting', 'meet', 'trial', 'adopted')),
  status               TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  confirmed_by_adopter BOOLEAN     NOT NULL DEFAULT FALSE,
  confirmed_by_owner   BOOLEAN     NOT NULL DEFAULT FALSE,
  note                 TEXT,
  confirmed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, stage)
);

ALTER TABLE public.adoption_milestones ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_adoption_milestones_application ON public.adoption_milestones (application_id, created_at);
CREATE INDEX IF NOT EXISTS idx_adoption_milestones_participants ON public.adoption_milestones (adopter_id, owner_id);

DROP POLICY IF EXISTS "Participants can read milestones" ON public.adoption_milestones;
CREATE POLICY "Participants can read milestones" ON public.adoption_milestones FOR SELECT
  USING (auth.uid() = adopter_id OR auth.uid() = owner_id);
DROP POLICY IF EXISTS "Participants can insert milestones" ON public.adoption_milestones;
CREATE POLICY "Participants can insert milestones" ON public.adoption_milestones FOR INSERT
  WITH CHECK (auth.uid() = adopter_id OR auth.uid() = owner_id);
DROP POLICY IF EXISTS "Participants can update milestones" ON public.adoption_milestones;
CREATE POLICY "Participants can update milestones" ON public.adoption_milestones FOR UPDATE
  USING (auth.uid() = adopter_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = adopter_id OR auth.uid() = owner_id);

-- ============================================================
-- 13. rescue_tasks 救助协作任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rescue_tasks (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id     UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT             NOT NULL,
  task_type      TEXT             NOT NULL CHECK (task_type IN ('feeding', 'medical', 'transport', 'foster', 'supplies')),
  description    TEXT,
  location_text  TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  window_start   TIMESTAMPTZ      NOT NULL,
  window_end     TIMESTAMPTZ      NOT NULL,
  status         TEXT             NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'cancelled')),
  assignee_id    UUID             REFERENCES auth.users(id) ON DELETE SET NULL,
  max_assignees  INTEGER          NOT NULL DEFAULT 1 CHECK (max_assignees >= 1),
  claimed_count  INTEGER          NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
  completed_note TEXT,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rescue_task_window CHECK (window_end > window_start)
);

ALTER TABLE public.rescue_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rescue_tasks_status_window ON public.rescue_tasks (status, window_start);
CREATE INDEX IF NOT EXISTS idx_rescue_tasks_assignee_status ON public.rescue_tasks (assignee_id, status);

DROP POLICY IF EXISTS "Authenticated users can read rescue tasks" ON public.rescue_tasks;
CREATE POLICY "Authenticated users can read rescue tasks" ON public.rescue_tasks FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can create own rescue tasks" ON public.rescue_tasks;
CREATE POLICY "Users can create own rescue tasks" ON public.rescue_tasks FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Creator or assignee can update rescue tasks" ON public.rescue_tasks;
CREATE POLICY "Creator or assignee can update rescue tasks" ON public.rescue_tasks FOR UPDATE
  USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.rescue_task_claims c
    WHERE c.task_id = rescue_tasks.id AND c.user_id = auth.uid() AND c.status IN ('approved', 'completed')
  ))
  WITH CHECK (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.rescue_task_claims c
    WHERE c.task_id = rescue_tasks.id AND c.user_id = auth.uid() AND c.status IN ('approved', 'completed')
  ));

-- ============================================================
-- 14. rescue_task_claims 救助任务认领表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rescue_task_claims (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID        NOT NULL REFERENCES public.rescue_tasks(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
  completed_note TEXT,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.rescue_task_claims ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rescue_task_claims_task_status ON public.rescue_task_claims (task_id, status);
CREATE INDEX IF NOT EXISTS idx_rescue_task_claims_user ON public.rescue_task_claims (user_id, status);

DROP POLICY IF EXISTS "Authenticated users can read rescue task claims" ON public.rescue_task_claims;
CREATE POLICY "Authenticated users can read rescue task claims" ON public.rescue_task_claims FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can create own rescue task claims" ON public.rescue_task_claims;
CREATE POLICY "Users can create own rescue task claims" ON public.rescue_task_claims FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');
DROP POLICY IF EXISTS "Users can update own rescue task claims" ON public.rescue_task_claims;
CREATE POLICY "Users can update own rescue task claims" ON public.rescue_task_claims FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND status = 'completed');
DROP POLICY IF EXISTS "Creators can approve rescue task claims" ON public.rescue_task_claims;
CREATE POLICY "Creators can approve rescue task claims" ON public.rescue_task_claims FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.rescue_tasks t WHERE t.id = rescue_task_claims.task_id AND t.creator_id = auth.uid()))
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.rescue_tasks t WHERE t.id = rescue_task_claims.task_id AND t.creator_id = auth.uid())
    AND status IN ('pending', 'approved', 'completed')
  );

-- ============================================================
-- 15. pet_health_diary 宠物健康日记表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pet_health_diary (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  author_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_level     SMALLINT    CHECK (mood_level BETWEEN 1 AND 5),
  appetite_level SMALLINT    CHECK (appetite_level BETWEEN 1 AND 5),
  energy_level   SMALLINT    CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours    NUMERIC(4,1),
  weight_kg      NUMERIC(5,2),
  symptoms       TEXT,
  note           TEXT,
  image_url      TEXT,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pet_health_diary ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pet_health_diary_pet_recorded ON public.pet_health_diary (pet_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_health_diary_author ON public.pet_health_diary (author_id);

DROP POLICY IF EXISTS "Author can read own diary" ON public.pet_health_diary;
CREATE POLICY "Author can read own diary" ON public.pet_health_diary FOR SELECT USING (author_id = auth.uid());
DROP POLICY IF EXISTS "Author can insert diary" ON public.pet_health_diary;
CREATE POLICY "Author can insert diary" ON public.pet_health_diary FOR INSERT WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "Author can update diary" ON public.pet_health_diary;
CREATE POLICY "Author can update diary" ON public.pet_health_diary FOR UPDATE USING (author_id = auth.uid());
DROP POLICY IF EXISTS "Author can delete diary" ON public.pet_health_diary;
CREATE POLICY "Author can delete diary" ON public.pet_health_diary FOR DELETE USING (author_id = auth.uid());

-- ============================================================
-- 16. pet_health_insights AI 健康洞察表
-- ============================================================
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

ALTER TABLE public.pet_health_insights ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pet_health_insights_pet_user ON public.pet_health_insights (pet_id, user_id, created_at DESC);

DROP POLICY IF EXISTS "Owner can read own insights" ON public.pet_health_insights;
CREATE POLICY "Owner can read own insights" ON public.pet_health_insights FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Owner can insert insights" ON public.pet_health_insights;
CREATE POLICY "Owner can insert insights" ON public.pet_health_insights FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Owner can delete insights" ON public.pet_health_insights;
CREATE POLICY "Owner can delete insights" ON public.pet_health_insights FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 17. pet_logs 领养后成长日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pet_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  image_url  TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pet_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pet_logs_pet_id_created_at ON public.pet_logs (pet_id, created_at DESC);

DROP POLICY IF EXISTS "pet_logs_select_all" ON public.pet_logs;
CREATE POLICY "pet_logs_select_all" ON public.pet_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "pet_logs_insert_adopter" ON public.pet_logs;
CREATE POLICY "pet_logs_insert_adopter" ON public.pet_logs FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM public.adoption_applications aa
    WHERE aa.pet_id = pet_logs.pet_id AND aa.user_id = auth.uid() AND aa.status = 'approved'
  ));
DROP POLICY IF EXISTS "pet_logs_update_own" ON public.pet_logs;
CREATE POLICY "pet_logs_update_own" ON public.pet_logs FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "pet_logs_delete_own" ON public.pet_logs;
CREATE POLICY "pet_logs_delete_own" ON public.pet_logs FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- 18. follow_up_tasks 领养后回访任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id       TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  due_date     DATE        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  feedback     TEXT        NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  template_key TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_user_status_due ON public.follow_up_tasks (user_id, status, due_date);
CREATE UNIQUE INDEX IF NOT EXISTS uq_follow_up_tasks_template_key
  ON public.follow_up_tasks (user_id, pet_id, template_key) WHERE template_key IS NOT NULL;

DROP POLICY IF EXISTS "follow_up_tasks_select_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_select_own" ON public.follow_up_tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "follow_up_tasks_insert_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_insert_own" ON public.follow_up_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "follow_up_tasks_update_own" ON public.follow_up_tasks;
CREATE POLICY "follow_up_tasks_update_own" ON public.follow_up_tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 19. reports 举报表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT        NOT NULL CHECK (target_type IN ('user', 'pet', 'message')),
  target_id   TEXT        NOT NULL,
  reason      TEXT        NOT NULL,
  detail      TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================================
-- 20. blocks 用户屏蔽表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_insert_own" ON public.blocks;
CREATE POLICY "blocks_insert_own" ON public.blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "blocks_select_own" ON public.blocks;
CREATE POLICY "blocks_select_own" ON public.blocks FOR SELECT USING (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "blocks_delete_own" ON public.blocks;
CREATE POLICY "blocks_delete_own" ON public.blocks FOR DELETE USING (auth.uid() = blocker_id);
-- ============================================================
-- Storage 策略（需先在 Dashboard -> Storage 创建 avatars 公开 Bucket）
-- ============================================================

-- ============================================================
-- PetConnect Storage 策略（头像上传）
-- 在 Supabase SQL Editor 中执行此文件
-- 执行前请先在 Dashboard → Storage 中创建名为 avatars 的公开 Bucket
-- ============================================================

-- 1. 允许认证用户上传头像到自己的文件夹
-- 路径格式：{user_id}/{timestamp}.{ext}，确保用户只能上传到自己的目录
CREATE POLICY "avatars_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允许认证用户更新/删除自己文件夹内的文件
CREATE POLICY "avatars_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 公开读取（avatars 为 Public bucket 时，所有人可读取）
CREATE POLICY "avatars_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================
-- Storage 策略：健康日记图片（需先在 Dashboard -> Storage 创建 health-diary-images 公开 Bucket）
-- ============================================================

-- ============================================================
-- Phase 5: 健康日记图片存储配置
-- 在 Supabase SQL Editor 中执行此文件
-- 执行前请先在 Dashboard → Storage 中创建名为 health-diary-images 的公开 Bucket
-- 配置: public=true, file size limit=5MB, allowed mime types: image/*
-- ============================================================

-- 1. 允许认证用户上传图片到自己的目录
-- 路径格式：{user_id}/{timestamp}_{random}.{ext}
CREATE POLICY "health_diary_images_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允许认证用户更新/删除自己文件夹内的文件
CREATE POLICY "health_diary_images_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "health_diary_images_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'health-diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 公开读取（health-diary-images 为 Public bucket 时，所有人可读取）
CREATE POLICY "health_diary_images_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'health-diary-images');

-- ============================================================
-- 种子数据（开发/演示用，生产环境可跳过）
-- ============================================================

-- 更多分类种子数据
INSERT INTO public.pets (id, name, breed, age_text, distance, gender, image_url, price, location, weight, description, is_urgent, tags, story, health, foster_parent_name, foster_parent_avatar, category)
VALUES
-- ========== 狗狗 ==========
(
  'lucky', '幸运', '拉布拉多', '1 岁', '6.3 公里', 'male',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
  600, '上海市宝山区', '24 Kg', '幸运乐观外向，适合有娃家庭，超温顺不咬人。',
  FALSE, '{"已接种","已绝育","亲人"}',
  '幸运曾是一只导盲犬候选犬，因视力问题未能通过训练，但却因此有了更完善的基础训练底子，需要规律遛弯与陪伴。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "高级指令"}',
  '韩先生', 'https://i.pravatar.cc/128?img=11', 'dog'
),
(
  'cookie', '曲奇', '柯基', '8 个月', '3.2 公里', 'female',
  'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600&h=400&fit=crop',
  500, '上海市浦东新区', '10 Kg', '曲奇短腿萌翻，活泼好动，爱撒娇。',
  TRUE, '{"紧急","已绝育","无攻击性"}',
  '原主人出国，急需为曲奇找到新家。她已完成基础训练，会坐下、握手，是个乖巧的小可爱。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "基础训练"}',
  '张女士', 'https://i.pravatar.cc/128?img=5', 'dog'
),
(
  'max', '麦克斯', '边境牧羊犬', '3 岁', '8.1 公里', 'male',
  'https://images.unsplash.com/photo-1503256207526-0d5523284ff6?w=600&h=400&fit=crop',
  0, '上海市松江区', '20 Kg', '智商极高，需要大量运动和脑力刺激。',
  FALSE, '{"已接种","聪明","需要运动"}',
  '麦克斯是一只被牧场主人无力继续喂养而送出的边牧，能力极强，适合有经验且居住空间宽裕的家庭。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "高级指令"}',
  '赵先生', 'https://i.pravatar.cc/128?img=13', 'dog'
),
(
  'nana', '娜娜', '贵宾', '2 岁', '1.8 公里', 'female',
  'https://images.unsplash.com/photo-1616149270376-db739046c920?w=600&h=400&fit=crop',
  300, '上海市黄浦区', '5 Kg', '娜娜卷毛可爱，不掉毛，适合过敏体质。',
  FALSE, '{"不掉毛","已绝育","适合新手"}',
  '前主人因宝宝对狗毛敏感不得不送养，娜娜性格温顺，特别黏人，对小朋友非常友善。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "基础训练"}',
  '刘阿姨', 'https://i.pravatar.cc/128?img=9', 'dog'
),
-- ========== 猫猫 ==========
(
  'momo', '茉茉', '英短蓝白', '1 岁', '2.2 公里', 'female',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&h=400&fit=crop',
  380, '上海市静安区', '3.8 Kg', '茉茉亲人黏人，适合新手家庭，颜值高。',
  FALSE, '{"已绝育","亲人","颜值高"}',
  '已适应猫砂盆，性格安静温柔，喜欢晒太阳，对陌生人友善，是一只标准的"傻白甜"猫咪。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "无", "training": "会用猫砂"}',
  '林小姐', 'https://i.pravatar.cc/128?img=47', 'cat'
),
(
  'tiger', '虎斑', '橘猫', '3 岁', '0.9 公里', 'male',
  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&h=400&fit=crop',
  0, '上海市杨浦区', '6 Kg', '标准橘猫体型，热情话多，见人就蹭。',
  FALSE, '{"话多","亲人","已绝育"}',
  '虎斑在小区流浪了半年，被好心人救助后一直在室内生活，已完全适应家养环境，每天要喵喵叫着找人撸。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "无", "training": "会用猫砂"}',
  '陈阿姨', 'https://i.pravatar.cc/128?img=46', 'cat'
),
(
  'luna', '露娜', '布偶猫', '6 个月', '4.5 公里', 'female',
  'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=600&h=400&fit=crop',
  1500, '上海市长宁区', '2.8 Kg', '布偶特有蓝眼睛，温顺到没朋友，手感极佳。',
  FALSE, '{"蓝眼睛","超温顺","适合公寓"}',
  '露娜因原主人搬至不允许养宠物的小区而含泪送养，毛色纯正，健康档案完整，是值得信赖的高品质家猫。',
  '{"vaccines": "已接种", "neuter": "未绝育", "chip": "已注册", "training": "会用猫砂"}',
  '钱女士', 'https://i.pravatar.cc/128?img=43', 'cat'
),
-- ========== 兔子 ==========
(
  'mocha', '摩卡', '荷兰兔', '10 个月', '3.1 公里', 'male',
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop',
  90, '上海市徐汇区', '1.7 Kg', '摩卡温顺亲人，喜欢啃草饼和胡萝卜。',
  FALSE, '{"温顺","喜欢被抱","定点如厕"}',
  '需要宽敞活动空间与定期修剪指甲，对陌生人也很友好，适合有耐心的主人，不宜与猫狗同住。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  '陶姐', 'https://i.pravatar.cc/128?img=32', 'rabbit'
),
(
  'snow_rabbit', '雪儿', '安哥拉兔', '1 岁', '5.5 公里', 'female',
  'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600&h=400&fit=crop',
  200, '上海市嘉定区', '2.2 Kg', '全身白色长毛，云朵般的存在，需定期梳毛。',
  FALSE, '{"长毛","颜值高","需梳毛"}',
  '雪儿是一只长毛安哥拉兔，需要每周梳毛，生活习惯良好，适合热爱小动物且有耐心的饲主。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  '吴小姐', 'https://i.pravatar.cc/128?img=44', 'rabbit'
),
-- ========== 鸟类 ==========
(
  'sky', '小空', '虎皮鹦鹉', '8 个月', '2.8 公里', 'female',
  'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=600&h=400&fit=crop',
  180, '上海市普陀区', '0.1 Kg', '小空喜欢学唱歌，声音悦耳，性格活泼亲人。',
  FALSE, '{"会说话","活泼","上手"}',
  '小空已经学会了几句短句，每天清晨都会自动"报时"，需要每天放飞陪伴，适合有时间在家的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "上手训练"}',
  '杨女士', 'https://i.pravatar.cc/128?img=20', 'bird'
),
(
  'rio', '里奥', '玄凤鹦鹉', '2 岁', '6.7 公里', 'male',
  'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=600&h=400&fit=crop',
  350, '上海市闵行区', '0.1 Kg', '里奥头冠漂亮，喜欢听音乐，会主动找人互动。',
  FALSE, '{"头冠漂亮","喜欢音乐","亲人"}',
  '里奥在原来的家里和音响做了两年的"邻居"，已经学会跟着节拍摇头，需要每天最少1小时的陪伴时间。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "上手训练"}',
  '孙先生', 'https://i.pravatar.cc/128?img=15', 'bird'
),
-- ========== 仓鼠 ==========
(
  'pudding', '布丁', '金丝熊', '3 个月', '2.1 公里', 'female',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=400&fit=crop',
  50, '上海市虹口区', '0.2 Kg', '布丁是一只好奇心旺盛的小仓鼠，喜欢囤食。',
  FALSE, '{"适合入门","夜行","喜欢囤粮"}',
  '布丁喜欢夜间活动，白天大多数时间在睡觉，需要安静的笼养环境与稳定作息，饲养成本低。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应手喂"}',
  '叶阿姨', 'https://i.pravatar.cc/128?img=48', 'hamster'
),
-- ========== 乌龟 ==========
(
  'atlas', '阿特拉斯', '巴西红耳龟', '2 岁', '4.6 公里', 'male',
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&h=400&fit=crop',
  120, '上海市浦东新区', '0.6 Kg', '阿特拉斯性格安静爱晒背，是低维护宠物首选。',
  FALSE, '{"低维护","长寿","安静"}',
  '需要稳定水温(22-28°C)与晒台空间，每周换水喂食即可，适合有养龟经验或愿意学习的家庭。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '周先生', 'https://i.pravatar.cc/128?img=12', 'turtle'
),
-- ========== 鱼类 ==========
(
  'bubble', '泡泡', '孔雀鱼', '6 个月', '1.4 公里', 'female',
  'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=400&fit=crop',
  20, '上海市杨浦区', '0.01 Kg', '泡泡是一条尾鳍华丽的孔雀鱼，连缸一起送。',
  FALSE, '{"连缸送","低维护","颜值高"}',
  '适合入门级鱼缸，水质稳定即可健康成长，一缸约5条，连20L鱼缸和过滤器一起奉送给有缘人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "无需训练"}',
  '阿泽', 'https://i.pravatar.cc/128?img=60', 'fish'
),
(
  'nemo', '小尼莫', '小丑鱼', '1 岁', '7.2 公里', 'male',
  'https://images.unsplash.com/photo-1467657754686-27e4e4c4e3e9?w=600&h=400&fit=crop',
  280, '上海市长宁区', '0.02 Kg', '颜色鲜艳，在珊瑚背景下非常好看，附赠海缸。',
  FALSE, '{"海水鱼","颜值极高","附赠海缸"}',
  '小尼莫生活在已运行半年的30L海水缸中，整缸移交，需要有一定海水缸基础的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "无需训练"}',
  '程女士', 'https://i.pravatar.cc/128?img=49', 'fish'
),
-- ========== 其他 ==========
(
  'peanut', '花生', '非洲侏儒刺猬', '5 个月', '1.9 公里', 'female',
  'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&h=400&fit=crop',
  150, '上海市闵行区', '0.5 Kg', '花生刺软可摸，温和亲人，适合安静家庭。',
  FALSE, '{"刺软","夜行","低维护"}',
  '花生夜行性较强，需要稳定温度(24-30°C)与躲避屋，适合喜欢独特宠物且作息规律的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '许先生', 'https://i.pravatar.cc/128?img=57', 'other'
),
(
  'gizmo', '奇奇', '龙猫', '1 岁', '3.8 公里', 'male',
  'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=400&fit=crop',
  400, '上海市徐汇区', '0.5 Kg', '奇奇毛发柔软如云，活泼好动，跳跃能力强。',
  FALSE, '{"毛极软","跳跃力强","需要伙伴"}',
  '龙猫是群居动物，建议成对饲养。奇奇性格活跃，需要大笼子和每天放风时间，不适合幼儿家庭。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "适应环境"}',
  '方小姐', 'https://i.pravatar.cc/128?img=41', 'other'
)
ON CONFLICT (id) DO NOTHING;


-- === 测试种子数据（需至少一个已注册用户）===

-- ============================================================
-- PetConnect 种子数据（除 pets 外的表）
-- 在 Supabase SQL Editor 中执行：先执行 schema.sql，再执行本文件
-- 依赖：auth.users 中至少有一个用户时，才会插入收藏/申请/会话/认证等数据
-- ============================================================

-- ============================================================
-- 1. feedback 意见反馈（匿名，无需用户）
-- ============================================================
INSERT INTO public.feedback (user_id, content, contact)
VALUES
  (NULL, '希望增加按城市筛选宠物的功能，方便同城领养。', 'user_feedback_1@example.com'),
  (NULL, '应用整体体验很好，建议领养流程再简化一些步骤。', ''),
  (NULL, '能否增加宠物健康档案的导出功能？', 'contact_wechat_123')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. favorites 收藏（为当前第一个用户添加两条收藏）
-- ============================================================
INSERT INTO public.favorites (user_id, pet_id)
SELECT u.id, p.id
FROM (SELECT id FROM auth.users LIMIT 1) u
CROSS JOIN (VALUES ('barnaby'), ('misty')) AS p(id)
WHERE NOT EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = u.id AND f.pet_id = p.id);

-- ============================================================
-- 3. adoption_applications 领养申请（一条示例申请）
-- ============================================================
INSERT INTO public.adoption_applications (
  user_id, pet_id, full_name, age, occupation, housing_type, living_status, has_experience, message, status
)
SELECT
  u.id,
  'loki',
  '李领养',
  '28',
  '软件工程师',
  '自有住房',
  '独居',
  TRUE,
  '家里有养狗经验，有稳定收入和充足时间，希望给洛基一个家。',
  'pending'
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.adoption_applications a
  WHERE a.user_id = u.id AND a.pet_id = 'loki'
);

-- ============================================================
-- 4. conversations 会话（一条与“送养人”的会话）
-- ============================================================
INSERT INTO public.conversations (user_id, other_user_name, other_user_avatar, last_message, last_message_time, unread_count, is_system)
SELECT
  u.id,
  '张医生',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDgVPpxg8HIumU7EpauZP9ZlqirzBnKLdJFGK3sIDR54NKgoMvWdCpOnQkKZ8i9pqr-ZwirabrItbbt19Vsp_Ks7rywsrwksbIasOlJwu_nzBSwVNsNqNU-QjsRBwhhPM8QaaDUMMydnkQNIgx8i8vIvll48zgOHd8bQb75k7SbZ6Q_TY-_ic2MXjg2J04C-ZxWIQTqZSB2ovFoiPFZMYQSivk3XgoNPRSlgXwh6z0jYRNW1FiTPEJPxBeGSAmJTnizmRheXOoL44o',
  '好的，周末可以来看巴纳比~',
  NOW() - INTERVAL '1 hour',
  1,
  FALSE
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations c
  WHERE c.user_id = u.id AND c.other_user_name = '张医生'
);

-- ============================================================
-- 5. chat_messages 聊天消息（为上面创建的会话插入几条消息）
-- ============================================================
INSERT INTO public.chat_messages (conversation_id, content, is_self)
SELECT c.id, msg.content, msg.is_self
FROM (
  SELECT id FROM public.conversations
  WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
  ORDER BY created_at DESC
  LIMIT 1
) c
CROSS JOIN (
  VALUES
    ('你好，想了解一下巴纳比的情况~', TRUE),
    ('巴纳比很健康，已绝育，性格活泼。', FALSE),
    ('好的，周末可以来看巴纳比~', FALSE)
) AS msg(content, is_self)
WHERE c.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.conversation_id = c.id);

-- ============================================================
-- 6. verifications 实名认证（为第一个用户插入一条待审核认证）
-- ============================================================
INSERT INTO public.verifications (user_id, real_name, id_type, id_number, status)
SELECT
  u.id,
  '王实名',
  '居民身份证',
  '310101199001011234',
  'pending'
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (SELECT 1 FROM public.verifications v WHERE v.user_id = u.id);

-- ============================================================
-- 7. lost_pet_alerts 应急广播（threetwoa-assistant 发布）
-- ============================================================
INSERT INTO public.lost_pet_alerts (
  user_id, pet_name, pet_type, pet_breed, pet_color, pet_gender, pet_age_text,
  avatar_url, description, lost_at, last_seen_at,
  location_text, latitude, longitude, radius_km,
  reward_text, contact_note, status, is_urgent
)
SELECT
  u.id,
  v.pet_name, v.pet_type, v.pet_breed, v.pet_color, v.pet_gender, v.pet_age_text,
  v.avatar_url, v.description, v.lost_at, v.last_seen_at,
  v.location_text, v.latitude, v.longitude, v.radius_km,
  v.reward_text, v.contact_note, v.status, v.is_urgent
FROM
  (SELECT id FROM auth.users WHERE email = '1012512411@qq.com' LIMIT 1) u,
  (VALUES
    (
      '小黄', 'dog', '金毛', '金黄色', 'male', '2 岁',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
      '我的金毛小黄于2月19日傍晚6点在静安寺地铁站附近走失，脖子上有蓝色项圈，项圈上有"小黄"刻字。它非常亲人，见人就摇尾巴，请好心人不要驱赶。发现后请原地等待或带至附近宠物医院扫芯片。',
      NOW() - INTERVAL '18 hours',
      NOW() - INTERVAL '17 hours',
      '上海市静安区静安寺地铁站附近', 31.2248, 121.4471, 5,
      '寻回奖励 500 元，感恩！',
      '微信同号：1012512411，或直接拨打电话，24小时在线',
      'active', TRUE
    ),
    (
      '橘猫团子', 'cat', '橘猫', '橘色白肚', 'male', '3 岁',
      'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=400&fit=crop',
      '团子是一只极其黏人的橘猫，从未独自出过门，2月18日下午因维修工人开门时趁机溜出，至今未归。它见到陌生人会躲但不攻击，饿了会主动找人，可能藏在附近停车场或绿化带。',
      NOW() - INTERVAL '42 hours',
      NOW() - INTERVAL '40 hours',
      '上海市徐汇区漕溪北路小区附近', 31.1940, 121.4370, 3,
      '寻回奖励 300 元',
      '请联系微信：threetwoa，或留言QQ：1012512411',
      'active', FALSE
    ),
    (
      '布偶猫露西', 'cat', '布偶猫', '双色（蓝白）', 'female', '1.5 岁',
      'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=400&h=400&fit=crop',
      '露西是一只未绝育的蓝白布偶，昨日午夜从浦东新区家里阳台走失，怀疑被人带走或自行跑到楼道躲避。她有芯片，扫描可查到主人联系方式。请各宠物医院、救助站留意，发现及时联系。',
      NOW() - INTERVAL '20 hours',
      NULL,
      '上海市浦东新区世纪大道附近小区', 31.2396, 121.5015, 8,
      '寻回奖励 800 元，布偶原价 1500 元',
      '急！请联系QQ：1012512411，随时接听',
      'active', TRUE
    )
  ) AS v(pet_name, pet_type, pet_breed, pet_color, pet_gender, pet_age_text,
         avatar_url, description, lost_at, last_seen_at,
         location_text, latitude, longitude, radius_km,
         reward_text, contact_note, status, is_urgent)
WHERE u.id IS NOT NULL;

-- ============================================================
-- 8. rescue_tasks 救助任务（threetwoa-assistant 发布）
-- ============================================================
INSERT INTO public.rescue_tasks (
  creator_id, title, task_type, description,
  location_text, latitude, longitude,
  window_start, window_end, status, max_assignees
)
SELECT
  u.id,
  v.title, v.task_type, v.description,
  v.location_text, v.latitude, v.longitude,
  v.window_start, v.window_end, 'open', v.max_assignees
FROM
  (SELECT id FROM auth.users WHERE email = '1012512411@qq.com' LIMIT 1) u,
  (VALUES
    (
      '紧急！流浪猫群喂食志愿者招募',
      'feeding',
      '静安区武定路一带有约 15 只流浪猫固定猫点，原负责人出差无人接手，需要志愿者每天早7点或晚6点喂食一次。猫粮由本人提供，只需定点投喂并拍照记录即可，适合附近上班族顺路帮忙。',
      '上海市静安区武定路近胶州路路口', 31.2310, 121.4560,
      NOW() + INTERVAL '2 hours',
      NOW() + INTERVAL '6 days 23 hours',
      2
    ),
    (
      '受伤流浪犬需紧急送医',
      'medical',
      '浦东新区世纪公园附近发现一只疑似被车撞伤的流浪中华田园犬，右后腿骨折无法站立，目前蜷缩在公园东门绿化带内。需要有私家车的志愿者协助送至最近的24小时宠物医院，医疗费用由本人承担，需要人手保定和运输。',
      '上海市浦东新区世纪公园东门绿化带', 31.2178, 121.5438,
      NOW() + INTERVAL '30 minutes',
      NOW() + INTERVAL '4 hours',
      2
    ),
    (
      '短期寄养：2只兔子需要代养7天',
      'foster',
      '因突发出差，家中两只荷兰矮耳兔（1公1母，已绝育）需要7天的寄养照料。兔子温顺不咬人，笼子和兔粮自带，每天只需喂食、换水、清理兔砂即可。有宠物饲养经验者优先，上门或接回均可协商。',
      '上海市徐汇区漕溪北路（可上门交接）', 31.1952, 121.4355,
      NOW() + INTERVAL '3 hours',
      NOW() + INTERVAL '1 day',
      1
    ),
    (
      '猫咪救助物资转运（嘉定→静安）',
      'transport',
      '嘉定区爱心救助站有一批捐赠物资（猫粮6袋约30kg、猫砂4袋、笼子2个）需要转运至静安区的救助驿站，当日完成即可。有SUV或货运能力的志愿者可报名，协助装卸并运输，油费可报销。',
      '上海市嘉定区嘉定镇街道（具体地址私信）', 31.3748, 121.2452,
      NOW() + INTERVAL '1 day',
      NOW() + INTERVAL '1 day 8 hours',
      1
    ),
    (
      '救助站紧急募集猫粮猫砂',
      'supplies',
      '本站目前收容流浪猫 23 只，存量猫粮仅剩 3 天用量，猫砂告急。急需爱心人士捐赠或采购：成猫粮（全价干粮）20kg 以上，猫砂（豆腐砂或膨润土）10包以上。可送至徐汇区驿站，或联系本人上门取件，每份捐赠都将拍照公示。',
      '上海市徐汇区流浪猫救助驿站（私信获取地址）', 31.2012, 121.4465,
      NOW(),
      NOW() + INTERVAL '3 days',
      5
    )
  ) AS v(title, task_type, description, location_text, latitude, longitude, window_start, window_end, max_assignees)
WHERE u.id IS NOT NULL;

-- ============================================================
-- 说明
-- ============================================================
-- profiles 表由 handle_new_user() 在用户注册时自动创建，无需种子数据。
-- 若 auth.users 中尚无用户，仅 feedback 会有数据；在 Supabase 后台先创建至少一个测试用户后再执行本文件，即可为其余表补充数据。
-- 可多次执行本文件，重复插入会因唯一约束或 EXISTS 条件被跳过。

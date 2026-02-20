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
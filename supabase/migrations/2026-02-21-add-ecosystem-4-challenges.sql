-- ============================================================
-- 生态四：宠物社群与城市挑战赛
-- challenges, challenge_participants, challenge_teams, achievement_badges
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. challenges 挑战赛定义表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  city_name       TEXT        NOT NULL DEFAULT '',
  reward_type     TEXT        NOT NULL DEFAULT 'points'
    CHECK (reward_type IN ('points', 'merch', 'cash', 'points_double')),
  reward_value    INTEGER     NOT NULL DEFAULT 0,
  reward_desc     TEXT,
  min_team_size   INTEGER     NOT NULL DEFAULT 1 CHECK (min_team_size >= 1 AND min_team_size <= 5),
  max_team_size   INTEGER     NOT NULL DEFAULT 5 CHECK (max_team_size >= 1 AND max_team_size <= 5),
  sponsor_name    TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
    CHECK (status IN ('upcoming', 'active', 'ended')),
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_city ON public.challenges(city_name);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON public.challenges(start_at, end_at);

DROP POLICY IF EXISTS "challenges_select_all" ON public.challenges;
CREATE POLICY "challenges_select_all" ON public.challenges
  FOR SELECT USING (true);

-- ------------------------------------------------------------
-- 2. challenge_teams 小队信息表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenge_teams (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  leader_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.challenge_teams ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenge_teams_challenge ON public.challenge_teams(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_teams_leader ON public.challenge_teams(leader_id);

DROP POLICY IF EXISTS "challenge_teams_select" ON public.challenge_teams;
CREATE POLICY "challenge_teams_select" ON public.challenge_teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "challenge_teams_insert_own" ON public.challenge_teams;
CREATE POLICY "challenge_teams_insert_own" ON public.challenge_teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "challenge_teams_update_leader" ON public.challenge_teams;
CREATE POLICY "challenge_teams_update_leader" ON public.challenge_teams
  FOR UPDATE USING (auth.uid() = leader_id);

-- ------------------------------------------------------------
-- 3. challenge_participants 参与记录表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id         UUID        REFERENCES public.challenge_teams(id) ON DELETE SET NULL,
  score           INTEGER     NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'completed')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_team ON public.challenge_participants(team_id);

DROP POLICY IF EXISTS "challenge_participants_select" ON public.challenge_participants;
CREATE POLICY "challenge_participants_select" ON public.challenge_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "challenge_participants_insert_own" ON public.challenge_participants;
CREATE POLICY "challenge_participants_insert_own" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_participants_update_own" ON public.challenge_participants;
CREATE POLICY "challenge_participants_update_own" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. achievement_badges 成就徽章表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievement_badges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key       TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  challenge_id    UUID        REFERENCES public.challenges(id) ON DELETE SET NULL,
  image_url       TEXT,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.achievement_badges ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_achievement_badges_user ON public.achievement_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_badges_key ON public.achievement_badges(badge_key);

DROP POLICY IF EXISTS "achievement_badges_select" ON public.achievement_badges;
CREATE POLICY "achievement_badges_select" ON public.achievement_badges
  FOR SELECT USING (true);

-- 徽章通过 RPC 或 service role 插入，或允许用户插入自己的（user_id = auth.uid()）
DROP POLICY IF EXISTS "achievement_badges_insert_own" ON public.achievement_badges;
CREATE POLICY "achievement_badges_insert_own" ON public.achievement_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. 种子数据：示例月度城市挑战（仅当表为空时插入）
-- ------------------------------------------------------------
INSERT INTO public.challenges (
  title, description, city_name, reward_type, reward_value, reward_desc,
  min_team_size, max_team_size, status, start_at, end_at
)
SELECT v.title, v.description, v.city_name, v.reward_type, v.reward_value, v.reward_desc,
  v.min_team_size, v.max_team_size, v.status, v.start_at, v.end_at
FROM (VALUES
  (
    '本月最会训练的狗主人',
    '完成至少 5 次遛狗打卡，分享训练心得，与同城宠友一起进步',
    '全国',
    'points',
    200,
    '前 10 名额外获得积分翻倍',
    1,
    5,
    'active',
    date_trunc('month', NOW())::timestamptz,
    date_trunc('month', NOW())::timestamptz + interval '1 month'
  ),
  (
    '猫咪健康打卡月',
    '每日记录猫咪饮食与健康数据，坚持 7 天即可获得成就徽章',
    '全国',
    'points_double',
    100,
    '积分翻倍 + 限量周边',
    3,
    5,
    'active',
    date_trunc('month', NOW())::timestamptz,
    date_trunc('month', NOW())::timestamptz + interval '1 month'
  )
) AS v(title, description, city_name, reward_type, reward_value, reward_desc, min_team_size, max_team_size, status, start_at, end_at)
WHERE NOT EXISTS (SELECT 1 FROM public.challenges LIMIT 1);

COMMIT;

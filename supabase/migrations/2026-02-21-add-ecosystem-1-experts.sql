-- ============================================================
-- 生态一：社区宠物达人体系
-- expert_profiles, expert_follows, expert_tips, expert_earnings
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. expert_profiles 达人档案表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level           TEXT        NOT NULL DEFAULT 'bronze'
    CHECK (level IN ('bronze', 'silver', 'gold')),
  certification_type TEXT     NOT NULL
    CHECK (certification_type IN ('trainer', 'nutritionist', 'medical_volunteer')),
  column_bio      TEXT        NOT NULL DEFAULT '',
  status          TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_expert_profiles_user ON public.expert_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_status ON public.expert_profiles(status) WHERE status = 'approved';

DROP POLICY IF EXISTS "expert_profiles_select_approved" ON public.expert_profiles;
CREATE POLICY "expert_profiles_select_approved" ON public.expert_profiles
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "expert_profiles_insert_own" ON public.expert_profiles;
CREATE POLICY "expert_profiles_insert_own" ON public.expert_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "expert_profiles_update_own" ON public.expert_profiles;
CREATE POLICY "expert_profiles_update_own" ON public.expert_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 2. expert_follows 粉丝关注关系表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_follows (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, expert_id)
);

ALTER TABLE public.expert_follows ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_expert_follows_follower ON public.expert_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_expert_follows_expert ON public.expert_follows(expert_id);

DROP POLICY IF EXISTS "expert_follows_select_own" ON public.expert_follows;
CREATE POLICY "expert_follows_select_own" ON public.expert_follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = expert_id);

DROP POLICY IF EXISTS "expert_follows_insert_own" ON public.expert_follows;
CREATE POLICY "expert_follows_insert_own" ON public.expert_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "expert_follows_delete_own" ON public.expert_follows;
CREATE POLICY "expert_follows_delete_own" ON public.expert_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ------------------------------------------------------------
-- 3. expert_tips 打赏记录表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_tips (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipper_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points          INTEGER     NOT NULL CHECK (points > 0),
  platform_take   INTEGER     NOT NULL DEFAULT 0 CHECK (platform_take >= 0),
  expert_received INTEGER     NOT NULL CHECK (expert_received >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expert_tips ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_expert_tips_tipper ON public.expert_tips(tipper_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_tips_expert ON public.expert_tips(expert_id, created_at DESC);

DROP POLICY IF EXISTS "expert_tips_select_own" ON public.expert_tips;
CREATE POLICY "expert_tips_select_own" ON public.expert_tips
  FOR SELECT USING (auth.uid() = tipper_id OR auth.uid() = expert_id);

DROP POLICY IF EXISTS "expert_tips_insert_via_rpc" ON public.expert_tips;
-- 打赏通过 tip_expert RPC 插入，不开放直接 INSERT

-- ------------------------------------------------------------
-- 4. expert_earnings 收益分成流水表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_earnings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL DEFAULT 'tip' CHECK (source IN ('tip')),
  amount      INTEGER     NOT NULL CHECK (amount >= 0),
  tip_id      UUID        REFERENCES public.expert_tips(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expert_earnings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_expert_earnings_expert ON public.expert_earnings(expert_id, created_at DESC);

DROP POLICY IF EXISTS "expert_earnings_select_own" ON public.expert_earnings;
CREATE POLICY "expert_earnings_select_own" ON public.expert_earnings
  FOR SELECT USING (auth.uid() = expert_id);

-- ------------------------------------------------------------
-- 5. tip_expert 打赏 RPC（积分扣除 + 达人收益 + 分成）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tip_expert(p_expert_id UUID, p_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipper_id    UUID;
  v_balance      INTEGER;
  v_platform_pct NUMERIC := 0.3;
  v_platform     INTEGER;
  v_expert_gets  INTEGER;
  v_tip_id       UUID;
BEGIN
  v_tipper_id := auth.uid();
  IF v_tipper_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  IF v_tipper_id = p_expert_id THEN
    RAISE EXCEPTION 'CANNOT_TIP_SELF';
  END IF;
  IF p_expert_id IS NULL OR p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'INVALID_PARAMS';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.expert_profiles ep WHERE ep.user_id = p_expert_id AND ep.status = 'approved') THEN
    RAISE EXCEPTION 'EXPERT_NOT_FOUND';
  END IF;

  v_platform := FLOOR(p_points * v_platform_pct)::INTEGER;
  v_expert_gets := p_points - v_platform;

  -- 扣除打赏者积分
  UPDATE public.profiles
  SET points = points - p_points,
      updated_at = NOW()
  WHERE id = v_tipper_id
    AND points >= p_points
  RETURNING points INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
  VALUES (v_tipper_id, 'expert_tip:' || p_expert_id::TEXT, -p_points, v_balance);

  -- 达人获得积分
  UPDATE public.profiles
  SET points = points + v_expert_gets,
      updated_at = NOW()
  WHERE id = p_expert_id;

  INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
  SELECT p_expert_id, 'expert_tip_received', v_expert_gets, points
  FROM public.profiles WHERE id = p_expert_id;

  -- 记录打赏
  INSERT INTO public.expert_tips (tipper_id, expert_id, points, platform_take, expert_received)
  VALUES (v_tipper_id, p_expert_id, p_points, v_platform, v_expert_gets)
  RETURNING id INTO v_tip_id;

  -- 记录达人收益流水
  INSERT INTO public.expert_earnings (expert_id, source, amount, tip_id)
  VALUES (p_expert_id, 'tip', v_expert_gets, v_tip_id);

  -- 返回打赏者剩余积分
  SELECT points INTO v_balance FROM public.profiles WHERE id = v_tipper_id;
  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.tip_expert(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tip_expert(UUID, INTEGER) TO authenticated;

-- 允许通过 service role 插入 expert_tips（RPC 内使用 auth.uid 上下文）
-- RPC 已用 SECURITY DEFINER 执行，INSERT 在 RPC 内完成，无需额外 policy

COMMIT;

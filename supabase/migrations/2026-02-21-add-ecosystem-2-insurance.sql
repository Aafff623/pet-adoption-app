-- ============================================================
-- Ecosystem 2: 宠物险与健康保障中心
-- ============================================================

BEGIN;

-- ────────── insurance_products 险种产品表 ──────────
CREATE TABLE IF NOT EXISTS public.insurance_products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  coverage_amount INTEGER     NOT NULL DEFAULT 0,
  premium_yuan    INTEGER     NOT NULL DEFAULT 0,
  points_per_yuan INTEGER     NOT NULL DEFAULT 10,
  category        TEXT        NOT NULL DEFAULT 'all' CHECK (category IN ('all', 'dog', 'cat', 'other')),
  min_age_months  INTEGER     NOT NULL DEFAULT 0,
  max_age_months  INTEGER,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_products_active_category
  ON public.insurance_products (is_active, category, sort_order);

ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active insurance products" ON public.insurance_products;
CREATE POLICY "Anyone can read active insurance products"
  ON public.insurance_products FOR SELECT
  USING (is_active = TRUE);

-- ────────── pet_insurance_policies 用户投保记录 ──────────
CREATE TABLE IF NOT EXISTS public.pet_insurance_policies (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id            TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  product_id        UUID        NOT NULL REFERENCES public.insurance_products(id) ON DELETE RESTRICT,
  premium_yuan      INTEGER     NOT NULL,
  points_used       INTEGER     NOT NULL DEFAULT 0,
  points_discount_yuan INTEGER  NOT NULL DEFAULT 0,
  status            TEXT        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  start_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at            TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_user
  ON public.pet_insurance_policies (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_pet
  ON public.pet_insurance_policies (pet_id);

ALTER TABLE public.pet_insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own policies" ON public.pet_insurance_policies;
CREATE POLICY "Users can read own policies"
  ON public.pet_insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own policies" ON public.pet_insurance_policies;
CREATE POLICY "Users can insert own policies"
  ON public.pet_insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────── insurance_claims 理赔申请与状态 ──────────
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id         UUID        NOT NULL REFERENCES public.pet_insurance_policies(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id            TEXT        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  claim_amount_yuan INTEGER     NOT NULL,
  description       TEXT        NOT NULL DEFAULT '',
  medical_image_url TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  reject_reason     TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy
  ON public.insurance_claims (policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_user
  ON public.insurance_claims (user_id, created_at DESC);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own claims" ON public.insurance_claims;
CREATE POLICY "Users can read own claims"
  ON public.insurance_claims FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own claims" ON public.insurance_claims;
CREATE POLICY "Users can insert own claims"
  ON public.insurance_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────── 种子数据：示例险种 ──────────
INSERT INTO public.insurance_products (name, description, coverage_amount, premium_yuan, points_per_yuan, category, min_age_months, max_age_months, sort_order)
VALUES
  ('萌宠基础保障', '覆盖常见疾病、意外伤害，适合健康幼宠', 5000, 299, 10, 'all', 2, 84, 1),
  ('犬类专属险', '专为狗狗设计，含疫苗、驱虫补贴', 8000, 399, 10, 'dog', 3, 96, 2),
  ('猫类专属险', '专为猫咪设计，含绝育补贴', 6000, 349, 10, 'cat', 2, 120, 3),
  ('老年宠关爱险', '7岁以上宠物专属，慢性病保障', 10000, 599, 10, 'all', 84, NULL, 4);

COMMIT;

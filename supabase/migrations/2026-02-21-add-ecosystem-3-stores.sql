-- ============================================================
-- 生态三：线下门店体验中心
-- stores, store_bookings, store_memberships, store_staff
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. stores 门店信息表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  store_type      TEXT        NOT NULL DEFAULT 'clinic'
    CHECK (store_type IN ('hospital', 'clinic', 'grooming', 'training', 'other')),
  address         TEXT        NOT NULL DEFAULT '',
  province        TEXT        DEFAULT '',
  city_name       TEXT        DEFAULT '',
  latitude        NUMERIC     DEFAULT NULL,
  longitude       NUMERIC     DEFAULT NULL,
  cover_image     TEXT        DEFAULT '',
  description     TEXT        DEFAULT '',
  business_hours  TEXT        DEFAULT '',
  contact_phone   TEXT        DEFAULT '',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_stores_province_city ON public.stores(province, city_name);
CREATE INDEX IF NOT EXISTS idx_stores_type ON public.stores(store_type);

DROP POLICY IF EXISTS "stores_select_all" ON public.stores;
CREATE POLICY "stores_select_all" ON public.stores
  FOR SELECT USING (is_active = TRUE);

-- ------------------------------------------------------------
-- 2. store_staff 店员信息表（需在 store_bookings 前创建，供 RLS 引用）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_staff (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'staff'
    CHECK (role IN ('manager', 'staff')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_staff_store ON public.store_staff(store_id);
CREATE INDEX IF NOT EXISTS idx_store_staff_user ON public.store_staff(user_id);

DROP POLICY IF EXISTS "store_staff_select_store" ON public.store_staff;
CREATE POLICY "store_staff_select_store" ON public.store_staff
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_staff_insert_own" ON public.store_staff;
CREATE POLICY "store_staff_insert_own" ON public.store_staff
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. store_bookings 预约记录表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_bookings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id        UUID        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  pet_id          TEXT        REFERENCES public.pets(id) ON DELETE SET NULL,
  service_type    TEXT        NOT NULL DEFAULT 'visit'
    CHECK (service_type IN ('visit', 'grooming', 'training', 'checkup', 'other')),
  booking_at      TIMESTAMPTZ NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'used', 'cancelled')),
  points_used     INTEGER     NOT NULL DEFAULT 0 CHECK (points_used >= 0),
  coupon_code     TEXT        DEFAULT NULL,
  note            TEXT        DEFAULT '',
  verified_at     TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.store_bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_bookings_user ON public.store_bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_bookings_store ON public.store_bookings(store_id, booking_at);
CREATE INDEX IF NOT EXISTS idx_store_bookings_status ON public.store_bookings(status);

DROP POLICY IF EXISTS "store_bookings_select_own" ON public.store_bookings;
CREATE POLICY "store_bookings_select_own" ON public.store_bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_bookings_insert_own" ON public.store_bookings;
CREATE POLICY "store_bookings_insert_own" ON public.store_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_bookings_update_own" ON public.store_bookings;
CREATE POLICY "store_bookings_update_own" ON public.store_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- 店员可查看/核销本店预约（通过 store_staff 关联）
DROP POLICY IF EXISTS "store_bookings_select_staff" ON public.store_bookings;
CREATE POLICY "store_bookings_select_staff" ON public.store_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.store_staff ss
      WHERE ss.store_id = store_bookings.store_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "store_bookings_update_staff" ON public.store_bookings;
CREATE POLICY "store_bookings_update_staff" ON public.store_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.store_staff ss
      WHERE ss.store_id = store_bookings.store_id
        AND ss.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. store_memberships 会员卡与门店绑定表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_memberships (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id        UUID        NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  membership_type TEXT        NOT NULL DEFAULT 'basic'
    CHECK (membership_type IN ('basic', 'silver', 'gold')),
  points          INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0),
  valid_until     DATE        DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

ALTER TABLE public.store_memberships ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_memberships_user ON public.store_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_store_memberships_store ON public.store_memberships(store_id);

DROP POLICY IF EXISTS "store_memberships_select_own" ON public.store_memberships;
CREATE POLICY "store_memberships_select_own" ON public.store_memberships
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_memberships_insert_own" ON public.store_memberships;
CREATE POLICY "store_memberships_insert_own" ON public.store_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "store_memberships_update_own" ON public.store_memberships;
CREATE POLICY "store_memberships_update_own" ON public.store_memberships
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. store_booking_redeem 预约积分核销 RPC
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.store_booking_redeem(
  p_store_id UUID,
  p_service_type TEXT,
  p_booking_at TIMESTAMPTZ,
  p_pet_id TEXT DEFAULT NULL,
  p_points_cost INTEGER DEFAULT 0,
  p_note TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID;
  v_balance   INTEGER;
  v_booking_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  IF p_store_id IS NULL OR p_booking_at IS NULL THEN
    RAISE EXCEPTION 'INVALID_PARAMS';
  END IF;

  IF p_points_cost > 0 THEN
    UPDATE public.profiles
    SET points = points - p_points_cost,
        updated_at = NOW()
    WHERE id = v_user_id
      AND points >= p_points_cost
    RETURNING points INTO v_balance;

    IF v_balance IS NULL THEN
      RAISE EXCEPTION 'INSUFFICIENT_POINTS';
    END IF;

    INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
    VALUES (v_user_id, 'store_booking:' || p_store_id::TEXT, -p_points_cost, v_balance);
  END IF;

  INSERT INTO public.store_bookings (
    user_id, store_id, pet_id, service_type, booking_at,
    status, points_used, note
  )
  VALUES (
    v_user_id, p_store_id, NULLIF(p_pet_id, ''), COALESCE(NULLIF(p_service_type, ''), 'visit'),
    p_booking_at, 'pending', COALESCE(p_points_cost, 0), COALESCE(p_note, '')
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.store_booking_redeem(UUID, TEXT, TIMESTAMPTZ, TEXT, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.store_booking_redeem(UUID, TEXT, TIMESTAMPTZ, TEXT, INTEGER, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 6. store_booking_verify 核销 RPC（店员调用）
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.store_booking_verify(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  SELECT store_id INTO v_store_id
  FROM public.store_bookings
  WHERE id = p_booking_id AND status IN ('pending', 'confirmed');

  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND_OR_INVALID';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.store_staff
    WHERE store_id = v_store_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'NOT_STAFF_OF_STORE';
  END IF;

  UPDATE public.store_bookings
  SET status = 'used', verified_at = NOW(), updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.store_booking_verify(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.store_booking_verify(UUID) TO authenticated;

-- ------------------------------------------------------------
-- 7. 种子数据：演示门店（仅当表为空时插入）
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stores LIMIT 1) THEN
    INSERT INTO public.stores (name, store_type, address, province, city_name, description, business_hours, contact_phone, sort_order)
    VALUES
      ('宠物之心体验中心', 'clinic', '上海市浦东新区张江高科技园区碧波路888号', '上海市', '浦东新区', '合作宠物诊所，提供健康体检、疫苗接种、基础诊疗。积分可兑换体检套餐。', '09:00-18:00', '021-12345678', 1),
      ('绿茵守护美容沙龙', 'grooming', '杭州市西湖区文三路456号', '浙江省', '杭州市', '专业宠物美容护理，洗护、造型、SPA。会员享积分抵扣。', '10:00-20:00', '0571-87654321', 2),
      ('安爪宠医训练基地', 'training', '成都市武侯区天府大道中段666号', '四川省', '成都市', '宠物行为训练、社会化课程。支持积分预约体验课。', '08:30-17:30', '028-11112222', 3);
  END IF;
END $$;

COMMIT;

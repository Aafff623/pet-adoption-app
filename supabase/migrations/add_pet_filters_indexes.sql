-- ============================================================
-- Task 5: 首页筛选性能索引
-- 将性别 / 紧急 / 位置筛选下沉到数据库层
-- ============================================================

CREATE INDEX IF NOT EXISTS pets_gender_idx
  ON public.pets(gender);

CREATE INDEX IF NOT EXISTS pets_urgent_idx
  ON public.pets(is_urgent)
  WHERE is_urgent = TRUE;

CREATE INDEX IF NOT EXISTS pets_status_category_created_idx
  ON public.pets(status, category, created_at DESC);

CREATE INDEX IF NOT EXISTS pets_location_idx
  ON public.pets(location);

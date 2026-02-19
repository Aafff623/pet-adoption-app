-- ============================================================
-- Task 4: 实名认证敏感数据治理
-- 不再存储明文证件号，改为哈希值 + 后4位
-- ============================================================

-- 1. 添加新字段
ALTER TABLE public.verifications
  ADD COLUMN IF NOT EXISTS id_number_hash TEXT,
  ADD COLUMN IF NOT EXISTS id_number_last4 TEXT;

-- 2. 将 id_number 改为可空（历史数据保留兼容，新数据不写入）
ALTER TABLE public.verifications
  ALTER COLUMN id_number DROP NOT NULL;

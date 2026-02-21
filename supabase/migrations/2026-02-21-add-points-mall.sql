BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 360;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_points_non_negative'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_points_non_negative CHECK (points >= 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.points_transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key      TEXT        NOT NULL,
  delta         INTEGER     NOT NULL,
  balance_after INTEGER     NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "points_transactions_select_own" ON public.points_transactions;
CREATE POLICY "points_transactions_select_own"
  ON public.points_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_created
  ON public.points_transactions(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.redeem_points(p_item_key TEXT, p_cost INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  IF p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'INVALID_COST';
  END IF;

  UPDATE public.profiles
  SET points = points - p_cost,
      updated_at = NOW()
  WHERE id = v_user_id
    AND points >= p_cost
  RETURNING points INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
  VALUES (v_user_id, COALESCE(p_item_key, 'unknown'), -p_cost, v_balance);

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_points(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_points(TEXT, INTEGER) TO authenticated;

COMMIT;

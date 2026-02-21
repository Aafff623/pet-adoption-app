BEGIN;

CREATE TABLE IF NOT EXISTS public.points_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_key text NOT NULL,
  points integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE public.points_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "points_donations_select_own" ON public.points_donations;
CREATE POLICY "points_donations_select_own"
  ON public.points_donations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_donations_insert_own" ON public.points_donations;
CREATE POLICY "points_donations_insert_own"
  ON public.points_donations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_points_donations_user_created
  ON public.points_donations(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.donate_points(
  p_partner_key text,
  p_points integer,
  p_note text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_balance integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  IF p_partner_key IS NULL OR TRIM(p_partner_key) = '' THEN
    RAISE EXCEPTION 'INVALID_PARTNER';
  END IF;
  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'INVALID_POINTS';
  END IF;

  UPDATE public.profiles
  SET points = points - p_points,
      updated_at = NOW()
  WHERE id = v_user_id
    AND points >= p_points
  RETURNING points INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
  VALUES (v_user_id, CONCAT('donation:', p_partner_key), -p_points, v_balance);

  INSERT INTO public.points_donations (user_id, partner_key, points, note)
  VALUES (v_user_id, p_partner_key, p_points, p_note);

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.donate_points(text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.donate_points(text, integer, text) TO authenticated;

COMMIT;

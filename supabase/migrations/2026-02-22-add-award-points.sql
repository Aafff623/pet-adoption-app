BEGIN;

CREATE OR REPLACE FUNCTION public.grant_points(p_item_key TEXT, p_points INTEGER)
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
  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'INVALID_POINTS';
  END IF;
  UPDATE public.profiles
  SET points = points + p_points,
      updated_at = NOW()
  WHERE id = v_user_id
  RETURNING points INTO v_balance;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;
  INSERT INTO public.points_transactions (user_id, item_key, delta, balance_after)
  VALUES (v_user_id, COALESCE(p_item_key, 'unknown'), p_points, v_balance);
  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_points(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_points(TEXT, INTEGER) TO authenticated;

COMMIT;

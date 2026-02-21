ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.profiles p
SET email = COALESCE(p.email, au.email)
FROM auth.users au
WHERE p.id = au.id
  AND (p.email IS NULL OR p.email = '');

CREATE OR REPLACE FUNCTION public.sync_profile_email_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email_from_auth ON auth.users;
CREATE TRIGGER trg_sync_profile_email_from_auth
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email_from_auth();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '宠物爱好者'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nickname = COALESCE(EXCLUDED.nickname, public.profiles.nickname),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

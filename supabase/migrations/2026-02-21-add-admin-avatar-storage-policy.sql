INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "avatars_admin_insert_public" ON storage.objects;
CREATE POLICY "avatars_admin_insert_public"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'admin'
);

DROP POLICY IF EXISTS "avatars_admin_update_public" ON storage.objects;
CREATE POLICY "avatars_admin_update_public"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'admin'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'admin'
);

DROP POLICY IF EXISTS "avatars_admin_delete_public" ON storage.objects;
CREATE POLICY "avatars_admin_delete_public"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'admin'
);

DROP POLICY IF EXISTS "avatars_admin_select_public" ON storage.objects;
CREATE POLICY "avatars_admin_select_public"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'admin'
);

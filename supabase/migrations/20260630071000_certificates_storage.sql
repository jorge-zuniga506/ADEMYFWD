-- Bucket privado para certificados de graduación subidos por instructores
-- en la zona VIP+FWD. A diferencia de "avatars", este bucket NO es público:
-- el acceso se hace vía Signed URLs generadas en el server
-- (app/api/instructor/verify-certificate/route.ts ya usa createSignedUrl).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  false,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own certificate" ON storage.objects;
CREATE POLICY "Users can upload own certificate"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can view own certificate" ON storage.objects;
CREATE POLICY "Users can view own certificate"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificates' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Uploads/reads for admin review and AI analysis happen server-side via the
-- service role key (bypasses RLS), same pattern as lib/actions/profile.ts.

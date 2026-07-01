-- Admin needs to see/manage rows beyond their own for the VIP membership +
-- VIP+FWD verification admin panels. Reuses the public.es_admin() helper
-- already defined in 20260629183900_rls_policies.sql.

DROP POLICY IF EXISTS "Admin ve todas las membresias" ON "UserMembership";
CREATE POLICY "Admin ve todas las membresias"
  ON "UserMembership" FOR SELECT
  TO authenticated
  USING (public.es_admin());

DROP POLICY IF EXISTS "Admin gestiona verificaciones" ON "InstructorVerification";
CREATE POLICY "Admin gestiona verificaciones"
  ON "InstructorVerification" FOR ALL
  TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

-- Pre-existing gap: there was no admin-wide UPDATE policy on "User" at all,
-- meaning approveFwdCredential/updateUserRole (already in the app) and the
-- new approveInstructorVerification silently no-op'd under RLS. This closes
-- that gap.
DROP POLICY IF EXISTS "Admin actualiza cualquier usuario" ON "User";
CREATE POLICY "Admin actualiza cualquier usuario"
  ON "User" FOR UPDATE
  TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

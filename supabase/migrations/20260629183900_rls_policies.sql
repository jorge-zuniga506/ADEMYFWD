-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FwdCredential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Section" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CourseReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FwdJobPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FwdCodeSnippet" ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid RLS infinite recursion
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid() AND rol = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.es_instructor()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid() AND rol = 'INSTRUCTOR'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. User
-- ============================================================
CREATE POLICY "Usuarios ven su propio perfil"
  ON "User" FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin ve todos los usuarios"
  ON "User" FOR SELECT
  TO authenticated
  USING (public.es_admin());

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON "User" FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. FwdCredential
-- ============================================================
CREATE POLICY "Usuarios ven su propio credential"
  ON "FwdCredential" FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "Admin gestiona credentials"
  ON "FwdCredential" FOR ALL
  TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY "Usuarios crean su propio credential"
  ON "FwdCredential" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

-- ============================================================
-- 3. Category
-- ============================================================
CREATE POLICY "Todos ven categorías"
  ON "Category" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin gestiona categorías"
  ON "Category" FOR ALL
  TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

-- ============================================================
-- 4. Course
-- ============================================================
CREATE POLICY "Todos ven cursos"
  ON "Course" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Instructor crea sus cursos"
  ON "Course" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "instructorId");

CREATE POLICY "Instructor actualiza sus cursos"
  ON "Course" FOR UPDATE
  TO authenticated
  USING (auth.uid() = "instructorId")
  WITH CHECK (auth.uid() = "instructorId");

CREATE POLICY "Instructor elimina sus cursos"
  ON "Course" FOR DELETE
  TO authenticated
  USING (auth.uid() = "instructorId");

-- ============================================================
-- 5. Section
-- ============================================================
CREATE POLICY "Todos ven secciones"
  ON "Section" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Instructor gestiona secciones de su curso"
  ON "Section" FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT "instructorId" FROM "Course" WHERE id = "courseId"))
  WITH CHECK (auth.uid() IN (SELECT "instructorId" FROM "Course" WHERE id = "courseId"));

-- ============================================================
-- 6. Lesson
-- ============================================================
CREATE POLICY "Todos ven lecciones (públicas gratis, completo si inscrito)"
  ON "Lesson" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Instructor gestiona lecciones de su curso"
  ON "Lesson" FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT "instructorId" FROM "Course" WHERE id = (SELECT "courseId" FROM "Section" WHERE id = "sectionId")))
  WITH CHECK (auth.uid() IN (SELECT "instructorId" FROM "Course" WHERE id = (SELECT "courseId" FROM "Section" WHERE id = "sectionId")));

-- ============================================================
-- 7. Enrollment
-- ============================================================
CREATE POLICY "Usuario ve sus propias inscripciones"
  ON "Enrollment" FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "Instructor ve inscripciones de sus cursos"
  ON "Enrollment" FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT "instructorId" FROM "Course" WHERE id = "courseId"));

CREATE POLICY "Usuario se inscribe (compra)"
  ON "Enrollment" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

-- ============================================================
-- 8. CourseReview
-- ============================================================
CREATE POLICY "Todos ven reseñas"
  ON "CourseReview" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Usuario crea su propia reseña"
  ON "CourseReview" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Usuario actualiza su propia reseña"
  ON "CourseReview" FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Usuario elimina su propia reseña"
  ON "CourseReview" FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");

-- ============================================================
-- 9. FwdJobPost
-- ============================================================
CREATE POLICY "Todos ven ofertas laborales"
  ON "FwdJobPost" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 10. FwdCodeSnippet
-- ============================================================
CREATE POLICY "Todos ven snippets"
  ON "FwdCodeSnippet" FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Usuario crea su snippet"
  ON "FwdCodeSnippet" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Usuario actualiza su snippet"
  ON "FwdCodeSnippet" FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Usuario elimina su snippet"
  ON "FwdCodeSnippet" FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");

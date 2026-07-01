-- Create enum types
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ESTUDIANTE', 'INSTRUCTOR', 'GRADUADO_FWD', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- MÓDULO 1: USUARIOS Y SEGURIDAD
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  rol "Role" NOT NULL DEFAULT 'ESTUDIANTE',
  "fechaRegistro" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "FwdCredential" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "documentoUrl" TEXT NOT NULL,
  estado "VerificationStatus" NOT NULL DEFAULT 'PENDIENTE',
  "notasAdmin" TEXT,
  "fechaSolicitud" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MÓDULO 2: CATÁLOGO DE CURSOS
CREATE TABLE IF NOT EXISTS "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Course" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "instructorId" UUID NOT NULL REFERENCES "User"(id),
  "categoryId" UUID NOT NULL REFERENCES "Category"(id),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio FLOAT NOT NULL DEFAULT 0.0,
  "esExclusivoFwd" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Section" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Lesson" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sectionId" UUID NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  orden INT NOT NULL,
  "esGratis" BOOLEAN NOT NULL DEFAULT false
);

-- MÓDULO 3: COMPRAS E INTERACCIÓN
CREATE TABLE IF NOT EXISTS "Enrollment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  progreso INT NOT NULL DEFAULT 0,
  UNIQUE("userId", "courseId")
);

CREATE TABLE IF NOT EXISTS "CourseReview" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  estrellas INT NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
  comentario TEXT
);

-- MÓDULO 4: ECOSISTEMA VIP FWD
CREATE TABLE IF NOT EXISTS "FwdJobPost" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL,
  "tituloPuesto" TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  salario TEXT,
  "fechaCreacion" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "FwdCodeSnippet" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  "codigoTexto" TEXT NOT NULL,
  "fechaCreacion" TIMESTAMPTZ NOT NULL DEFAULT now()
);

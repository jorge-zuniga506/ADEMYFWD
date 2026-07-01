-- ============================================================
-- Sistema de Membresías VIP (Stripe real) + Verificación de
-- instructores VIP+FWD. Formaliza scripts/setup-vip-system.sql
-- como migración, con soporte de Stripe y estado de pago pendiente.
-- ============================================================

-- 1. ENUM for membership type
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipTipo') THEN
    CREATE TYPE "MembershipTipo" AS ENUM ('DESCUENTO', 'ESTANDAR', 'PRO_MAX');
  END IF;
END $$;

-- 2. ENUM for membership status (incluye PENDIENTE_PAGO: la fila se crea
--    al iniciar el checkout de Stripe y solo pasa a ACTIVA cuando el
--    webhook confirma el pago real).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipEstado') THEN
    CREATE TYPE "MembershipEstado" AS ENUM ('PENDIENTE_PAGO', 'ACTIVA', 'VENCIDA', 'CANCELADA');
  END IF;
END $$;

-- If the type already existed from an earlier, unmigrated version of this
-- schema, make sure it has the PENDIENTE_PAGO value too.
ALTER TYPE "MembershipEstado" ADD VALUE IF NOT EXISTS 'PENDIENTE_PAGO';

-- 3. ENUM for instructor certificate verification status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificacionEstado') THEN
    CREATE TYPE "VerificacionEstado" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');
  END IF;
END $$;

-- 4. Membership catalog table
CREATE TABLE IF NOT EXISTS "Membership" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre"               TEXT NOT NULL,
  "descripcion"          TEXT,
  "precio"               DECIMAL(10,2) NOT NULL,
  "tipo"                 "MembershipTipo" NOT NULL,
  "descuentoPorcentaje"  INT DEFAULT 0,
  "beneficios"           JSONB DEFAULT '[]',
  "activa"               BOOLEAN DEFAULT true,
  "createdAt"            TIMESTAMPTZ DEFAULT now()
);

-- 5. UserMembership — active subscriptions, reconciled against Stripe
CREATE TABLE IF NOT EXISTS "UserMembership" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "membershipId"         UUID NOT NULL REFERENCES "Membership"("id"),
  "fechaInicio"          TIMESTAMPTZ DEFAULT now(),
  "fechaFin"             TIMESTAMPTZ,
  "estado"               "MembershipEstado" DEFAULT 'PENDIENTE_PAGO',
  "montoPagado"          DECIMAL(10,2) NOT NULL,
  "stripeCustomerId"     TEXT,
  "stripeSubscriptionId" TEXT,
  "stripeSessionId"      TEXT,
  "createdAt"            TIMESTAMPTZ DEFAULT now()
);

-- If UserMembership already existed from an earlier, unmigrated version of
-- this schema, add the Stripe reconciliation columns it was missing.
ALTER TABLE "UserMembership" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "UserMembership" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "UserMembership" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;

CREATE INDEX IF NOT EXISTS "UserMembership_stripeSubscriptionId_idx" ON "UserMembership"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "UserMembership_stripeSessionId_idx" ON "UserMembership"("stripeSessionId");

-- 6. InstructorVerification — FWD certificate AI analysis
CREATE TABLE IF NOT EXISTS "InstructorVerification" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"          UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "certificadoUrl"  TEXT NOT NULL,
  "estado"          "VerificacionEstado" DEFAULT 'PENDIENTE',
  "analisisIA"      JSONB,
  "puntuacion"      INT DEFAULT 0,
  "comentario"      TEXT,
  "revisadoEn"      TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ DEFAULT now()
);

-- 7. Add columns to User if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='isVerified') THEN
    ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 8. Enable RLS
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstructorVerification" ENABLE ROW LEVEL SECURITY;

-- Public can read active memberships
DROP POLICY IF EXISTS "Anyone can view active memberships" ON "Membership";
CREATE POLICY "Anyone can view active memberships"
  ON "Membership" FOR SELECT USING (activa = true);

-- Users can read own memberships
DROP POLICY IF EXISTS "Users view own membership" ON "UserMembership";
CREATE POLICY "Users view own membership"
  ON "UserMembership" FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = "userId");

-- Users can read own verifications
DROP POLICY IF EXISTS "Users view own verification" ON "InstructorVerification";
CREATE POLICY "Users view own verification"
  ON "InstructorVerification" FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = "userId");

DROP POLICY IF EXISTS "Users insert own verification" ON "InstructorVerification";
CREATE POLICY "Users insert own verification"
  ON "InstructorVerification" FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "userId");

-- Note: UserMembership inserts/updates for real purchases go through the
-- server-side Stripe checkout/webhook routes using the service role key
-- (bypasses RLS by design, same pattern as lib/actions/profile.ts avatar
-- uploads), so no client-facing INSERT/UPDATE policy is defined here.

-- 9. Seed the 3 membership tiers (idempotent by name)
INSERT INTO "Membership" ("nombre", "descripcion", "precio", "tipo", "descuentoPorcentaje", "beneficios")
SELECT * FROM (VALUES
(
  'Básico FWD',
  'Ideal para comenzar. Descuentos exclusivos en todos los cursos de la plataforma.',
  9.99::decimal(10,2),
  'DESCUENTO'::"MembershipTipo",
  20,
  '[
    "20% de descuento en todos los cursos",
    "Acceso a materiales complementarios",
    "Badge de miembro en tu perfil",
    "Newsletter mensual exclusivo"
  ]'::jsonb
),
(
  'Plus FWD',
  'El equilibrio perfecto. Más descuentos, prioridad en soporte y certificados ilimitados.',
  24.99::decimal(10,2),
  'ESTANDAR'::"MembershipTipo",
  40,
  '[
    "40% de descuento en todos los cursos",
    "Acceso prioritario a Q&A con instructores",
    "Certificados verificados ilimitados",
    "Badge Plus en tu perfil",
    "Acceso a sesiones grupales en vivo",
    "Soporte por chat prioritario"
  ]'::jsonb
),
(
  'Pro Max FWD',
  'La membresía definitiva. Todos los cursos incluidos sin costo adicional. Precio especial premium.',
  79.99::decimal(10,2),
  'PRO_MAX'::"MembershipTipo",
  100,
  '[
    "TODOS los cursos gratis incluidos",
    "Acceso anticipado a cursos nuevos",
    "Soporte 1:1 con instructores verificados",
    "Badge Pro Max dorado en tu perfil",
    "Acceso a comunidad VIP exclusiva",
    "Mentorías mensuales grupales",
    "Los instructores reciben su comisión normal por cada curso"
  ]'::jsonb
)
) AS v("nombre", "descripcion", "precio", "tipo", "descuentoPorcentaje", "beneficios")
WHERE NOT EXISTS (SELECT 1 FROM "Membership" m WHERE m."nombre" = v."nombre");

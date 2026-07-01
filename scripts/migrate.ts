import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "gjyvstwxmawxmkuejwax";
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  throw new Error("SUPABASE_MANAGEMENT_TOKEN no está definido en .env.local");
}

const sql = `
DO $$ BEGIN
  CREATE TYPE "CourseStatus" AS ENUM ('BORRADOR', 'EN_REVISION', 'PUBLICADO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "estado" "CourseStatus" NOT NULL DEFAULT 'BORRADOR';
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "duracionHoras" FLOAT DEFAULT 0;

ALTER TABLE "FwdJobPost" ADD COLUMN IF NOT EXISTS "estado" "VerificationStatus" NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE "FwdJobPost" ADD COLUMN IF NOT EXISTS "usuarioId" UUID REFERENCES "User"(id);

ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "completado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "fechaCompletado" TIMESTAMPTZ;
`;

async function migrate() {
  console.log("Ejecutando migracion...");
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text.substring(0, 1000));
}

migrate().catch(console.error);

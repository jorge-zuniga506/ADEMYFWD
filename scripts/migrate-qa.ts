import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "gjyvstwxmawxmkuejwax";
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  throw new Error("SUPABASE_MANAGEMENT_TOKEN no está definido en .env.local");
}

const sql = `
CREATE TABLE IF NOT EXISTS "Question" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES "User"(id),
  courseId UUID NOT NULL REFERENCES "Course"(id),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  fechaCreacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  resuelta BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Respuesta" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionId UUID NOT NULL REFERENCES "Question"(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES "User"(id),
  contenido TEXT NOT NULL,
  fechaCreacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS fotoUrl TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS redesSociales JSONB DEFAULT '{}';
`;

async function migrate() {
  console.log("Ejecutando migracion Q&A...");
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
  console.log("Respuesta:", text.substring(0, 1000));
}

migrate().catch(console.error);

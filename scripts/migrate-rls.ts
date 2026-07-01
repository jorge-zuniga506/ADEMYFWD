import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "gjyvstwxmawxmkuejwax";
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  throw new Error("SUPABASE_MANAGEMENT_TOKEN no está definido en .env.local");
}

const sql = `
  ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingDone" BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "propositoUso" TEXT;
  ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "comoNosConocio" TEXT;

  ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "user_select_own" ON "User";
  CREATE POLICY "user_select_own" ON "User"
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "user_insert_own" ON "User";
  CREATE POLICY "user_insert_own" ON "User"
    FOR INSERT WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "user_update_own" ON "User";
  CREATE POLICY "user_update_own" ON "User"
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "enrollment_select_own" ON "Enrollment";
  CREATE POLICY "enrollment_select_own" ON "Enrollment"
    FOR SELECT USING (auth.uid() = "userId");
  DROP POLICY IF EXISTS "enrollment_insert_own" ON "Enrollment";
  CREATE POLICY "enrollment_insert_own" ON "Enrollment"
    FOR INSERT WITH CHECK (auth.uid() = "userId");
  DROP POLICY IF EXISTS "enrollment_update_own" ON "Enrollment";
  CREATE POLICY "enrollment_update_own" ON "Enrollment"
    FOR UPDATE USING (auth.uid() = "userId");
`;

async function migrate() {
  console.log("Aplicando politicas RLS...");
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

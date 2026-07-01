import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "gjyvstwxmawxmkuejwax";
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  throw new Error("SUPABASE_MANAGEMENT_TOKEN no está definido en .env.local");
}

async function run(sql: string) {
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
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${text}`);
  }
  try {
    const data = JSON.parse(text);
    if (data.error) {
      throw new Error(`PostgreSQL Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    if (Array.isArray(data) && data.some((d) => d.error)) {
      const err = data.find((d) => d.error);
      throw new Error(`PostgreSQL Error: ${err.error.message || JSON.stringify(err.error)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.startsWith("PostgreSQL Error")) throw e;
  }
  return { status: res.status, body: text };
}

async function main() {
  const dir = path.join(process.cwd(), "supabase", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const only = process.argv[2];
  const target = only ? files.filter((f) => f.includes(only)) : files;

  if (target.length === 0) {
    console.log("No hay migraciones que coincidan.");
    return;
  }

  for (const file of target) {
    console.log(`Aplicando ${file}...`);
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await run(sql);
    console.log(`  OK`);
  }

  console.log("Migraciones aplicadas.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

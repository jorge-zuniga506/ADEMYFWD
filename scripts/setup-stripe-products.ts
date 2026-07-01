import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está definido en .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENV_VAR_BY_TIPO: Record<string, string> = {
  DESCUENTO: "STRIPE_PRICE_DESCUENTO",
  ESTANDAR: "STRIPE_PRICE_ESTANDAR",
  PRO_MAX: "STRIPE_PRICE_PRO_MAX",
};

async function main() {
  const { data: memberships, error } = await supabase
    .from("Membership")
    .select("id, nombre, descripcion, precio, tipo")
    .eq("activa", true);

  if (error) throw error;
  if (!memberships || memberships.length === 0) {
    throw new Error("No hay membresías activas en la base de datos. Corre las migraciones primero.");
  }

  console.log("Creando Products + Prices recurrentes en Stripe...\n");

  const results: { tipo: string; priceId: string }[] = [];

  for (const m of memberships) {
    const product = await stripe.products.create({
      name: m.nombre,
      description: m.descripcion ?? undefined,
      metadata: { membershipId: m.id, tipo: m.tipo },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: Math.round(m.precio * 100),
      recurring: { interval: "month" },
      metadata: { membershipId: m.id, tipo: m.tipo },
    });

    results.push({ tipo: m.tipo, priceId: price.id });
    console.log(`${m.nombre} (${m.tipo}) -> ${price.id}`);
  }

  console.log("\nAgrega estas líneas a tu .env.local:\n");
  for (const r of results) {
    const envVar = ENV_VAR_BY_TIPO[r.tipo];
    if (envVar) console.log(`${envVar}=${r.priceId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PRICE_ENV_BY_TIPO: Record<string, string | undefined> = {
  DESCUENTO: process.env.STRIPE_PRICE_DESCUENTO,
  ESTANDAR: process.env.STRIPE_PRICE_ESTANDAR,
  PRO_MAX: process.env.STRIPE_PRICE_PRO_MAX,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { membershipId } = await request.json();
  if (!membershipId) return NextResponse.json({ error: "membershipId requerido" }, { status: 400 });

  const service = getServiceClient();

  const { data: membership, error: mErr } = await service
    .from("Membership")
    .select("*")
    .eq("id", membershipId)
    .single();

  if (mErr || !membership) {
    return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });
  }

  const priceId = PRICE_ENV_BY_TIPO[membership.tipo];
  if (!priceId) {
    return NextResponse.json(
      { error: "Esta membresía todavía no está configurada en Stripe. Corre npm run stripe:setup." },
      { status: 500 }
    );
  }

  const { data: userData } = await service
    .from("User")
    .select("nombre, email")
    .eq("id", user.id)
    .single();

  // Reuse an existing Stripe customer for this user if we have one on file.
  const { data: priorMembership } = await service
    .from("UserMembership")
    .select("stripeCustomerId")
    .eq("userId", user.id)
    .not("stripeCustomerId", "is", null)
    .limit(1)
    .maybeSingle();

  let customerId = priorMembership?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData?.email ?? user.email ?? undefined,
      name: userData?.nombre ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/student/membresia?success=1`,
    cancel_url: `${origin}/dashboard/student/membresia?canceled=1`,
    metadata: { userId: user.id, membershipId },
    subscription_data: { metadata: { userId: user.id, membershipId } },
  });

  // Register the pending subscription — only becomes ACTIVA when the Stripe
  // webhook confirms the payment (app/api/stripe/webhook/route.ts).
  const { error: subErr } = await service.from("UserMembership").insert({
    userId: user.id,
    membershipId,
    estado: "PENDIENTE_PAGO",
    montoPagado: membership.precio,
    stripeCustomerId: customerId,
    stripeSessionId: session.id,
  });

  if (subErr) {
    console.error("Error creando UserMembership pendiente:", subErr);
    return NextResponse.json({ error: "Error al iniciar la suscripción" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { notifyAdminWithTemplate, sendEmailWithTemplate } from "@/lib/email";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Stripe requires the raw request body to verify the webhook signature.
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Firma de webhook inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const service = getServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const membershipId = session.metadata?.membershipId;
      if (!userId || !membershipId) break;

      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 30);

      const { data: activated } = await service
        .from("UserMembership")
        .update({
          estado: "ACTIVA",
          fechaFin: fechaFin.toISOString(),
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
        })
        .eq("stripeSessionId", session.id)
        .select()
        .single();

      // Only one active membership per user — cancel any others.
      if (activated) {
        await service
          .from("UserMembership")
          .update({ estado: "CANCELADA" })
          .eq("userId", userId)
          .eq("estado", "ACTIVA")
          .neq("id", activated.id);
      }

      const [{ data: userData }, { data: membership }] = await Promise.all([
        service.from("User").select("nombre, email").eq("id", userId).single(),
        service.from("Membership").select("nombre, precio").eq("id", membershipId).single(),
      ]);

      await notifyAdminWithTemplate(
        `Nueva membresía VIP: ${membership?.nombre ?? membershipId}`,
        "Nueva Suscripción VIP",
        [
          { label: "Usuario", value: `${userData?.nombre} (${userData?.email})` },
          { label: "Plan", value: membership?.nombre ?? "N/A" },
          { label: "Precio", value: `$${membership?.precio}/mes` },
          { label: "Fecha", value: new Date().toLocaleString() },
        ]
      );

      // Enviar correo de confirmación de acceso VIP al estudiante
      if (userData?.email) {
        try {
          await sendEmailWithTemplate(
            userData.email,
            `¡Tu acceso VIP a U-Forward+ está activo! 💎`,
            `¡Te damos la bienvenida al nivel VIP!`,
            [
              { label: "Membresía", value: membership?.nombre ?? "Membresía VIP" },
              { label: "Estudiante", value: userData.nombre },
              { label: "Precio", value: `$${membership?.precio ?? 0}/mes` },
              { label: "Estado del Acceso", value: "Activo (Renovación mensual)" },
              { label: "Fecha de Activación", value: new Date().toLocaleDateString("es-ES") }
            ],
            `https://u-forward.vercel.app/cursos`,
            "VER CATÁLOGO VIP U-FORWARD+"
          );
        } catch (mailErr) {
          console.error("Error al enviar correo VIP al alumno:", mailErr);
        }
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (!subscriptionId) break;

      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 30);

      await service
        .from("UserMembership")
        .update({ estado: "ACTIVA", fechaFin: fechaFin.toISOString() })
        .eq("stripeSubscriptionId", subscriptionId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await service
        .from("UserMembership")
        .update({ estado: "CANCELADA" })
        .eq("stripeSubscriptionId", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (!subscriptionId) break;

      await service
        .from("UserMembership")
        .update({ estado: "VENCIDA" })
        .eq("stripeSubscriptionId", subscriptionId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// Stripe has moved the subscription reference on invoices across API
// versions (top-level `subscription` vs `parent.subscription_details.subscription`).
// Check both so this keeps working regardless of which shape the account uses.
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const withLegacyField = invoice as unknown as { subscription?: string | { id: string } | null };
  const legacy = withLegacyField.subscription;
  if (legacy) return typeof legacy === "string" ? legacy : legacy.id;

  const withParent = invoice as unknown as {
    parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null;
  };
  const nested = withParent.parent?.subscription_details?.subscription;
  if (nested) return typeof nested === "string" ? nested : nested.id;

  return null;
}

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notifyAdminWithTemplate } from "@/lib/email";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const service = getServiceClient();

  // Check if user has a Pro Max membership
  const { data: activeMembership } = await service
    .from("UserMembership")
    .select("id, membershipId, Membership(tipo, nombre)")
    .eq("userId", user.id)
    .eq("estado", "ACTIVA")
    .gte("fechaFin", new Date().toISOString())
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  const isProMax =
    activeMembership &&
    (activeMembership.Membership as unknown as { tipo: string } | null)?.tipo === "PRO_MAX";

  // Enroll the user
  const { error } = await service.from("Enrollment").insert({
    userId: user.id,
    courseId,
    progreso: 0,
    completado: false,
  });

  if (error) {
    console.error("Supabase enrollment insert error:", error);
  }

  // Pro Max: the course is free for the student, but it still counts as a
  // full-price sale for the instructor's wallet (wallet/page.tsx computes
  // earnings as precio × enrollment count, so simply having this Enrollment
  // row already gives the instructor their normal 85%/15% split — no
  // separate/different commission rate for Pro Max). We also log a
  // Transaction row so it shows up in the instructor's "Historial de
  // Ventas" and notify the admin, same as any other purchase.
  if (isProMax && !error) {
    try {
      const { data: course } = await service
        .from("Course")
        .select("precio, instructorId, titulo")
        .eq("id", courseId)
        .single();

      if (course && course.precio > 0) {
        await service.from("Transaction").insert({
          userId: user.id,
          courseId,
          cantidad: course.precio,
        });

        const { data: userData } = await service
          .from("User")
          .select("nombre, email")
          .eq("id", user.id)
          .single();

        await notifyAdminWithTemplate(
          `Inscripción Pro Max gratuita: ${course.titulo}`,
          "Nueva Inscripción (Plan Pro Max)",
          [
            { label: "Usuario", value: `${userData?.nombre} (${userData?.email})` },
            { label: "Curso", value: course.titulo },
            { label: "Precio", value: `$${course.precio} (Cubierto por membresía)` },
            { label: "Fecha", value: new Date().toLocaleString() },
          ]
        );
      }
    } catch (splitErr) {
      console.error("Error registrando venta Pro Max:", splitErr);
    }
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

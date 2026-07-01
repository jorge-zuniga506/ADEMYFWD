import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";
import { ChevronLeft } from "lucide-react";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(`/auth/login?redirectTo=/courses/${courseId}/checkout`);
  }

  const { data: course } = await supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd, instructorId, categoryId")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: activeMembership } = await supabase
    .from("UserMembership")
    .select("Membership(tipo, descuentoPorcentaje)")
    .eq("userId", user!.id)
    .eq("estado", "ACTIVA")
    .gte("fechaFin", new Date().toISOString())
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  const membership = activeMembership?.Membership as
    | { tipo: string; descuentoPorcentaje: number }
    | null;

  // Fetch sections to get first lesson ID
  const { data: sections } = await supabase
    .from("Section")
    .select("id")
    .eq("courseId", courseId)
    .order("orden");

  const sectionIds = sections?.map((s) => s.id) ?? [];
  const { data: lessons } = sectionIds.length > 0
    ? await supabase
        .from("Lesson")
        .select("id")
        .in("sectionId", sectionIds)
        .order("orden")
    : { data: [] };

  const firstLessonId = lessons && lessons.length > 0 ? lessons[0].id : "";

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans antialiased py-12 px-6 dark">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Back Link */}
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a detalles del curso
        </Link>

        {/* Checkout Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Finalizar Compra
          </h1>
          <p className="text-xs text-zinc-400">
            Completa tu inscripción de forma segura mediante nuestra pasarela simulada.
          </p>
        </div>

        {/* Checkout Form Wrapper */}
        <CheckoutForm
          course={course}
          firstLessonId={firstLessonId}
          userEmail={user!.email || ""}
          membershipTipo={membership?.tipo ?? null}
          descuentoPorcentaje={membership?.descuentoPorcentaje ?? 0}
        />

      </div>
    </div>
  );
}

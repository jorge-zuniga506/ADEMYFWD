import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GraduationCap, Award } from "lucide-react";
import PrintCertificateButton from "@/components/PrintCertificateButton";

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: enrollment } = await supabase
    .from("Enrollment")
    .select("fechaCompletado, Course!inner(titulo, instructorId, User!inner(nombre))")
    .eq("courseId", courseId)
    .eq("userId", user.id)
    .eq("completado", true)
    .single();

  if (!enrollment) notFound();

  const course = enrollment.Course as unknown as {
    titulo: string;
    instructorId: string;
    User: { nombre: string };
  };

  const { data: perfil } = await supabase
    .from("User")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const fecha = enrollment.fechaCompletado
    ? new Date(enrollment.fechaCompletado).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-8 dark:bg-zinc-950">
      <div
        id="certificado"
        className="aspect-[1.414/1] w-full max-w-4xl rounded-2xl border-8 border-primary-600 bg-white p-16 shadow-2xl dark:bg-zinc-900"
      >
        <div className="flex h-full flex-col items-center justify-center text-center">
          <GraduationCap className="mb-4 h-16 w-16 text-primary-600" />

          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-400">
            U-Forward
          </p>

          <h1 className="mb-8 text-4xl font-bold tracking-tight">
            Certificado de Finalizacion
          </h1>

          <p className="mb-2 text-lg text-zinc-500">Otorgado a</p>

          <p className="mb-8 text-5xl font-bold text-primary-600">
            {perfil?.nombre}
          </p>

          <p className="mb-2 text-lg text-zinc-500">Por completar el curso</p>

          <p className="mb-8 text-3xl font-semibold">{course.titulo}</p>

          <p className="mb-12 text-sm text-zinc-400">
            Fecha de finalizacion: {fecha}
          </p>

          <div className="flex w-full max-w-md items-center gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-700">
            <div className="flex-1 text-center">
              <p className="font-medium">{course.User?.nombre}</p>
              <p className="text-xs text-zinc-400">Instructor</p>
            </div>
            <Award className="h-8 w-8 text-primary-600" />
            <div className="flex-1 text-center">
              <p className="font-medium">U-Forward</p>
              <p className="text-xs text-zinc-400">Directiva</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 [@media(print)]:hidden">
        <PrintCertificateButton courseTitle={course.titulo} />
      </div>
    </div>
  );
}

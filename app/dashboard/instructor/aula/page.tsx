import { createClient } from "@/lib/supabase/server";
import AulaVirtualTabs from "@/components/AulaVirtualTabs";

export default async function AulaVirtualPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbUser } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user!.id)
    .single();

  const isStaff = dbUser?.rol === "ADMIN" || dbUser?.rol === "INSTRUCTOR";

  let query = supabase
    .from("Course")
    .select("id, titulo, liveMeetLink, liveMeetFecha");

  if (!isStaff) {
    query = query.eq("instructorId", user!.id);
  }

  const { data: cursos } = await query;

  const courseIds = (cursos ?? []).map((c) => c.id);

  const { data: enrollments } = courseIds.length > 0
    ? await supabase
        .from("Enrollment")
        .select("courseId, progreso, userId, User!inner(nombre, email)")
        .in("courseId", courseIds)
        .order("progreso", { ascending: false })
    : { data: [] };

  const { data: questions } = courseIds.length > 0
    ? await supabase
        .from("Question")
        .select("id, titulo, contenido, fechaCreacion, resuelta, videoSegundo, Course!inner(titulo), User!inner(nombre)")
        .in("courseId", courseIds)
        .order("fechaCreacion", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Aula Virtual</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gestiona las clases en vivo, interactúa con tus alumnos y envía anuncios.
        </p>
      </div>

      <AulaVirtualTabs
        cursos={cursos as any ?? []}
        enrollments={enrollments as any ?? []}
        questions={questions as any ?? []}
      />
    </div>
  );
}

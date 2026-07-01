import { createClient } from "@/lib/supabase/server";
import StudentCursosTabs from "@/components/StudentCursosTabs";
import Link from "next/link";

export default async function MisCursosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("Enrollment")
    .select(`
      courseId,
      progreso,
      completado,
      archivado,
      lastLessonId,
      Course (
        id,
        titulo,
        descripcion,
        precio,
        instructorId,
        User (
          nombre
        )
      )
    `)
    .eq("userId", user!.id);

  // Find the last active studied course
  const lastEnr = enrollments?.filter(e => e.lastLessonId && !e.archivado)[0] || enrollments?.filter(e => !e.archivado)[0];

  let lastLesson = null;
  if (lastEnr?.lastLessonId) {
    const { data } = await supabase
      .from("Lesson")
      .select("id, titulo")
      .eq("id", lastEnr.lastLessonId)
      .single();
    lastLesson = data;
  }

  const lastCourse = lastEnr?.Course as any ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Mis Cursos</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Continúa tu camino de aprendizaje y especialización técnica.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-500 transition-all hover:scale-102"
        >
          + Agregar Cursos (Banco)
        </Link>
      </div>

      <StudentCursosTabs
        initialEnrollments={enrollments as any ?? []}
        lastLesson={lastLesson}
        lastCourse={lastCourse}
      />
    </div>
  );
}

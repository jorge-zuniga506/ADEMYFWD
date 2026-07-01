import { createClient } from "@/lib/supabase/server";
import { PlayCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function PlayerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("Enrollment")
    .select("courseId, progreso, Course!inner(id, titulo)")
    .eq("userId", user!.id);

  const courseIds = (enrollments ?? []).map((e) => e.courseId);

  const { data: lessons } = await supabase
    .from("Lesson")
    .select("id, titulo, sectionId, Section!inner(courseId, titulo)")
    .in("Section.courseId", courseIds)
    .order("orden", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Reproductor</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Acceso rapido a tus lecciones
        </p>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="grid gap-2">
          {lessons.map((lesson) => {
            const section = lesson.Section as unknown as {
              courseId: string;
              titulo: string;
            };
            const course = (enrollments ?? []).find(
              (e) => e.courseId === section.courseId
            );
            return (
              <Link
                key={lesson.id}
                href={`/courses/${section.courseId}/lessons/${lesson.id}`}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <PlayCircle className="h-5 w-5 shrink-0 text-primary-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lesson.titulo}</p>
                  <p className="truncate text-sm text-zinc-500">
                    {section.titulo}
                    {course ? ` | ${((course.Course as unknown as { titulo: string })?.titulo) ?? ""}` : ""}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-zinc-300" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <PlayCircle className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No hay lecciones disponibles. Inscribete a un curso primero.
          </p>
        </div>
      )}
    </div>
  );
}

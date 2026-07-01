import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge } from "@/components/ui";
import {
  BookOpen,
  Lock,
  Play,
  User,
  Tag,
  ChevronLeft,
} from "lucide-react";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd, instructorId, categoryId")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: sections } = await supabase
    .from("Section")
    .select("id, titulo, orden")
    .eq("courseId", courseId)
    .order("orden");

  const { data: instructor } = await supabase
    .from("User")
    .select("nombre")
    .eq("id", course.instructorId)
    .single();

  const { data: category } = await supabase
    .from("Category")
    .select("nombre")
    .eq("id", course.categoryId)
    .single();

  const { data: enrollment } = user
    ? await supabase
        .from("Enrollment")
        .select("id")
        .eq("userId", user.id)
        .eq("courseId", course.id)
        .single()
    : { data: null };

  const isEnrolled = !!enrollment;

  const sectionIds = sections?.map((s) => s.id) ?? [];
  const { data: allLessons } = sectionIds.length > 0
    ? await supabase
        .from("Lesson")
        .select("id, sectionId")
        .in("sectionId", sectionIds)
    : { data: [] };

  const totalLessons = allLessons?.length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a cursos
      </Link>

      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          {category && (
            <Badge variant="default">
              <Tag className="mr-1 h-3 w-3" />
              {category.nombre}
            </Badge>
          )}
          {course.esExclusivoFwd && <Badge variant="fwd">FWD+</Badge>}
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {course.titulo}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          {course.descripcion}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-zinc-500">
          {instructor && (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {instructor.nombre}
            </span>
          )}
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {totalLessons} leccion{totalLessons !== 1 ? "es" : ""} en {sections?.length ?? 0} seccion
            {sections?.length !== 1 ? "es" : ""}
          </span>
          <span className="text-lg font-bold text-primary-600">
            {course.precio === 0 ? "Gratis" : `$${course.precio.toFixed(2)}`}
          </span>
        </div>
      </div>

      {!isEnrolled ? (
        <div className="mb-10 rounded-xl border border-zinc-200 bg-gradient-to-r from-primary-50 to-white p-6 dark:border-zinc-800 dark:from-primary-950 dark:to-zinc-950">
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Inscribete para acceder al contenido completo del curso.
          </p>
          <EnrollButton courseId={course.id} />
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Contenido del curso</h2>
        {sections?.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            courseId={course.id}
            isEnrolled={isEnrolled}
          />
        ))}
        {(!sections || sections.length === 0) && (
          <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">No hay secciones disponibles aun.</p>
          </div>
        )}
      </section>
    </main>
  );
}

async function SectionBlock({
  section,
  courseId,
  isEnrolled,
}: {
  section: { id: string; titulo: string; orden: number };
  courseId: string;
  isEnrolled: boolean;
}) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("Lesson")
    .select("id, titulo, orden, esGratis, videoUrl")
    .eq("sectionId", section.id)
    .order("orden");

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">
        <BookOpen className="h-4 w-4 text-zinc-400" />
        {section.titulo}
        <span className="ml-auto text-xs font-normal text-zinc-400">
          {lessons?.length ?? 0} leccion{lessons?.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {lessons?.map((lesson) => {
          const canView = isEnrolled || lesson.esGratis;
          return (
            <Link
              key={lesson.id}
              href={
                canView
                  ? `/courses/${courseId}/lessons/${lesson.id}`
                  : "#"
              }
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                canView
                  ? "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  : "cursor-default opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {canView ? (
                  <Play className="h-4 w-4 text-primary-500" />
                ) : (
                  <Lock className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                )}
                <span>{lesson.titulo}</span>
              </div>
              {lesson.esGratis && !isEnrolled && (
                <Badge variant="success">Gratis</Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EnrollButton({ courseId }: { courseId: string }) {
  return (
    <form action={`/api/enroll/${courseId}`} method="post">
      <Button size="lg">Inscribirme ahora</Button>
    </form>
  );
}

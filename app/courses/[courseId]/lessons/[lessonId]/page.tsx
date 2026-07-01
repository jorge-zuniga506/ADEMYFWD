import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InmersivePlayer from "@/components/InmersivePlayer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: course } = await supabase
    .from("Course")
    .select("id, titulo, liveMeetLink, liveMeetFecha")
    .eq("id", courseId)
    .single();
  if (!course) notFound();

  const { data: lesson } = await supabase
    .from("Lesson")
    .select("id, titulo, videoUrl, esGratis, sectionId, recursoUrl, recursoNombre")
    .eq("id", lessonId)
    .single();
  if (!lesson) notFound();

  const canViewFree = lesson.esGratis;
  const { data: enrollment } = await supabase
    .from("Enrollment")
    .select("id, progreso, completado, lastLessonId")
    .eq("userId", user.id)
    .eq("courseId", courseId)
    .maybeSingle();

  if (!canViewFree && !enrollment) {
    redirect(`/courses/${courseId}`);
  }

  const { data: sections } = await supabase
    .from("Section")
    .select("id, titulo, orden")
    .eq("courseId", courseId)
    .order("orden");

  const sectionIds = sections?.map((s) => s.id) ?? [];

  const { data: lessons } = sectionIds.length > 0
    ? await supabase
        .from("Lesson")
        .select("id, titulo, orden, esGratis, sectionId, videoUrl, recursoUrl, recursoNombre")
        .in("sectionId", sectionIds)
        .order("orden")
    : { data: [] };

  const { data: userReview } = await supabase
    .from("CourseReview")
    .select("id, estrellas, comentario")
    .eq("courseId", courseId)
    .eq("userId", user.id)
    .maybeSingle();

  const { data: questions } = await supabase
    .from("Question")
    .select("id, titulo, contenido, fechaCreacion, resuelta, videoSegundo, User!inner(nombre)")
    .eq("courseId", courseId)
    .order("fechaCreacion", { ascending: false });

  // Simulate checked lessons based on current progress percentage
  const totalLessons = lessons?.length ?? 0;
  const completedCount = Math.round(((enrollment?.progreso ?? 0) / 100) * totalLessons);
  const completedLessonIds = (lessons ?? []).slice(0, completedCount).map(l => l.id);

  return (
    <div className="min-h-screen bg-zinc-950">
      <InmersivePlayer
        course={course}
        currentLesson={lesson as any}
        sections={sections ?? []}
        lessons={lessons as any ?? []}
        enrollment={enrollment}
        userReview={userReview}
        liveMeetLink={course.liveMeetLink}
        liveMeetFecha={course.liveMeetFecha}
        questions={questions ?? []}
        completedLessonIds={completedLessonIds}
        userId={user.id}
      />
    </div>
  );
}

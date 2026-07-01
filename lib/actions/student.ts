"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleArchiveCourse(courseId: string, archivado: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("Enrollment")
    .update({ archivado })
    .eq("courseId", courseId)
    .eq("userId", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/student");
}

export async function updateLastLesson(courseId: string, lessonId: string, progreso: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const completado = progreso >= 100;
  const fechaCompletado = completado ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("Enrollment")
    .update({ 
      lastLessonId: lessonId,
      progreso,
      completado,
      fechaCompletado
    })
    .eq("courseId", courseId)
    .eq("userId", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath("/dashboard/student");
}

export async function postReview(courseId: string, estrellas: number, comentario: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("CourseReview")
    .upsert({
      userId: user.id,
      courseId,
      estrellas,
      comentario
    }, { onConflict: "userId, courseId" });

  if (error) throw new Error(error.message);

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/dashboard/student`);
}

export async function requestFwdCredential(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const documentoUrl = formData.get("documentoUrl") as string;
  if (!documentoUrl) throw new Error("Debes proveer el enlace al documento de tu título.");

  const { error } = await supabase
    .from("FwdCredential")
    .insert({
      userId: user.id,
      documentoUrl,
      estado: "PENDIENTE",
      notasAdmin: null
    });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/student/configuracion");
  revalidatePath("/dashboard/student/certificados");
}

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

import { sendEmailWithTemplate } from "@/lib/email";

export async function updateLastLesson(courseId: string, lessonId: string, progreso: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener estado de completado anterior antes de actualizar
  const { data: priorEnrollment } = await supabase
    .from("Enrollment")
    .select("completado")
    .eq("courseId", courseId)
    .eq("userId", user.id)
    .maybeSingle();

  const yaEstabaCompletado = priorEnrollment?.completado ?? false;
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

  // Si se completa por primera vez, enviamos el diploma por email
  if (completado && !yaEstabaCompletado && user.email) {
    try {
      const { data: courseData } = await supabase
        .from("Course")
        .select("titulo")
        .eq("id", courseId)
        .single();

      const { data: userData } = await supabase
        .from("User")
        .select("nombre")
        .eq("id", user.id)
        .single();

      await sendEmailWithTemplate(
        user.email,
        `🎓 ¡Felicitaciones! Has completado el curso: ${courseData?.titulo || "Curso"}`,
        `¡Has obtenido tu Certificado Oficial!`,
        [
          { label: "Curso Finalizado", value: courseData?.titulo || "N/A" },
          { label: "Estudiante", value: userData?.nombre || user.email },
          { label: "Fecha de Emisión", value: new Date().toLocaleDateString("es-ES") },
          { label: "Validador", value: "U-Forward Academy Secure Sign" }
        ],
        `https://u-forward.vercel.app/certificado/${courseId}`,
        "VER DIPLOMA DIGITAL IMPRIMIBLE"
      );
    } catch (mailErr) {
      console.error("Error al enviar email de certificado:", mailErr);
    }
  }

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

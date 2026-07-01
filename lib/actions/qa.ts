"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmailWithTemplate } from "@/lib/email";

export async function createQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;
  const courseId = formData.get("courseId") as string;

  const { error } = await supabase.from("Question").insert({
    userid: user.id,
    courseid: courseId,
    titulo,
    contenido,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/student/qanda");
  revalidatePath(`/courses/${courseId}`);
}

export async function createRespuesta(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const contenido = formData.get("contenido") as string;
  const questionId = formData.get("questionId") as string;

  const { error } = await supabase.from("Respuesta").insert({
    userid: user.id,
    questionid: questionId,
    contenido,
  });

  if (error) throw new Error(error.message);

  // Enviar notificación por correo al autor de la pregunta
  try {
    const { data: question } = await (supabase as any)
      .from("Question")
      .select(`
        userid, 
        titulo,
        course:Course (
          titulo
        )
      `)
      .eq("id", questionId)
      .single();

    if (question && question.userid !== user.id) {
      // Quien responde no es el dueño de la duda (por ejemplo, el instructor respondiendo al alumno)
      const [{ data: student }, { data: responder }] = await Promise.all([
        supabase.from("User").select("nombre, email").eq("id", question.userid).single(),
        supabase.from("User").select("nombre").eq("id", user.id).single(),
      ]);

      if (student?.email) {
        await sendEmailWithTemplate(
          student.email,
          `¡Tu pregunta del curso ha sido respondida! 💬`,
          `¡Tienes una nueva respuesta de ${responder?.nombre || "el instructor"}!`,
          [
            { label: "Curso", value: (question as any).course?.titulo || "N/A" },
            { label: "Tu Pregunta", value: question.titulo },
            { label: "Respuesta", value: contenido.length > 80 ? `${contenido.substring(0, 80)}...` : contenido },
            { label: "Fecha", value: new Date().toLocaleDateString("es-ES") }
          ],
          `https://u-forward.vercel.app/dashboard/student/qanda/${questionId}`,
          "VER RESPUESTA EN EL FORO"
        );
      }
    }
  } catch (mailErr) {
    console.error("Error al notificar por correo la respuesta Q&A:", mailErr);
  }

  revalidatePath(`/dashboard/student/qanda/${questionId}`);
}

export async function marcarResuelta(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("Question")
    .update({ resuelta: true })
    .eq("id", questionId)
    .eq("userid", user.id);

  revalidatePath(`/dashboard/student/qanda/${questionId}`);
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("Question")
    .delete()
    .eq("id", questionId)
    .eq("userid", user.id);

  revalidatePath("/dashboard/student/qanda");
}

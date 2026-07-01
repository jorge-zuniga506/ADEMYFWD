"use server";

import { createClient } from "@/lib/supabase/server";
import { ai } from "@/lib/ai/client";
import { sendEmailWithTemplate } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function submitCourseToAiReviewAction(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 1. Obtener la información del curso con sus secciones y lecciones
  const { data: course, error: fetchErr } = await (supabase as any)
    .from("Course")
    .select(`
      id,
      titulo,
      descripcion,
      precio,
      duracionHoras,
      instructorId,
      User (
        nombre,
        email
      ),
      Section (
        id,
        titulo,
        Lesson (
          id,
          titulo
        )
      )
    `)
    .eq("id", courseId)
    .single();

  if (fetchErr || !course) {
    throw new Error(fetchErr?.message || "No se encontró el curso");
  }

  // Cambiar el estado temporalmente a EN_REVISION
  await supabase
    .from("Course")
    .update({ estado: "EN_REVISION" })
    .eq("id", courseId);

  revalidatePath(`/dashboard/instructor/${courseId}`);

  // 2. Extraer métricas curriculares
  const secciones = course.Section || [];
  const totalLecciones = secciones.reduce(
    (sum: number, sec: any) => sum + (sec.Lesson?.length ?? 0),
    0
  );

  const prompt = `Analiza los siguientes detalles del curso para decidir si cumple con los requisitos mínimos de calidad de la plataforma:

Título del curso: "${course.titulo}"
Descripción del curso: "${course.descripcion}"
Duración declarada: ${course.duracionHoras ?? "No especificada"} horas
Cantidad de secciones: ${secciones.length}
Cantidad de lecciones: ${totalLecciones}

Reglas estrictas de calidad y negocio de la plataforma:
1. La duración del curso debe ser de entre 2 y 20 horas obligatoriamente. Si la duración es nula o está fuera de ese rango, el curso debe ser RECHAZADO indicando esto.
2. Debe tener al menos 1 sección temática y al menos 2 lecciones en total. Si no cumple, debe ser RECHAZADO indicando la falta de contenido.
3. El título y la descripción deben ser de carácter profesional, educativo y libre de spam, lenguaje obsceno o texto de relleno incoherente.

Responde ÚNICAMENTE en formato JSON válido. No incluyas explicaciones en texto plano, ni markdown.
Formato de respuesta:
{"aprobado": true/false, "motivo": "Explicación detallada de por qué se aprueba o qué puntos específicos debe corregir el instructor (máximo 60 palabras)"}`;

  try {
    const aiResult = await ai.openrouter.chat([
      {
        role: "system",
        content: "Eres un auditor curricular de inteligencia artificial y control de calidad académica de U-Forward Academy."
      },
      { role: "user", content: prompt }
    ]);

    // Limpiar respuesta de bloques markdown si existieran
    const jsonStr = aiResult.trim().replace(/^```json|```$/g, "").trim();
    const evaluation = JSON.parse(jsonStr);

    const instructorEmail = course.User?.email;
    const instructorNombre = course.User?.nombre || "Instructor";

    if (evaluation.aprobado === true) {
      // APROBADO: Publicar curso
      await supabase
        .from("Course")
        .update({ estado: "PUBLICADO" })
        .eq("id", courseId);

      // Enviar correo de felicitación
      if (instructorEmail) {
        await sendEmailWithTemplate(
          instructorEmail,
          `¡Tu curso "${course.titulo}" ha sido APROBADO! 🚀`,
          `¡Tu curso ya está en vivo en U-Forward Academy!`,
          [
            { label: "Curso", value: course.titulo },
            { label: "Auditor", value: "U-Forward AI Auditor (Virtual)" },
            { label: "Resultado", value: "APROBADO Y PUBLICADO" },
            { label: "Mensaje del Auditor", value: evaluation.motivo },
            { label: "Fecha de Aprobación", value: new Date().toLocaleDateString("es-ES") }
          ],
          `https://u-forward.vercel.app/courses/${courseId}`,
          "VER CURSO EN LA PLATAFORMA"
        );
      }
    } else {
      // RECHAZADO: Devolver a Borrador e insertar la revisión
      await supabase
        .from("Course")
        .update({ estado: "BORRADOR" })
        .eq("id", courseId);

      // Registrar comentario en CourseReview (estrellas 0, tipo feedback)
      await supabase.from("CourseReview").insert({
        userId: user.id, // ID del usuario que solicita (para tracking)
        courseId,
        estrellas: 0,
        comentario: `Correcciones sugeridas por U-Forward AI Auditor: ${evaluation.motivo}`,
      });

      // Enviar correo con correcciones
      if (instructorEmail) {
        await sendEmailWithTemplate(
          instructorEmail,
          `Tu curso "${course.titulo}" requiere correcciones ⚠️`,
          `Sugerencias del Auditor Virtual de U-Forward`,
          [
            { label: "Curso", value: course.titulo },
            { label: "Auditor", value: "U-Forward AI Auditor (Virtual)" },
            { label: "Estado", value: "RECHAZADO TEMPORALMENTE (Borrador)" },
            { label: "Acción requerida", value: evaluation.motivo },
            { label: "Fecha de Revisión", value: new Date().toLocaleDateString("es-ES") }
          ],
          `https://u-forward.vercel.app/dashboard/instructor/${courseId}`,
          "CORREGIR DETALLES DEL CURSO"
        );
      }
    }

    revalidatePath(`/dashboard/instructor/${courseId}`);
    revalidatePath("/dashboard/instructor");
    revalidatePath("/cursos");
    
    return { success: true, aprobado: evaluation.aprobado, motivo: evaluation.motivo };
  } catch (err: any) {
    // Si la IA falla, revertimos el estado a BORRADOR
    await supabase
      .from("Course")
      .update({ estado: "BORRADOR" })
      .eq("id", courseId);
      
    revalidatePath(`/dashboard/instructor/${courseId}`);
    throw new Error(`Error en el proceso de revisión por IA: ${err.message}`);
  }
}

/**
 * Asistente virtual de soporte técnico para resolver dudas de la plataforma.
 */
export async function askAiSupportAction(
  chatHistory: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  const systemPrompt = {
    role: "system" as const,
    content: `Eres Ademy, el asistente inteligente oficial de soporte técnico de U-Forward Academy (ADEMYFWD).
Tu tarea es resolver dudas sobre:
1. Inscripciones: Los alumnos se inscriben a cursos gratis con un clic, o de pago a través de Stripe.
2. Membresías VIP: La membresía Pro Max cuesta $9.99/mes y da acceso ilimitado a todo el catálogo VIP (U-Forward+).
3. Certificados: Al completar el 100% de las lecciones, los alumnos obtienen un diploma oficial imprimible y verificable en su panel.
4. Foro Q&A: Los alumnos pueden publicar dudas en cada lección y los instructores les responden por ahí.
5. Instructores: Los instructores pueden crear cursos y enviarlos a Auditoría de IA para ser publicados automáticamente.

Pautas de comportamiento:
- Sé sumamente servicial, amable y usa un tono tecnológico y profesional.
- En español.
- Si te preguntan algo ajeno a la plataforma o soporte técnico, recuérdales amablemente que estás diseñado para ayudarles con la plataforma U-Forward.
- Mantén las respuestas claras y concisas (máximo 120 palabras).`
  };

  const messages = [systemPrompt, ...chatHistory];

  try {
    const response = await ai.openrouter.chat(messages);
    return response.trim();
  } catch (err: any) {
    throw new Error(`Error del asistente de soporte: ${err.message}`);
  }
}

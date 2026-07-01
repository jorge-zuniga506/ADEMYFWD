"use server";

import { createClient } from "@/lib/supabase/server";
import { ai } from "@/lib/ai/client";
import { sendEmailWithTemplate } from "@/lib/email";
import { checkAiLimit } from "@/lib/ai/logger";
import { revalidatePath } from "next/cache";

export async function submitCourseToAiReviewAction(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Validar límites de IA
  await checkAiLimit(user.id);

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
    ], undefined, user.id);

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
    throw new Error(err.message || "Error en el proceso de revisión por IA");
  }
}

/**
 * Asistente virtual de soporte técnico para resolver dudas de la plataforma.
 */
export async function askAiSupportAction(
  chatHistory: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Validar límites de IA
  await checkAiLimit(user.id);

  // Obtener rol del usuario para el control de acceso
  const { data: perfil } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = perfil?.rol || "ESTUDIANTE";

  // Definición del mapa de enlaces de la plataforma según el rol
  const enlacesEstudiante = `
- **Mis Cursos / Aula Virtual**: [/dashboard/student](file:///dashboard/student)
- **Membresía VIP (U-Forward+)**: [/dashboard/student/membresia](file:///dashboard/student/membresia)
- **Certificados obtenidos**: [/dashboard/student/certificados](file:///dashboard/student/certificados)
- **Foro de Consultas Q&A**: [/dashboard/student/qanda](file:///dashboard/student/qanda)
- **Configuración de Cuenta**: [/dashboard/student/configuracion](file:///dashboard/student/configuracion)
- **Catálogo General de Cursos**: [/cursos](file:///cursos)
- **Recursos Gratuitos**: [/recursos](file:///recursos)`;

  const enlacesInstructor = `
- **Panel de Instructor (Gestión de Cursos)**: [/dashboard/instructor](file:///dashboard/instructor)
- **Aula Virtual del Instructor**: [/dashboard/instructor/aula](file:///dashboard/instructor/aula)
- **Verificación VIP FWD (Títulos)**: [/dashboard/instructor/vip-fwd](file:///dashboard/instructor/vip-fwd)
- **Wallet (Ingresos y Retiros)**: [/dashboard/instructor/wallet](file:///dashboard/instructor/wallet)
- **Configuración de Perfil**: [/dashboard/instructor/perfil](file:///dashboard/instructor/perfil)`;

  const enlacesAdmin = `
- **Auditoría de Cursos**: [/dashboard/admin/cursos](file:///dashboard/admin/cursos)
- **Gestión de Membresías**: [/dashboard/admin/membresias](file:///dashboard/admin/membresias)
- **Panel Financiero y Consumo de IA**: [/dashboard/admin/financiero](file:///dashboard/admin/financiero)
- **Verificación de Instructores**: [/dashboard/admin/verificacion](file:///dashboard/admin/verificacion)
- **Gestión de Usuarios**: [/dashboard/admin/usuarios](file:///dashboard/admin/usuarios)`;

  let enlacesPermitidos = enlacesEstudiante;
  if (rol === "INSTRUCTOR") {
    enlacesPermitidos = `${enlacesEstudiante}\n${enlacesInstructor}`;
  } else if (rol === "ADMIN") {
    enlacesPermitidos = `${enlacesEstudiante}\n${enlacesInstructor}\n${enlacesAdmin}`;
  }

  const systemPrompt = {
    role: "system" as const,
    content: `Eres Ademy, la asistente de soporte inteligente oficial de U-Forward Academy (ADEMYFWD).
El usuario que está hablando contigo tiene el rol de: **${rol}**.

Enlaces oficiales que debes proporcionarle al usuario en formato Markdown si los solicita o si encajan con su duda:
${enlacesPermitidos}

NORMAS DE SEGURIDAD ESTRICTAS POR PERFIL DE ACCESO:
1. El rol actual del usuario es **${rol}**. Si el usuario tiene rol "ESTUDIANTE", bajo ninguna circunstancia le proporciones enlaces o instrucciones de "INSTRUCTOR" o "ADMIN". Si intenta pedirlos o pregunta por ellos, dile educadamente que no tienes autorización para proporcionarle accesos o información fuera de su perfil actual.
2. Si un usuario con rol "INSTRUCTOR" te pide enlaces de "ADMIN" (como auditoría o financiero), niégalo amablemente.
3. Resuelve dudas sobre inscripciones, Stripe, certificados al 100% y foro de dudas.
4. Sé sumamente servicial, amable y usa un tono tecnológico y profesional.
5. Mantén las respuestas claras y concisas (máximo 120 palabras).`
  };

  const messages = [systemPrompt, ...chatHistory];

  try {
    const response = await ai.openrouter.chat(messages, undefined, user.id);
    return response.trim();
  } catch (err: any) {
    throw new Error(err.message || "Error del asistente de soporte");
  }
}

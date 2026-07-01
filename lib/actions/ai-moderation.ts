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
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  const rol = perfil?.rol || "ESTUDIANTE";
  const nombre = perfil?.nombre || "Usuario";

  // Definición del mapa de enlaces de la plataforma según el rol
  const enlacesEstudiante = `
- **Mis Cursos / Aula Virtual**: https://u-forward.vercel.app/dashboard/student
- **Membresía VIP (U-Forward+)**: https://u-forward.vercel.app/dashboard/student/membresia
- **Certificados obtenidos**: https://u-forward.vercel.app/dashboard/student/certificados
- **Foro de Consultas Q&A**: https://u-forward.vercel.app/dashboard/student/qanda
- **Configuración de Cuenta**: https://u-forward.vercel.app/dashboard/student/configuracion
- **Catálogo General de Cursos**: https://u-forward.vercel.app/cursos
- **Recursos Gratuitos**: https://u-forward.vercel.app/recursos`;

  const enlacesInstructor = `
- **Panel de Instructor**: https://u-forward.vercel.app/dashboard/instructor
- **Aula Virtual del Instructor**: https://u-forward.vercel.app/dashboard/instructor/aula
- **Verificación VIP FWD (Títulos)**: https://u-forward.vercel.app/dashboard/instructor/vip-fwd
- **Wallet (Ingresos y Retiros)**: https://u-forward.vercel.app/dashboard/instructor/wallet
- **Configuración de Perfil**: https://u-forward.vercel.app/dashboard/instructor/perfil`;

  const enlacesAdmin = `
- **Auditoría de Cursos**: https://u-forward.vercel.app/dashboard/admin/cursos
- **Gestión de Membresías**: https://u-forward.vercel.app/dashboard/admin/membresias
- **Panel Financiero**: https://u-forward.vercel.app/dashboard/admin/financiero
- **Verificación de Instructores**: https://u-forward.vercel.app/dashboard/admin/verificacion
- **Gestión de Usuarios**: https://u-forward.vercel.app/dashboard/admin/usuarios`;

  let enlacesPermitidos = enlacesEstudiante;
  if (rol === "INSTRUCTOR") {
    enlacesPermitidos = `${enlacesEstudiante}\n${enlacesInstructor}`;
  } else if (rol === "ADMIN") {
    enlacesPermitidos = `${enlacesEstudiante}\n${enlacesInstructor}\n${enlacesAdmin}`;
  }

  // --- Para ADMIN: obtener métricas reales en tiempo real ---
  let contextoAdmin = "";
  if (rol === "ADMIN") {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const [
      { count: usuariosHoy },
      { count: usuariosAyer },
      { count: cursosPublicados },
      { count: cursosRevision },
      { count: emailsHoy },
      { count: aiHoy },
      { count: totalUsuarios },
      { count: membresiaActivas },
    ] = await Promise.all([
      supabase.from("User").select("*", { count: "exact", head: true }).gte("createdAt", hoy.toISOString()),
      supabase.from("User").select("*", { count: "exact", head: true }).gte("createdAt", ayer.toISOString()).lt("createdAt", hoy.toISOString()),
      supabase.from("Course").select("*", { count: "exact", head: true }).eq("estado", "PUBLICADO"),
      supabase.from("Course").select("*", { count: "exact", head: true }).eq("estado", "EN_REVISION"),
      (supabase as any).from("EmailLog").select("*", { count: "exact", head: true }).gte("fecha", hoy.toISOString()),
      (supabase as any).from("AiLog").select("*", { count: "exact", head: true }).gte("fecha", hoy.toISOString()),
      supabase.from("User").select("*", { count: "exact", head: true }),
      supabase.from("Enrollment").select("*", { count: "exact", head: true }),
    ]);

    contextoAdmin = `
=== MÉTRICAS REALES DE LA PLATAFORMA (DATOS EN VIVO) ===
📅 Fecha actual: ${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}

👥 USUARIOS:
- Nuevos usuarios HOY: ${usuariosHoy ?? 0}
- Nuevos usuarios AYER: ${usuariosAyer ?? 0}
- Total de usuarios registrados: ${totalUsuarios ?? 0}

📚 CURSOS:
- Cursos publicados activos: ${cursosPublicados ?? 0}
- Cursos en revisión pendientes: ${cursosRevision ?? 0}

📧 CORREOS (Gmail SMTP):
- Correos enviados hoy: ${emailsHoy ?? 0} / 500 (límite diario)

🤖 IA (OpenRouter/Gemini):
- Peticiones de IA hoy: ${aiHoy ?? 0} / 30 por usuario (límite configurado)

🎓 INSCRIPCIONES:
- Total de inscripciones activas: ${membresiaActivas ?? 0}
=== FIN DE MÉTRICAS ===

Usa estos datos reales para responder cualquier pregunta del administrador sobre el estado de la plataforma.`;
  }

  const systemPrompt = {
    role: "system" as const,
    content: `Eres Ademy, la asistente inteligente oficial de U-Forward Academy. Estás hablando con **${nombre}** quien tiene el rol de **${rol}**.
${contextoAdmin}
ENLACES DISPONIBLES PARA ESTE ROL:
${enlacesPermitidos}

NORMAS DE COMPORTAMIENTO:
${rol === "ADMIN"
  ? `- Eres el asistente personal de datos del administrador. Responde preguntas sobre usuarios, cursos, correos, consumo de IA y finanzas usando las métricas reales de arriba.
- Puedes hacer cálculos comparativos (ej: crecimiento de usuarios, porcentaje de consumo de Gmail).
- Sé directo, preciso y ejecutivo. El administrador necesita datos, no rodeos.
- Proporciona el enlace exacto cuando el admin necesite ir a una sección.`
  : rol === "INSTRUCTOR"
  ? `- Ayuda al instructor con la gestión de sus cursos, el aula virtual, sus ingresos y la verificación VIP.
- Proporciona el enlace directo cuando el instructor lo necesite.
- Si te pide datos de administración (financiero, usuarios), dile amablemente que esa sección es solo para administradores.`
  : `- Ayuda al estudiante con sus cursos, certificados, membresía y el foro de dudas.
- Proporciona el enlace directo cuando el estudiante lo necesite.
- NUNCA le des enlaces ni información de paneles de Instructor o Admin.
- Si te pide accesos fuera de su perfil, explícale amablemente que no tienes acceso a esa información.`
}

- Responde en español, de forma amable y profesional.
- Sé conciso (máximo 130 palabras por respuesta).
- Cuando menciones un enlace, usa el formato Markdown: [Nombre del enlace](URL).`
  };

  const messages = [systemPrompt, ...chatHistory];

  try {
    const response = await ai.openrouter.chat(messages, undefined, user.id);
    return response.trim();
  } catch (err: any) {
    throw new Error(err.message || "Error del asistente de soporte");
  }
}


"use server";

import { createClient } from "@/lib/supabase/server";
import { ai } from "@/lib/ai/client";
import { revalidatePath } from "next/cache";

/**
 * Optimiza la descripción de un curso usando inteligencia artificial.
 */
export async function optimizeCourseDescriptionAction(
  titulo: string,
  category: string,
  descripcionActual: string
): Promise<string> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) throw new Error("No autorizado");

  const prompt = `Optimiza y haz persuasiva esta descripción de curso para un catálogo académico.
Título del curso: "${titulo}"
Categoría: "${category}"
Descripción actual: "${descripcionActual}"

Requisitos:
- Debe sonar sumamente profesional y motivadora para los estudiantes.
- En español.
- Máximo 180 palabras.
- Responde ÚNICAMENTE con la descripción optimizada, sin preámbulos ni explicaciones.`;

  try {
    const optimized = await ai.openrouter.chat([
      { role: "system", content: "Eres un redactor experto en marketing de educación tecnológica." },
      { role: "user", content: prompt }
    ]);
    return optimized.trim();
  } catch (err: any) {
    throw new Error(`Error de IA: ${err.message}`);
  }
}

/**
 * Genera un título sugerido para una sección basado en el título del curso.
 */
export async function suggestSectionAction(
  tituloCurso: string
): Promise<string> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) throw new Error("No autorizado");

  const prompt = `Basándote en el título del curso "${tituloCurso}", sugiere un título de sección temático y muy profesional que encaje en el temario del curso.
Responde ÚNICAMENTE con el título de la sección sugerido en español (máximo 6 palabras), sin comillas ni preámbulos.`;

  try {
    const sugerida = await ai.openrouter.chat([
      { role: "system", content: "Eres un diseñador curricular experto en tecnología." },
      { role: "user", content: prompt }
    ]);
    return sugerida.trim().replace(/^"|"$/g, '');
  } catch (err: any) {
    throw new Error(`Error de IA: ${err.message}`);
  }
}

/**
 * Genera un examen interactivo de 10 preguntas de opción múltiple basado en el curso y su temario.
 */
export async function generateCourseQuizAction(
  tituloCurso: string,
  secciones: string[]
): Promise<string> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) throw new Error("No autorizado");

  const prompt = `Crea un examen formal de evaluación de 10 preguntas para el curso "${tituloCurso}".
Temario del curso (secciones):
${secciones.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Requisitos del examen:
- Debe tener exactamente 10 preguntas de opción múltiple.
- Cada pregunta debe tener 4 opciones (A, B, C, D).
- Incluye la clave de respuestas correctas al final del documento.
- Formato del documento:
  
  =========================================
  EXAMEN DE EVALUACIÓN: ${tituloCurso.toUpperCase()}
  U-FORWARD ACADEMY - EVALUACIÓN DE CONOCIMIENTOS
  =========================================

  Pregunta 1: [Texto de la pregunta]
  A) [Opción]
  B) [Opción]
  C) [Opción]
  D) [Opción]
  
  [... y así hasta la pregunta 10 ...]
  
  =========================================
  CLAVE DE RESPUESTAS CORRECTAS
  =========================================
  1. A
  2. C
  ...
  10. B
  
Responde ÚNICAMENTE con el examen formateado en texto plano según el ejemplo anterior, sin explicaciones ni markdown.`;

  try {
    const examen = await ai.openrouter.chat([
      { role: "system", content: "Eres un profesor y evaluador de ciencias de la computación muy riguroso." },
      { role: "user", content: prompt }
    ]);
    return examen.trim();
  } catch (err: any) {
    throw new Error(`Error de IA: ${err.message}`);
  }
}

/**
 * Agrega el examen generado como un recurso descargable base64 en una nueva lección del curso.
 */
export async function addQuizLessonAction(
  courseId: string,
  sectionId: string,
  tituloExamen: string,
  examenContenido: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Obtener el número máximo de orden de las lecciones existentes en la sección
  const { data: lessons } = await (supabase as any)
    .from("Lesson")
    .select("orden")
    .eq("sectionId", sectionId);
    
  const maxOrden = lessons?.reduce((max: number, l: any) => (l.orden > max ? l.orden : max), 0) ?? 0;

  // Convertir el contenido del examen a base64
  const base64Content = Buffer.from(examenContenido).toString("base64");
  const recursoUrl = `data:text/plain;charset=utf-8;base64,${base64Content}`;

  const { error } = await (supabase as any)
    .from("Lesson")
    .insert({
      sectionId,
      titulo: tituloExamen,
      orden: maxOrden + 1,
      esGratis: false,
      recursoNombre: "Examen_Evaluacion_IA.txt",
      recursoUrl: recursoUrl
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/instructor/${courseId}`);
}

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FWD_VERIFICATION_CONTEXT } from "@/lib/ai/fwd-verification-context";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const VERIFICATION_PROMPT = `Eres un experto verificador de certificados del programa Forward Costa Rica (FWD).
Tu única fuente de verdad es la siguiente guía oficial de verificación. Basa tu análisis
estrictamente en ella — no en supuestos generales sobre certificados — y razona sobre cada
punto que menciona, incluyendo las señales de alerta que describe explícitamente (por
ejemplo, una fecha de emisión futura o ilógica es una bandera roja según la guía, aunque el
resto del documento se vea legítimo).

=== GUÍA OFICIAL DE VERIFICACIÓN (instrucionesia.txt) ===
${FWD_VERIFICATION_CONTEXT}
=== FIN DE LA GUÍA ===

Nota importante: no tienes acceso a la base de datos oficial de la Fundación CRC Endurance
ni a la identificación oficial del titular, así que no puedes confirmar el "Punto de
Verificación de Registro" contra esa base de datos ni la coincidencia exacta con una cédula
física — evalúa esos puntos únicamente por la presencia, formato y coherencia interna de
los datos visibles en la imagen, y refléjalo en tus observaciones.

Analiza la imagen del certificado y pondera cada criterio de la guía usando esta rúbrica de
puntos (deben sumar 100):
1. [15 pts] LOGOTIPOS: ¿Están presentes y nítidos los logotipos de "FWD Costa Rica" y "Fundación CRC Endurance"?
2. [20 pts] FUNDACIÓN EMISORA: ¿El certificado menciona explícitamente "Fundación CRC Endurance" como ONG?
3. [15 pts] PROGRAMA: ¿El título especifica exactamente "DESARROLLADORES WEB FULL-STACK" (no variantes genéricas)?
4. [10 pts] DURACIÓN: ¿Indica horas cronológicas coherentes con la complejidad del programa?
5. [10 pts] DATOS DEL TITULAR: ¿Tiene nombre completo y número de cédula visibles y con formato válido?
6. [10 pts] UBICACIÓN Y FECHA: ¿El lugar de emisión es coherente y la fecha de emisión es lógica (no futura, posterior al fin del programa)?
7. [10 pts] FIRMA: ¿Tiene firma de un oficial autorizado de la fundación?
8. [5 pts]  FOLIO/TOMO: ¿Tiene números de Tomo, Folio y Asiento de registro?
9. [5 pts]  ESTILO VISUAL: ¿El diseño es consistente con el estilo oficial descrito en la guía?

RESPONDE ÚNICAMENTE con este JSON (sin markdown, sin texto adicional):
{
  "puntuacion": <número 0-100>,
  "aprobado": <true si puntuacion >= 80, false si no>,
  "nombreTitular": "<nombre extraído o null>",
  "cedula": "<cédula extraída o null>",
  "tomo": "<tomo extraído o null>",
  "folio": "<folio extraído o null>",
  "asiento": "<asiento extraído o null>",
  "horasCronologicas": "<horas extraídas o null>",
  "fechaEmision": "<fecha extraída o null>",
  "criterios": {
    "logotipos": <puntos 0-15>,
    "fundacionEmisora": <puntos 0-20>,
    "programa": <puntos 0-15>,
    "duracion": <puntos 0-10>,
    "datosTitular": <puntos 0-10>,
    "ubicacion": <puntos 0-10>,
    "firma": <puntos 0-10>,
    "folioTomo": <puntos 0-5>,
    "estiloVisual": <puntos 0-5>
  },
  "observaciones": "<comentario breve sobre la verificación en español>"
}`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check instructor role
  const { data: perfil } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "INSTRUCTOR" && perfil?.rol !== "ADMIN") {
    return NextResponse.json({ error: "Solo instructores pueden verificar certificados" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("certificate") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo no puede superar los 10 MB" }, { status: 400 });
  }

  const service = getServiceClient();

  // Upload certificate to storage
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/certificate-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await service.storage
    .from("certificates")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json({ error: "Error al subir el certificado" }, { status: 500 });
  }

  // Get signed URL for our own reference (private bucket)
  const { data: signedUrl } = await service.storage
    .from("certificates")
    .createSignedUrl(path, 3600);

  const certificadoUrl = signedUrl?.signedUrl ?? path;

  // Analyze with Gemini Vision
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let analisisIA: Record<string, unknown> = {};
  let puntuacion = 0;
  let aprobado = false;
  let observaciones = "";

  try {
    // Convert file to base64 for Gemini
    const base64 = buffer.toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
        },
      },
      VERIFICATION_PROMPT,
    ]);

    const responseText = result.response.text().trim();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analisisIA = JSON.parse(jsonMatch[0]);
      puntuacion = (analisisIA.puntuacion as number) ?? 0;
      aprobado = (analisisIA.aprobado as boolean) ?? false;
      observaciones = (analisisIA.observaciones as string) ?? "";
    }
  } catch (aiErr) {
    console.error("Gemini error:", aiErr);
    observaciones = "Error al procesar con IA. Se requiere revisión manual.";
  }

  // Save verification record
  const estado = aprobado ? "APROBADO" : "PENDIENTE";

  const { data: verification, error: verErr } = await service
    .from("InstructorVerification")
    .insert({
      userId: user.id,
      certificadoUrl,
      estado,
      analisisIA,
      puntuacion,
      comentario: observaciones,
      revisadoEn: new Date().toISOString(),
    })
    .select()
    .single();

  if (verErr) {
    console.error("Verification insert error:", verErr);
    return NextResponse.json({ error: "Error al guardar verificación" }, { status: 500 });
  }

  // If approved, mark the instructor as VIP+FWD verified. This is
  // independent of `rol` — GRADUADO_FWD is the unrelated student
  // credential flow (FwdCredential / admin/verificacion), so an
  // instructor's role must not change here.
  if (aprobado) {
    await service
      .from("User")
      .update({ isVerified: true })
      .eq("id", user.id);
  }

  return NextResponse.json({
    success: true,
    aprobado,
    puntuacion,
    analisis: analisisIA,
    observaciones,
    verificationId: verification.id,
  });
}

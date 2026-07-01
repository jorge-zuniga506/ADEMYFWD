import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function logAiUsage({
  proveedor,
  modelo,
  prompt_tokens = 0,
  completion_tokens = 0,
  exito,
  error = null,
  userId = null,
}: {
  proveedor: "GEMINI" | "KIMI" | "OPENROUTER";
  modelo: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  exito: boolean;
  error?: string | null;
  userId?: string | null;
}) {
  try {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await (supabase as any).from("AiLog").insert({
      proveedor,
      modelo,
      prompt_tokens,
      completion_tokens,
      exito,
      error,
      userId,
    });
  } catch (err) {
    console.error(`Error al registrar log de IA para ${proveedor} en Supabase:`, err);
  }
}

/**
 * Verifica si el usuario ha superado el límite diario de peticiones de IA.
 * Si se supera, lanza un error de cuota excedida.
 */
export async function checkAiLimit(
  userId: string,
  limit: number = 30
): Promise<void> {
  try {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const { count, error } = await (supabase as any)
      .from("AiLog")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .gte("fecha", inicioHoy.toISOString());

    if (error) {
      console.error("Error al consultar límites de IA:", error);
      return; // Si la base de datos falla temporalmente, permitimos la petición por resiliencia
    }

    const totalHoy = count ?? 0;
    if (totalHoy >= limit) {
      throw new Error(
        `Has alcanzado tu límite diario de ${limit} consultas de Inteligencia Artificial en la plataforma. Por favor, intenta de nuevo mañana para proteger tu consumo.`
      );
    }
  } catch (err: any) {
    // Si es nuestro error de límite excedido, lo propagamos
    if (err.message.includes("límite diario")) {
      throw err;
    }
    console.error("Fallo resiliente en checkAiLimit:", err);
  }
}

import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function logAiUsage({
  proveedor,
  modelo,
  prompt_tokens = 0,
  completion_tokens = 0,
  exito,
  error = null,
}: {
  proveedor: "GEMINI" | "KIMI" | "OPENROUTER";
  modelo: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  exito: boolean;
  error?: string | null;
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
    });
  } catch (err) {
    console.error(`Error al registrar log de IA para ${proveedor} en Supabase:`, err);
  }
}

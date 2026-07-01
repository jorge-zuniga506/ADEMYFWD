import { logAiUsage } from "./logger";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function createCompletion(
  model: string,
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter (${model}): ${res.status} - ${err}`);
    }

    const data = await res.json();
    const prompt_tokens = data.usage?.prompt_tokens ?? 0;
    const completion_tokens = data.usage?.completion_tokens ?? 0;

    // Registrar consumo exitoso
    await logAiUsage({
      proveedor: "OPENROUTER",
      modelo: model,
      prompt_tokens,
      completion_tokens,
      exito: true,
    });

    return data.choices[0].message.content;
  } catch (err: any) {
    // Registrar consumo fallido
    await logAiUsage({
      proveedor: "OPENROUTER",
      modelo: model,
      exito: false,
      error: err.message,
    });
    throw err;
  }
}

const keys = [
  process.env.OPENROUTER_API_KEY_1!,
  process.env.OPENROUTER_API_KEY_2!,
];
let keyIndex = 0;

function getNextKey(): string {
  const key = keys[keyIndex];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
}

export async function generateCourseDescription(
  titulo: string,
  category: string
): Promise<string> {
  return createCompletion(
    "openai/gpt-4o-mini",
    [
      {
        role: "system",
        content:
          "Eres un experto en crear descripciones de cursos de tecnologia. Genera descripciones persuasivas y profesionales en espanol.",
      },
      {
        role: "user",
        content: `Crea una descripcion de curso para "${titulo}" en la categoria "${category}". Incluye: que aprenderan, requisitos, y para quien es. Maximo 200 palabras.`,
      },
    ],
    getNextKey()
  );
}

export async function generateReviewResponse(
  review: string
): Promise<string> {
  return createCompletion(
    "openai/gpt-4o-mini",
    [
      {
        role: "system",
        content:
          "Eres un instructor de tecnologia agradecido. Responde a las resenas de estudiantes de forma profesional y amable en espanol.",
      },
      { role: "user", content: `Responde a esta resena de un estudiante: "${review}"` },
    ],
    getNextKey()
  );
}

export async function chat(
  messages: { role: string; content: string }[],
  options?: { model?: string }
): Promise<string> {
  return createCompletion(
    options?.model ?? "openai/gpt-4o-mini",
    messages,
    getNextKey()
  );
}

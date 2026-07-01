import { logAiUsage } from "./logger";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY_1 || process.env.KIMI_API_KEY!;

export async function analyzeDocument(
  content: string,
  task: string
): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotco/kimi-latest",
        messages: [
          {
            role: "system",
            content: `Eres un analista de documentos. ${task}`,
          },
          { role: "user", content },
        ],
      }),
    });

    if (!res.ok) {
      // Fallback automático si Moonshot en OpenRouter falla o tiene problemas
      return await fallbackGPT(content, task);
    }

    const data = await res.json();
    const prompt_tokens = data.usage?.prompt_tokens ?? 0;
    const completion_tokens = data.usage?.completion_tokens ?? 0;

    // Registrar consumo exitoso
    await logAiUsage({
      proveedor: "KIMI",
      modelo: "moonshotco/kimi-latest",
      prompt_tokens,
      completion_tokens,
      exito: true,
    });

    return data.choices[0].message.content;
  } catch (err: any) {
    // Intentar fallback si ocurre cualquier error de red/fetch
    try {
      return await fallbackGPT(content, task);
    } catch (fallbackErr: any) {
      // Registrar consumo fallido si el fallback también falla
      await logAiUsage({
        proveedor: "KIMI",
        modelo: "moonshotco/kimi-latest",
        exito: false,
        error: `Moonshot Error: ${err.message} | Fallback Error: ${fallbackErr.message}`,
      });
      throw err;
    }
  }
}

async function fallbackGPT(content: string, task: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un analista de documentos. ${task}`,
        },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Fallback GPT falló con código: ${res.status}`);
  }

  const data = await res.json();
  const prompt_tokens = data.usage?.prompt_tokens ?? 0;
  const completion_tokens = data.usage?.completion_tokens ?? 0;

  // Registrar consumo exitoso del fallback
  await logAiUsage({
    proveedor: "KIMI",
    modelo: "gpt-4o-mini-fallback",
    prompt_tokens,
    completion_tokens,
    exito: true,
  });

  return data.choices[0].message.content;
}

export async function analyzeLongText(
  text: string,
  question: string
): Promise<string> {
  return analyzeDocument(
    text,
    `Responde la siguiente pregunta basandote en el texto proporcionado: ${question}`
  );
}

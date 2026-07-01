import { logAiUsage } from "./logger";

const API_URL = "https://api.moonshot.cn/v1/chat/completions";
const API_KEY = process.env.KIMI_API_KEY!;

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
        model: "moonshot-v1-32k",
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
      const err = await res.text();
      throw new Error(`Kimi: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const prompt_tokens = data.usage?.prompt_tokens ?? 0;
    const completion_tokens = data.usage?.completion_tokens ?? 0;

    // Registrar consumo exitoso
    await logAiUsage({
      proveedor: "KIMI",
      modelo: "moonshot-v1-32k",
      prompt_tokens,
      completion_tokens,
      exito: true,
    });

    return data.choices[0].message.content;
  } catch (err: any) {
    // Registrar consumo fallido
    await logAiUsage({
      proveedor: "KIMI",
      modelo: "moonshot-v1-32k",
      exito: false,
      error: err.message,
    });
    throw err;
  }
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

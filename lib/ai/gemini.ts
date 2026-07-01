import { logAiUsage } from "./logger";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY_1 || process.env.GEMINI_API_KEY!;

export async function analyzeImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter-GeminiVision: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const prompt_tokens = data.usage?.prompt_tokens ?? 0;
    const completion_tokens = data.usage?.completion_tokens ?? 0;

    // Registrar consumo exitoso
    await logAiUsage({
      proveedor: "GEMINI",
      modelo: "gemini-2.0-flash-vision",
      prompt_tokens,
      completion_tokens,
      exito: true,
    });
    return data.choices[0].message.content;
  } catch (err: any) {
    // Registrar consumo fallido
    await logAiUsage({
      proveedor: "GEMINI",
      modelo: "gemini-2.0-flash-vision",
      exito: false,
      error: err.message,
    });
    throw err;
  }
}

export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter-Gemini: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const prompt_tokens = data.usage?.prompt_tokens ?? 0;
    const completion_tokens = data.usage?.completion_tokens ?? 0;

    // Registrar consumo exitoso
    await logAiUsage({
      proveedor: "GEMINI",
      modelo: "gemini-2.0-flash",
      prompt_tokens,
      completion_tokens,
      exito: true,
    });
    return data.choices[0].message.content;
  } catch (err: any) {
    // Registrar consumo fallido
    await logAiUsage({
      proveedor: "GEMINI",
      modelo: "gemini-2.0-flash",
      exito: false,
      error: err.message,
    });
    throw err;
  }
}

export async function verifyCertificate(
  certificateBase64: string
): Promise<{
  valido: boolean;
  nombre: string;
  institucion: string;
  fecha: string;
  confianza: number;
}> {
  const result = await analyzeImage(
    certificateBase64,
    `Eres un validador de certificados academicos. Analiza esta imagen de certificado y extrae:
    - Si el certificado parece autentico o falso
    - El nombre del titular
    - La institucion que lo emite
    - La fecha de emision
    - Tu nivel de confianza (0-100)
    
    Responde SOLO con JSON valido:
    {"valido": true/false, "nombre": "...", "institucion": "...", "fecha": "...", "confianza": 0}`
  );

  try {
    return JSON.parse(result);
  } catch {
    return { valido: false, nombre: "", institucion: "", fecha: "", confianza: 0 };
  }
}

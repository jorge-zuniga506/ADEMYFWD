import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    },
  ]);

  return result.response.text();
}

export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
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

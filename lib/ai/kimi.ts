const API_URL = "https://api.moonshot.cn/v1/chat/completions";
const API_KEY = process.env.KIMI_API_KEY!;

export async function analyzeDocument(
  content: string,
  task: string
): Promise<string> {
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

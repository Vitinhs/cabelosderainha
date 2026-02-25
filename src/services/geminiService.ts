import { supabase } from "./supabaseClient";
import { HairDiagnosis } from "../types";

// Chave pública do Gemini (variável Vite - exposta no cliente)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Chama o Gemini 1.5 Flash diretamente do browser.
 * Funciona tanto em localhost quanto em produção (Vercel).
 */
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Chave de API (VITE_GEMINI_API_KEY) não encontrada. Verifique o arquivo .env.local."
    );
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData?.error?.message ||
      `Gemini API retornou status ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
  }

  return text.trim();
}

/**
 * Gera o plano capilar completo de 30 dias chamando o Gemini diretamente.
 */
export const generateHairPlan = async (diagnosis: any): Promise<any> => {
  const prompt = `
Você é uma especialista tricologista (especialista em saúde capilar).
Com base nos dados abaixo, crie um diagnóstico e um cronograma capilar personalizado de 4 semanas.

Dados:
- Tipo de cabelo: ${diagnosis.hairType}
- Problemas: ${(diagnosis.problems || [diagnosis.mainGoal]).join(", ")}
- Objetivos: ${(diagnosis.goals || [diagnosis.mainGoal]).join(", ")}
- Rotina atual: ${diagnosis.currentRoutine || "Não informada"}

RESPONDA SOMENTE COM O JSON ABAIXO, SEM NENHUM TEXTO ANTES OU DEPOIS:
{
  "diagnosis": "Diagnóstico detalhado aqui...",
  "schedule": [
    { "week": 1, "steps": ["Hidratação", "Nutrição", "Hidratação"] },
    { "week": 2, "steps": ["Hidratação", "Nutrição", "Reconstrução"] },
    { "week": 3, "steps": ["Hidratação", "Hidratação", "Nutrição"] },
    { "week": 4, "steps": ["Hidratação", "Nutrição", "Hidratação"] }
  ],
  "expressTips": ["Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5"],
  "philosophy": "Frase motivacional personalizada aqui..."
}
`.trim();

  try {
    console.log("🔬 Chamando Gemini diretamente do browser...");
    const responseText = await callGemini(prompt);

    // Extrai somente o bloco JSON, ignorando texto extra que a IA possa gerar
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        "A IA não retornou um JSON válido. Tente novamente."
      );
    }

    const data = JSON.parse(jsonMatch[0]);
    console.log("✅ Plano gerado com sucesso!");

    const generateId = () => Math.random().toString(36).substring(2, 15);

    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      diagnosis,
      summary: data.diagnosis || "Seu plano está pronto!",
      expressTips: data.expressTips || [],
      philosophy: data.philosophy || "",
      tasks: (data.schedule || []).flatMap((week: any) =>
        (week.steps || []).map((step: string, idx: number) => ({
          day: (week.week - 1) * 7 + (idx + 1),
          title: step,
          category: step as any,
          description: `Ritual de ${step} — semana ${week.week} do seu cronograma personalizado.`,
          completed: false,
        }))
      ),
    };
  } catch (error: any) {
    console.error("❌ Erro ao gerar plano via Gemini:", error);
    throw error;
  }
};

/**
 * Chat com assistente de beleza capilar via Gemini.
 */
export const chatWithAssistant = async (
  message: string,
  history: any[]
): Promise<string> => {
  try {
    const context = history
      .slice(-6) // Últimas 6 mensagens para não sobrecarregar
      .map((m) => `${m.role === "user" ? "Usuária" : "Especialista"}: ${m.content}`)
      .join("\n");

    const prompt = `
Você é uma especialista carinhosa em cuidados capilares naturais.
Responda de forma curta, prática e motivadora.

Histórico recente:
${context || "Início da conversa"}

Nova mensagem da usuária: ${message}
`.trim();

    return await callGemini(prompt);
  } catch (error: any) {
    console.error("Erro no chat:", error);
    return "Desculpe, tive um problema ao processar sua mensagem. Pode repetir? 💚";
  }
};

/**
 * Dica rápida de cabelo (mantida por compatibilidade).
 */
export const fastHairTip = async (
  problem: string,
  diagnosis?: HairDiagnosis
): Promise<string> => {
  try {
    const prompt = `Dê UMA dica prática e curta (máximo 2 frases) para o seguinte problema capilar: ${problem}. Tipo de cabelo: ${diagnosis?.hairType || "não informado"}.`;
    return await callGemini(prompt);
  } catch (error: any) {
    console.error("Erro ao buscar dica rápida:", error);
    return "Use óleo de coco para selar as cutículas e dar brilho. 💚";
  }
};

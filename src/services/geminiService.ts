import { supabase } from "./supabaseClient";
import { HairDiagnosis } from "../types";

// Chave pública do Gemini (variável Vite - exposta no cliente)
// Histórico de dicas por problema — garante que nenhuma dica se repita na sessão
const tipHistory = new Map<string, string[]>();

/**
 * Interface unificada para chamadas ao backend do Capillaire AI.
 */
async function callInternalApi(path: string, body: any): Promise<any> {
  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Erro na API interna (${path}): ${response.status}`);
  }

  return await response.json();
}

/**
 * Gera o plano capilar completo de 30 dias via API Backend.
 */
export const generateHairPlan = async (diagnosis: any): Promise<any> => {
  try {
    console.log('🔬 Gerando plano via API Backend...');
    const data = await callInternalApi('diagnostic', diagnosis);

    const generateId = () => Math.random().toString(36).substring(2, 15);

    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      diagnosis,
      summary: data.diagnosis || 'Seu Ritual Natural está pronto!',
      expressTips: data.expressTips || [],
      philosophy: data.philosophy || '',
      tasks: (data.schedule || []).flatMap((week: any) =>
        (week.steps || []).map((step: string, idx: number) => ({
          day: (week.week - 1) * 7 + (idx + 1),
          title: step,
          category: step as any,
          description: `Ritual de ${step} — semana ${week.week} do seu Ritual Natural.`,
          completed: false,
        }))
      ),
    };
  } catch (error: any) {
    console.error('❌ Erro no diagnóstico:', error);
    throw error;
  }
};

/**
 * Chat com Lia via API Backend.
 */
export const chatWithAssistant = async (
  message: string,
  history: any[]
): Promise<string> => {
  try {
    const context = history
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Usuária' : 'Lia'}: ${m.content}`)
      .join('\n');

    const data = await callInternalApi('chat', { message, context });
    return data.reply;
  } catch (error: any) {
    console.error('Erro no chat:', error);
    return 'Desculpe, tive uma dificuldade agora. Pode repetir? Estou aqui para te ajudar! 💚';
  }
};

/**
 * Dica rápida via API Chat (reaproveitando modelo).
 */
export const fastHairTip = async (
  problem: string,
  diagnosis?: HairDiagnosis
): Promise<string> => {
  try {
    const prompt = `Dê UMA dica prática e curta (máximo 2 frases) para o problema: ${problem}. Tipo de cabelo: ${diagnosis?.hairType || 'não informado'}. Responda apenas com a dica.`;
    const data = await callInternalApi('chat', { message: prompt });
    return data.reply;
  } catch (error: any) {
    console.error("Erro na dica rápida:", error);
    return "Use óleo de coco para selar as cutículas e dar brilho. 💚";
  }
};

/**
 * Análise técnica de foto via API Backend.
 */
export const analyzeHairPhoto = async (base64Image: string): Promise<string> => {
  try {
    const data = await callInternalApi('analyze', { image: base64Image });
    return data.analysis;
  } catch (error: any) {
    console.error("Erro na análise técnica:", error);
    throw error;
  }
};

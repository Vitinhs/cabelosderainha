
import { supabase } from "./supabaseClient";
import { HairDiagnosis, HairPlan } from "../types";

/**
 * Função para gerar o plano completo de 30 dias via Edge Function.
 */
/**
 * Função para gerar o diagnóstico e plano via nova API Serverless (Vercel).
 */
export const generateHairPlan = async (diagnosis: any): Promise<any> => {
  try {
    console.log("Chamando nova API de diagnóstico...");

    const response = await fetch('/api/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hairType: diagnosis.hairType,
        problems: [diagnosis.mainGoal], // Mapeando para o campo esperado pela nova API
        goals: [diagnosis.mainGoal],
        currentRoutine: diagnosis.currentRoutine || "Não informada"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao gerar diagnóstico");
    }

    const data = await response.json();

    // Fallback para IDs
    const generateId = () => Math.random().toString(36).substring(2, 15);

    // Mapeia a resposta da nova API para o formato esperado pelo frontend
    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      diagnosis,
      summary: data.diagnosis, // Mapeia 'diagnosis' da API para 'summary' do App
      tasks: (data.schedule || []).flatMap((week: any) =>
        week.steps.map((step: string, idx: number) => ({
          day: (week.week - 1) * 7 + (idx + 1),
          title: step,
          category: step as any,
          description: `Tratamento de ${step} recomendado pela IA para sua semana ${week.week}.`,
          completed: false
        }))
      )
    };
  } catch (error: any) {
    console.error("Erro ao gerar plano via API:", error);
    throw error;
  }
};


/**
 * Chat com assistente via Edge Function (Mocked or Todo).
 */
/**
 * Chat com assistente via nova API Serverless (Vercel).
 */
export const chatWithAssistant = async (message: string, history: any[]) => {
  try {
    const context = history.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) throw new Error("Erro no chat");

    const data = await response.json();
    return data.reply;
  } catch (error: any) {
    console.error("Erro no chat:", error);
    return "Desculpe, tive um problema ao processar sua mensagem. Pode repetir?";
  }
};


export const fastHairTip = async (problem: string, diagnosis?: HairDiagnosis) => {
  try {
    const { data, error } = await supabase.functions.invoke('fast-hair-tip', {
      body: { problem, diagnosis },
    });
    if (error) throw error;
    return data.tip;
  } catch (error: any) {
    console.error("Erro ao buscar dica rápida:", error);
    return "Use um pouco de óleo de coco para selar as cutículas.";
  }
};


import { supabase } from "./supabaseClient";
import { HairDiagnosis, HairPlan } from "../types";

/**
 * Função para gerar o plano completo de 30 dias via Edge Function.
 */
export const generateHairPlan = async (diagnosis: HairDiagnosis): Promise<HairPlan> => {
  try {
    console.log("Chamando Edge Function 'gemini-ai'...");

    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { diagnosis },
    });

    if (error) throw error;

    // Fallback for crypto.randomUUID
    const generateId = () => {
      try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
          return window.crypto.randomUUID();
        }
      } catch (e) { }

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      diagnosis,
      summary: data.summary || "Seu plano personalizado está pronto.",
      tasks: (data.tasks || []).map((t: any) => ({ ...t, completed: false }))
    };
  } catch (error: any) {
    console.error("Erro crítico ao gerar plano via Edge Function:", error);
    const errorMessage = error.message || "Falha na comunicação com a inteligência capilar.";
    throw new Error(errorMessage);
  }
};

/**
 * Chat com assistente via Edge Function (Mocked or Todo).
 */
export const chatWithAssistant = async (message: string, history: any[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
      body: { message, history },
    });
    if (error) throw error;
    return data.response;
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

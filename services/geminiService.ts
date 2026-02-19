
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
export const chatWithAssistant = async (message: string, _history: any[]) => {
  // Para fins de MVP, podemos manter simplificado ou mover para outra função
  console.log("Chat mockado via Edge Function logic:", message);
  return "Olá! Sou o Assistente Cabelos de Rainha. Em breve estarei integrado 100% via funções seguras.";
};

/**
 * Dica rápida via Edge Function (Mocked or Todo).
 */
export const fastHairTip = async (problem: string, _diagnosis?: HairDiagnosis) => {
  return `Dica para ${problem}: Tente usar babosa natural congelada para acalmar o couro cabeludo.`;
};

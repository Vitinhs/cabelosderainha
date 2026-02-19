
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { HairDiagnosis, DayTask, HairPlan } from "../types";

/**
 * Função para gerar o plano completo de 30 dias.
 * Utiliza o gemini-3-pro-preview para garantir a lógica complexa de HNR.
 */
export const generateHairPlan = async (diagnosis: HairDiagnosis): Promise<HairPlan> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  const prompt = `
    Aja como um renomado Tricologista e Terapeuta Capilar Natural. 
    Seu objetivo é criar um Cronograma Capilar de 30 dias focado em: ${diagnosis.mainGoal}.

    PERFIL TÉCNICO:
    - Curvatura: ${diagnosis.hairType}
    - Couro Cabeludo: ${diagnosis.scalpType}
    - Porosidade: ${diagnosis.porosity}
    - Histórico de Química: ${diagnosis.hasChemicals ? 'Sim' : 'Não'}
    - Orçamento: ${diagnosis.budgetLevel}

    DIRETRIZES:
    1. Plano de exatos 30 dias.
    2. Alterne Hidratação, Nutrição e Reconstrução com base na porosidade ${diagnosis.porosity}.
    3. Receitas 100% naturais e adequadas ao orçamento ${diagnosis.budgetLevel}.
    4. Formato estritamente JSON.
  `;

  try {
    console.log("Chamando Gemini com modelo gemini-2.5-flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  recipe: { type: Type.STRING }
                },
                required: ["day", "title", "category", "description"]
              }
            }
          },
          required: ["summary", "tasks"]
        }
      }
    });

    // Simplified response handling
    const responseText = (typeof (response as any).text === 'function')
      ? await (response as any).text()
      : ((response as any).text || "");

    console.log("Resposta bruta do Gemini:", responseText);

    let data;
    try {
      data = JSON.parse(responseText || "{}");
    } catch (e) {
      console.error("Erro ao fazer parse do JSON do Gemini:", e);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("A IA não retornou um formato de dados válido.");
      }
    }

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
    console.error("Erro crítico ao gerar plano com Gemini:", error);
    const errorMessage = error.message || "Falha na comunicação com a inteligência capilar.";
    throw new Error(errorMessage);
  }
};

/**
 * Chat com assistente para dúvidas rápidas.
 * Utiliza gemini-3-flash-preview para respostas instantâneas.
 */
export const chatWithAssistant = async (message: string, history: any[]) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash-lite',
    config: {
      systemInstruction: 'Você é o Assistente Capillaire. Especialista em terapias naturais (Babosa, Óleos, Argilas). Ajude o usuário com seu cronograma. Nunca sugira químicos agressivos.',
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

/**
 * Dica rápida baseada em um problema específico.
 * Utiliza o modelo Lite para economia e velocidade extrema.
 */
export const fastHairTip = async (problem: string, diagnosis?: HairDiagnosis) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  let context = "";
  if (diagnosis) {
    context = `Para um cabelo ${diagnosis.hairType} e porosidade ${diagnosis.porosity}.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `Dê uma dica natural de 2 frases para o problema: ${problem}. ${context}`,
    });
    return response.text;
  } catch (error) {
    console.error("Erro na dica expressa:", error);
    return "Tente massagear o couro cabeludo com movimentos circulares para estimular a saúde dos fios.";
  }
};

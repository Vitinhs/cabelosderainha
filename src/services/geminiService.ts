import { supabase } from "./supabaseClient";
import { HairDiagnosis } from "../types";

// Chave pública do Gemini (variável Vite - exposta no cliente)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Histórico de dicas por problema — garante que nenhuma dica se repita na sessão
const tipHistory = new Map<string, string[]>();

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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
 * Chama o Gemini forçando saída em JSON válido via responseMimeType.
 * Elimina qualquer risco de markdown, comentários ou texto extra no JSON.
 */
async function callGeminiJson(prompt: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("Chave de API (VITE_GEMINI_API_KEY) não encontrada.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",   // ← força JSON puro, sem markdown
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Gemini API retornou status ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("A IA retornou uma resposta vazia. Tente novamente.");

  return JSON.parse(text);
}

/**
 * Remove artefatos comuns que o Gemini adiciona ao JSON:
 *  - Blocos de código markdown (```json ... ```)
 *  - Comentários de linha   // ...
 *  - Comentários de bloco   /* ... *\/
 *  - Vírgulas finais antes de } ou ]   (trailing commas)
 */
function sanitizeJson(raw: string): string {
  // 1. Remove bloco markdown se houver (```json ... ```)
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let s = fenceMatch ? fenceMatch[1] : raw;

  // 2. Pega só de { até o último }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);

  // 3. Remove comentários de linha  //...
  s = s.replace(/\/\/[^\n]*/g, '');

  // 4. Remove comentários de bloco  /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');

  // 5. Remove vírgulas finais antes de } ou ] (trailing commas)
  s = s.replace(/,\s*([\]}])/g, '$1');

  return s.trim();
}

/**
 * Gera o plano capilar completo de 30 dias.
 * Usa callGeminiJson para garantir JSON 100% válido da API.
 */
export const generateHairPlan = async (diagnosis: any): Promise<any> => {
  const prompt = `
Você é uma especialista tricologista em tratamentos naturais capilares.
Crie um cronograma de 4 semanas personalizado com base nos dados abaixo.

Dados:
- Tipo de cabelo: ${diagnosis.hairType}
- Problemas: ${(diagnosis.problems || [diagnosis.mainGoal]).join(', ')}
- Objetivos: ${(diagnosis.goals || [diagnosis.mainGoal]).join(', ')}
- Rotina atual: ${diagnosis.currentRoutine || 'Não informada'}

Retorne um objeto JSON com EXATAMENTE estes campos:
- diagnosis: string com diagnóstico personalizado (2-3 frases)
- schedule: array de 4 objetos {week: number, steps: string[]} onde steps tem 3 itens cada (valores: "Hidratação", "Nutrição", "Reconstrução", "Detox" ou "Descanso")
- expressTips: array de exatamente 5 strings com dicas práticas naturais
- philosophy: string com uma frase motivacional personalizada
`.trim();

  try {
    console.log('🔬 Chamando Gemini com modo JSON nativo...');
    // callGeminiJson usa responseMimeType: "application/json" — retorna JSON garantido
    const data = await callGeminiJson(prompt);
    console.log('✅ Plano gerado com sucesso!');

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
    console.error('❌ Erro ao gerar plano via Gemini:', error);
    throw error;
  }
};

/**
 * Chat com Lia — Mentora Natural de Beleza Capilar.
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

    const prompt = `
Você é Lia, uma especialista apaixonada em beleza capilar 100% natural e tratamentos orgânicos.

Sua personalidade:
- Fala de forma calorosa, empática e motivadora, como uma mentora próxima
- Usa expressões carinhosas como "rainha", "minha flor", "linda"
- SEMPRE indica soluções naturais (óleos, plantas, receitas caseiras, rituais)
- NUNCA recomenda produtos químicos, alisamentos, formol ou procedimentos invasivos
- Dá dicas práticas e objetivas, com no máximo 3 parágrafos curtos
- Usa emojis para tornar a conversa mais humana (mas não exagera)
- Quando não sabe algo, admite honestamente e sugere consultar uma tricologista

Contexto da conversa:
${context || 'Início da conversa'}

Mensagem da usuária: ${message}

Responda como Lia, de forma empática e focada em tratamentos naturais.
`.trim();

    return await callGemini(prompt);
  } catch (error: any) {
    console.error('Erro no chat:', error);
    return 'Desculpe, tive uma dificuldade agora. Pode repetir? Estou aqui para te ajudar! 💚';
  }
};

/**
 * Dica rápida de cabelo — nunca repete uma dica já mostrada na sessão.
 */
export const fastHairTip = async (
  problem: string,
  diagnosis?: HairDiagnosis
): Promise<string> => {
  try {
    const seen = tipHistory.get(problem) ?? [];
    const seenBlock = seen.length > 0
      ? `\n\nDicas que você JÁ deu antes e NÃO podem ser repetidas:\n${seen.map((t, i) => `${i + 1}. "${t}"`).join('\n')}`
      : '';

    const prompt = `Dê UMA dica prática e curta (máximo 2 frases) para o seguinte problema capilar: ${problem}. Tipo de cabelo: ${diagnosis?.hairType || 'não informado'}.${seenBlock}\n\nResponda APENAS com a nova dica, sem numeração nem aspas.`;

    const tip = await callGemini(prompt);

    // Salva no histórico para evitar repetição
    tipHistory.set(problem, [...seen, tip]);

    return tip;
  } catch (error: any) {
    console.error("Erro ao buscar dica rápida:", error);
    return "Use óleo de coco para selar as cutículas e dar brilho. 💚";
  }
};

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Interface para os dados do usuário recebidos via POST.
 */
interface DiagnosticRequest {
    hairType: string;
    problems: string[];
    goals: string[];
    currentRoutine?: string;
}

/**
 * Função interna para chamar o Gemini sem dependências externas.
 */
/**
 * Função interna para chamar o Gemini com lógica de re-tentativa (resiliência).
 */
async function callAIInternal(prompt: string, providers: { openai?: string, gemini?: string }, retries = 3): Promise<string> {
    const useOpenAI = !!(providers.openai && providers.openai !== "undefined" && providers.openai !== "null");

    for (let i = 0; i < retries; i++) {
        try {
            let response;
            if (useOpenAI) {
                console.log(`[Diagnostic] Usando OpenAI (Tentativa ${i + 1})...`);
                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${providers.openai}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7
                    })
                });
            } else {
                console.log(`[Diagnostic] Usando Gemini (Tentativa ${i + 1})...`);
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${providers.gemini}`;
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const isRetryable = response.status === 429 || response.status === 503;

                if (isRetryable && i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                    continue;
                }
                throw new Error(errorData?.error?.message || `AI API error: ${response.status}`);
            }

            const data = await response.json();
            if (useOpenAI) {
                return data.choices?.[0]?.message?.content?.trim() || "";
            } else {
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            }
        } catch (error: any) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    return "";
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { hairType, problems, goals, currentRoutine } = req.body as DiagnosticRequest;

        if (!hairType || !problems || !goals) {
            return res.status(400).json({ error: "Dados incompletos para o diagnóstico" });
        }

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim();

        if (!openaiKey && !geminiKey) {
            console.error("ERRO: Nenhuma chave de API (OpenAI ou Gemini) encontrada.");
            return res.status(500).json({
                error: "Configuração ausente",
                message: "Nenhuma chave de API (OPENAI_API_KEY ou GEMINI_API_KEY) foi configurada."
            });
        }

        console.log(`[API Diagnostic] Provedores: OpenAI=${!!openaiKey}, Gemini=${!!geminiKey}`);

        const prompt = `
Você é um especialista tricologista (especialista em saúde capilar).
Com base nos dados abaixo, crie um diagnóstico detalhado e um cronograma capilar de 4 semanas.

Dados do usuário:
- Tipo: ${hairType}
- Problemas: ${problems.join(', ')}
- Objetivos: ${goals.join(', ')}
- Rotina atual: ${currentRoutine || 'Não informado'}

RESPONDA APENAS EM JSON VÁLIDO (SEM TEXTO ANTES OU DEPOIS):
{
  "diagnosis": "...",
  "schedule": [
    { "week": 1, "steps": ["Hidratação", "Nutrição", "Hidratação"] },
    { "week": 2, "steps": ["Hidratação", "Nutrição", "Reconstrução"] },
    { "week": 3, "steps": ["Hidratação", "Hidratação", "Nutrição"] },
    { "week": 4, "steps": ["Hidratação", "Nutrição", "Hidratação"] }
  ],
  "expressTips": ["Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5"],
  "philosophy": "..."
}
`.trim();

        console.log("Chamando IA...");
        const responseText = await callAIInternal(prompt, { openai: openaiKey, gemini: geminiKey });

        // Extrai JSON se houver lixo em volta
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("A IA retornou uma resposta em formato inválido.");
        }

        const result = JSON.parse(jsonMatch[0]);
        console.log("Diagnóstico gerado com sucesso!");
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("Erro na API de diagnóstico:", error);
        return res.status(500).json({
            error: "Erro na geração do plano",
            message: error.message || "Ocorreu um erro inesperado."
        });
    }
}

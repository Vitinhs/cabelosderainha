import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Interface para a mensagem de chat recebida via POST.
 */
interface ChatRequest {
    message: string;
    context?: string;
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
                console.log(`[Chat] Usando OpenAI (Tentativa ${i + 1})...`);
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
                console.log(`[Chat] Usando Gemini (Tentativa ${i + 1})...`);
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
        const { message, context } = req.body as ChatRequest;

        if (!message) {
            return res.status(400).json({ error: "Mensagem vazia" });
        }

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim();

        if (!openaiKey && !geminiKey) {
            console.error("ERRO: Nenhuma chave de API (OpenAI ou Gemini) encontrada.");
            return res.status(500).json({
                error: "Configuração ausente",
                message: "A chave API não configurada ou inválida no servidor."
            });
        }

        console.log(`[API Chat] Provedores: OpenAI=${!!openaiKey}, Gemini=${!!geminiKey}`);

        const prompt = `
Você é um especialista em cuidados capilares.
Responda de forma prestativa, técnica e educada à seguinte dúvida do usuário.
Use seu conhecimento sobre o método Ritual Natural (baseado em ingredientes naturais e saúde do couro cabeludo).

Mensagem do Usuário: ${message}

Responda em markdown, formatando bem o texto.
`.trim();

        console.log("Chamando IA...");
        const reply = await callAIInternal(prompt, { openai: openaiKey, gemini: geminiKey });
        return res.status(200).json({ reply });

    } catch (error: any) {
        console.error("Erro no Chat API:", error);
        return res.status(500).json({
            error: "Erro no chat",
            message: error.message
        });
    }
}

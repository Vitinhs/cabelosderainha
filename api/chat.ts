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
async function callGeminiInternal(prompt: string, apiKey: string, retries = 3): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const isRetryable = response.status === 429 || response.status === 503;

                if (isRetryable && i < retries - 1) {
                    console.log(`[Retry ${i + 1}] Quota/Server error, backing off...`);
                    await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                    continue;
                }

                throw new Error(errorData?.error?.message || `Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error: any) {
            if (i === retries - 1) throw error;
            console.log(`[Retry ${i + 1}] error: ${error.message}`);
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

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: "Configuração ausente",
                message: "Chave API não configurada no servidor."
            });
        }
        console.log(`[API Chat] Usando chave: ${apiKey.substring(0, 10)}... (origem: ${process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_AI_API_KEY'})`);

        const prompt = `
Você é um especialista em cuidados capilares.
Responda de forma profissional e curta.

Contexto: ${context || 'Sem contexto'}
Pergunta: ${message}
`.trim();

        const reply = await callGeminiInternal(prompt, apiKey);
        return res.status(200).json({ reply });

    } catch (error: any) {
        console.error("Erro no Chat API:", error);
        return res.status(500).json({
            error: "Erro no chat",
            message: error.message
        });
    }
}

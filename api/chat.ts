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
async function callGeminiInternal(prompt: string, apiKey: string): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error (Chat):", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

        const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: "Configuração ausente",
                message: "Chave API não configurada no servidor."
            });
        }

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

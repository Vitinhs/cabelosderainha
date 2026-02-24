import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGemini } from '../src/server/ai/gemini';

/**
 * Interface para a mensagem de chat recebida via POST.
 */
interface ChatRequest {
    message: string;
    context?: string;
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

        const prompt = `
Você é um especialista em cuidados capilares.
Responda de forma profissional, clara e personalizada.

Contexto do usuário:
${context || 'Sem contexto adicional'}

Pergunta:
${message}
`.trim();

        const reply = await callGemini(prompt);

        return res.status(200).json({ reply });

    } catch (error) {
        return res.status(500).json({ error: "Erro ao processar mensagem no chat" });
    }
}

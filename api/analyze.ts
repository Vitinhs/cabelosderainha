import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Endpoint para análise técnica de fotos capilares.
 * Recebe uma imagem em base64 e retorna um diagnóstico tricologista.
 */
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
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "Nenhuma imagem fornecida." });
        }

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim();

        if (!openaiKey && !geminiKey) {
            console.error("ERRO: Nenhuma chave de API (OpenAI ou Gemini) encontrada.");
            return res.status(500).json({ error: "Chave de API não configurada ou inválida no servidor." });
        }

        console.log(`[API Analyze] Provedores: OpenAI=${!!openaiKey}, Gemini=${!!geminiKey}`);

        const prompt = `
Você é um especialista em tricologia capilar. Analise esta foto de um cabelo e forneça um diagnóstico técnico curto (3-4 frases).
Foque em: oleosidade, brilho aparente, frizz e possíveis danos.
Seja profissional e empático. Responda em Português.
`.trim();

        let analysis = "";

        if (openaiKey && openaiKey !== "undefined" && openaiKey !== "null") {
            console.log("[Analyze] Usando OpenAI (gpt-4o-mini)...");
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: image } }
                            ]
                        }
                    ]
                })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
            }
            const data = await response.json();
            analysis = data.choices?.[0]?.message?.content?.trim() || "";
        } else {
            console.log("[Analyze] Usando Gemini 2.0 Flash Lite...");
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiKey}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                        ]
                    }]
                })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
            }
            const data = await response.json();
            analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        }

        return res.status(200).json({ analysis });

    } catch (error: any) {
        console.error("Erro na API de análise:", error);
        return res.status(500).json({
            error: "Erro na análise da imagem",
            message: error.message
        });
    }
}

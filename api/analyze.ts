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

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Chave de API não configurada no servidor." });
        }

        const prompt = `
Você é um especialista em tricologia capilar. Analise esta foto de um cabelo e forneça um diagnóstico técnico curto (3-4 frases).
Foque em:
1. Brilho e saúde aparente da fibra.
2. Nível visível de frizz ou ressecamento.
3. Recomendação de qual etapa do cronograma (Hidratação, Nutrição ou Reconstrução) é MAIS URGENTE agora.

Seja profissional, empático e encorajador. Responda em Português do Brasil.
`.trim();

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        let analysis = "";
        const retries = 3;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: image
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.4,
                            maxOutputTokens: 500
                        }
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const isRetryable = response.status === 429 || response.status === 503;

                    if (isRetryable && i < retries - 1) {
                        console.log(`[Analyze] Retry ${i + 1} for quota/server error...`);
                        await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
                        continue;
                    }
                    throw new Error(errorData?.error?.message || "Erro na API do Gemini.");
                }

                const data = await response.json();
                analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                break;
            } catch (error: any) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
            }
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

/**
 * @module gemini
 * Motor de IA — integração com Google Gemini 1.5 Flash.
 */

/**
 * Envia um prompt ao Gemini e retorna o texto gerado.
 * @param prompt Instrução para a IA.
 * @returns Texto extraído da resposta.
 */
export async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY não configurada nas variáveis de ambiente.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API Gemini (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Resposta vazia do Google Gemini.');
        }

        return text.trim();
    } catch (error) {
        console.error('Erro ao chamar Gemini:', error);
        throw error;
    }
}

/**
 * Motor de IA — Suporte Híbrido (OpenAI e Google Gemini).
 * Prioriza OpenAI se a chave estiver presente, caso contrário usa Gemini.
 */

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
    console.log("[callAI] Usando OpenAI (gpt-4o-mini)...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGeminiInternal(prompt: string, apiKey: string): Promise<string> {
    console.log("[callAI] Usando Gemini 2.0 Flash Lite...");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini API retornou resposta vazia.");
    return text.trim();
}

export async function callGemini(prompt: string): Promise<string> {
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY)?.trim();

    try {
        if (openaiKey && openaiKey !== "undefined" && openaiKey !== "null") {
            return await callOpenAI(prompt, openaiKey);
        }

        if (geminiKey && geminiKey !== "undefined" && geminiKey !== "null") {
            return await callGeminiInternal(prompt, geminiKey);
        }

        throw new Error("Nenhuma chave de API (OpenAI ou Gemini) configurada.");
    } catch (error: any) {
        console.error("Erro no motor de IA:", error);
        throw error;
    }
}

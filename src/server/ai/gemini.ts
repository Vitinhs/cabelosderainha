/**
 * Motor de IA — Integração com Google Gemini 1.5 Flash.
 */

export async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY não configurada.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error("Gemini API error");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Gemini API error");
        }

        return text.trim();
    } catch (error) {
        throw new Error("Gemini API error");
    }
}

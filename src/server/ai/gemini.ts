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
            const errorBody = await response.text();
            console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API error data:", data.error);
            throw new Error(`Gemini API error: ${data.error.message || 'Unknown error'}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("Gemini API returned no text:", data);
            throw new Error("Gemini API returnou uma resposta vazia.");
        }

        return text.trim();
    } catch (error: any) {
        console.error("Catch block in callGemini:", error);
        throw new Error(error.message || "Gemini API failure");
    }
}

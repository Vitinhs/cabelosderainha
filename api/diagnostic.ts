import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGemini } from '../src/server/ai/gemini';

/**
 * Interface para os dados do usuário recebidos via POST.
 */
interface DiagnosticRequest {
    hairType: string;
    problems: string[];
    goals: string[];
    currentRoutine?: string;
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
        const { hairType, problems, goals, currentRoutine } = req.body as DiagnosticRequest;

        if (!hairType || !problems || !goals) {
            return res.status(400).json({ error: "Dados incompletos para o diagnóstico" });
        }

        const prompt = `
Você é um especialista tricologista.

Com base nos dados abaixo, gere:
1. Diagnóstico detalhado
2. Cronograma capilar personalizado de 4 semanas (hidratação, nutrição, reconstrução)
3. 5 dicas express personalizadas
4. Uma filosofia capilar motivacional personalizada

Dados do usuário:
Tipo de cabelo: ${hairType}
Problemas: ${problems.join(', ')}
Objetivos: ${goals.join(', ')}
Rotina atual: ${currentRoutine || 'Não informado'}

Formato de resposta OBRIGATÓRIO em JSON válido:

{
  "diagnosis": "...",
  "schedule": [
    { "week": 1, "steps": ["Hidratação", "Nutrição", "Hidratação"] },
    { "week": 2, "steps": ["Hidratação", "Nutrição", "Reconstrução"] },
    { "week": 3, "steps": ["Hidratação", "Hidratação", "Nutrição"] },
    { "week": 4, "steps": ["Hidratação", "Nutrição", "Hidratação"] }
  ],
  "expressTips": ["Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5"],
  "philosophy": "..."
}

Retorne APENAS o JSON.
`.trim();

        const responseText = await callGemini(prompt);

        // Limpeza de possíveis marcações markdown (backticks) do Gemini
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const result = JSON.parse(cleanJson);
            return res.status(200).json(result);
        } catch (parseError) {
            console.error("Erro ao parsear JSON do Gemini:", responseText);
            return res.status(502).json({
                error: "Resposta da IA inválida",
                details: responseText.substring(0, 200)
            });
        }

    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar diagnóstico" });
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGemini } from '../src/server/ai/gemini';

/**
 * Interface para as respostas do quiz recebidas do frontend.
 */
interface QuizAnswers {
    nome: string;
    email: string;
    hairType: string;
    scalpType: string;
    porosity: string;
    hasChemicals: boolean;
    problems: string[];
    goals: string[];
    budgetLevel: string;
    frequencyOfWash: string;
}

/**
 * Monta o prompt para o Gemini.
 */
function buildPrompt(answers: QuizAnswers): string {
    return `
Você é um especialista em tricologia e beleza capilar especializado em cronogramas personalizados.
Com base nas respostas do quiz abaixo, gere um diagnóstico completo e um plano de cuidados.

### PERFIL DO CABELO
- Tipo: ${answers.hairType}
- Couro Cabeludo: ${answers.scalpType}
- Porosidade: ${answers.porosity}
- Possui Química: ${answers.hasChemicals ? 'Sim' : 'Não'}
- Orçamento: ${answers.budgetLevel}
- Frequência de Lavagem: ${answers.frequencyOfWash}

### PROBLEMAS RELATADOS
${answers.problems.join(', ')}

### OBJETIVOS
${answers.goals.join(', ')}

### INSTRUÇÕES DE RESPOSTA
Retorne a resposta EXCLUSIVAMENTE em formato JSON estruturado, sem blocos de código markdown, seguindo este modelo:
{
  "diagnostic": "Um parágrafo detalhando o estado atual e necessidades do cabelo.",
  "philosophy": "Uma frase curta que resume a abordagem de cuidado recomendada.",
  "expressTips": ["Dica 1", "Dica 2", "Dica 3"],
  "schedule": {
    "week1": ["Atividade 1", "Atividade 2", "Atividade 3"],
    "week2": ["Atividade 1", "Atividade 2", "Atividade 3"],
    "week3": ["Atividade 1", "Atividade 2", "Atividade 3"],
    "week4": ["Atividade 1", "Atividade 2", "Atividade 3"]
  },
  "calendar": [
    { "day": 1, "task": "Tipo de tratamento", "description": "Detalhes" },
    ... até o dia 28 ou 30
  ]
}

Garanta que o cronograma respeite a frequência de lavagem e o orçamento informado. Use termos técnicos mas acessíveis.
`.trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    try {
        const answers = req.body as QuizAnswers;

        if (!answers || !answers.hairType) {
            return res.status(400).json({ error: 'Respostas do quiz não fornecidas ou incompletas.' });
        }

        const prompt = buildPrompt(answers);
        const resultText = await callGemini(prompt);

        // Tenta limpar possíveis marcações de markdown do Gemini
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedResult;
        try {
            parsedResult = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Falha ao parsear JSON da IA:', resultText);
            return res.status(502).json({
                error: 'A IA gerou uma resposta inválida.',
                raw: resultText
            });
        }

        return res.status(200).json(parsedResult);
    } catch (error: any) {
        console.error('Erro na rota de diagnóstico:', error);
        return res.status(500).json({
            error: 'Erro interno ao processar o diagnóstico.',
            message: error.message
        });
    }
}

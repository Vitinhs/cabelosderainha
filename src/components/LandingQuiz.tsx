import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabaseClient";

const questions = [
  { id: "tipo", title: "Qual é o seu tipo de cabelo?", options: ["Liso", "Ondulado", "Cacheado", "Crespo"] },
  { id: "queda", title: "Seu cabelo está com queda excessiva?", options: ["Sim, muita queda", "Um pouco", "Quase nada", "Não tenho queda"] },
  { id: "quimica", title: "Seu cabelo tem química?", options: ["Tintura", "Progressiva", "Descoloração", "Nenhuma química"] },
  { id: "problema", title: "Qual é o principal problema hoje?", options: ["Queda", "Frizz", "Ressecamento", "Quebra", "Crescimento lento"] },
  { id: "tempo", title: "Há quanto tempo você sente esse problema?", options: ["Menos de 1 mês", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses"] },
  { id: "resultado", title: "Qual resultado você mais deseja?", options: ["Parar a queda", "Crescer mais rápido", "Ficar mais hidratado", "Diminuir frizz", "Recuperar danos"] },
];

interface QuizAnswers {
  tipo?: string;
  queda?: string;
  quimica?: string;
  problema?: string;
  tempo?: string;
  resultado?: string;
}

export default function LandingQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (option: string) => {
    const newAnswers: QuizAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(newAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
      setLoading(true);
      try {
        // salvar respostas no Supabase
        await supabase.from('quiz_respostas').insert([newAnswers]);
      } catch (error) {
        console.error("Erro ao salvar quiz:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const progress = Math.round((step / questions.length) * 100);

  const getResultText = () => {
    if (answers.queda === "Sim, muita queda") return "Seu cabelo precisa de um cronograma focado em fortalecimento e redução da queda.";
    if (answers.problema === "Ressecamento") return "Seu cabelo precisa de hidratação profunda e nutrição contínua.";
    return "Seu cabelo precisa de um cronograma equilibrado para crescimento saudável.";
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-6 space-y-6">
            {!finished ? (
              <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                {/* Custom Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div
                    className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <h1 className="text-2xl font-bold text-center">
                  {questions[step].title}
                </h1>

                <div className="grid gap-3 mt-4">
                  {questions[step].options.map((option) => (
                    <button
                      key={option}
                      className="w-full text-base py-4 px-6 border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors text-gray-700 font-medium"
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Resultado do seu diagnóstico</h2>
                {loading ? <p>Salvando suas respostas...</p> : <p className="text-lg">{getResultText()}</p>}

                {!loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-xl shadow">
                    <p className="font-semibold">Tratamento recomendado:</p>
                    <ul className="text-left list-disc list-inside mt-2 space-y-1">
                      <li>Hidratação profunda semanal</li>
                      <li>Nutrição para brilho e maciez</li>
                      <li>Fortalecimento para reduzir queda</li>
                    </ul>
                  </motion.div>
                )}

                {!loading && (
                  <button className="w-full py-4 text-lg bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl mt-4 transition-colors">
                    Quero começar meu tratamento agora
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
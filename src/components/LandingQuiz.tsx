import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabaseClient";
import { QuizAnswers } from "../../types";

const questions = [
  { id: "tipo", title: "Qual é o seu tipo de cabelo?", options: ["Liso", "Ondulado", "Cacheado", "Crespo"] },
  { id: "queda", title: "Seu cabelo está com queda excessiva?", options: ["Sim, muita queda", "Um pouco", "Quase nada", "Não tenho queda"] },
  { id: "quimica", title: "Seu cabelo tem química?", options: ["Tintura", "Progressiva", "Descoloração", "Nenhuma química"] },
  { id: "problema", title: "Qual é o principal problema hoje?", options: ["Queda", "Frizz", "Ressecamento", "Quebra", "Crescimento lento"] },
  { id: "tempo", title: "Há quanto tempo você sente esse problema?", options: ["Menos de 1 mês", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses"] },
  { id: "resultado", title: "Qual resultado você mais deseja?", options: ["Parar a queda", "Crescer mais rápido", "Ficar mais hidratado", "Diminuir frizz", "Recuperar danos"] },
];

interface LandingQuizProps {
  onStart?: () => void;
}

export default function LandingQuiz({ onStart }: LandingQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ nome: "", email: "" });

  const handleAnswer = (option: string) => {
    const newAnswers: QuizAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(newAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const gerarCronogramaSimples = (respostas: QuizAnswers) => {
    const plano = [];
    if (respostas.problema === "Queda" || respostas.queda === "Sim, muita queda") plano.push("Fortalecimento semanal");
    if (respostas.problema === "Ressecamento" || respostas.resultado === "Ficar mais hidratado") plano.push("Hidratação profunda");
    if (respostas.problema === "Frizz") plano.push("Nutrição anti-frizz");
    if (respostas.quimica !== "Nenhuma química") plano.push("Reconstrução quinzenal");
    return plano.length > 0 ? plano : ["Cronograma equilibrado HNR"];
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.nome || !leadInfo.email) return;

    setLoading(true);
    const cronograma = gerarCronogramaSimples(answers);

    try {
      // salvar respostas + lead no Supabase
      await supabase.from('clientes').insert([{
        nome: leadInfo.nome,
        email: leadInfo.email,
        respostas_quiz: answers,
        cronograma: cronograma,
        cronograma_entregue: false
      }]);
      setFinished(true);
      setShowLeadForm(false);
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
    } finally {
      setLoading(false);
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
            {!showLeadForm && !finished ? (
              <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
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
            ) : showLeadForm ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Estamos quase lá! 👑</h2>
                  <p className="text-gray-600 mt-2">Onde devemos entregar seu cronograma personalizado?</p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Como podemos te chamar?"
                      value={leadInfo.nome}
                      onChange={e => setLeadInfo({ ...leadInfo, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seu Melhor E-mail</label>
                    <input
                      required
                      type="email"
                      className="w-full p-4 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="exemplo@email.com"
                      value={leadInfo.email}
                      onChange={e => setLeadInfo({ ...leadInfo, email: e.target.value })}
                    />
                  </div>
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 text-lg bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-pink-200"
                  >
                    {loading ? "Processando..." : "Gerar Meu Cronograma Agora"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Resultado do seu diagnóstico</h2>
                <p className="text-lg">{getResultText()}</p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold">Plano Inicial Gerado:</p>
                  <ul className="text-left list-disc list-inside mt-2 space-y-1">
                    {gerarCronogramaSimples(answers).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </motion.div>

                <button
                  onClick={onStart}
                  className="w-full py-4 text-lg bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl mt-4 transition-colors"
                >
                  Acessar Aplicativo Completo
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../services/supabaseClient";
import { QuizAnswers } from "../../types";

const questions = [
  { id: "tipo", title: "Qual é o seu tipo de cabelo?", options: ["Liso", "Ondulado", "Cacheado", "Crespo"] },
  { id: "queda", title: "Seu cabelo está com queda excessiva?", options: ["Sim, muita", "Um pouco", "Não tenho queda"] },
  { id: "quimica", title: "Seu cabelo tem química?", options: ["Tintura", "Progressiva", "Descoloração", "Nenhuma"] },
  { id: "problema", title: "Qual é o seu desafio principal hoje?", options: ["Queda", "Frizz", "Ressecamento", "Quebra", "Crescimento lento"] },
  { id: "tempo", title: "Há quanto tempo você sente esse problema?", options: ["Menos de 1 mês", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses"] },
  { id: "resultado", title: "Qual resultado você mais deseja?", options: ["Parar a queda", "Crescer mais rápido", "Hidratação", "Diminuir frizz", "Recuperar danos"] },
];

interface LandingQuizProps {
  onFinish: (answers: QuizAnswers, lead: { nome: string; email: string }, clientId: string | null) => void;
}

export default function LandingQuiz({ onFinish }: LandingQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState({ nome: "", email: "" });

  const handleAnswer = (option: string) => {
    console.log(`Quiz Step ${step}: Answered ${option}`);
    const newAnswers: QuizAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(newAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      console.log("Quiz reached end. Showing lead form.");
      setShowLeadForm(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.nome || !leadInfo.email) return;

    console.log("Submitting lead...", leadInfo);
    setLoading(true);
    try {
      // salvar respostas + lead no Supabase
      const { data, error } = await supabase.from('clientes').insert([{
        nome: leadInfo.nome,
        email: leadInfo.email,
        respostas_quiz: answers,
        cronograma_entregue: false
      }]).select('id').single();

      if (error) {
        console.warn("Supabase insert error (likely RLS), proceeding anyway:", error);
        onFinish(answers, leadInfo, null);
      } else {
        console.log("Lead saved successfully with ID:", data.id);
        onFinish(answers, leadInfo, data.id);
      }
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      onFinish(answers, leadInfo, null);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round((step / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-emerald-50">
          <div className="p-8 md:p-12 space-y-8">
            <AnimatePresence mode="wait">
              {!showLeadForm ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-emerald-50 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-[#2d4a22] h-full rounded-full"
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-[#2d4a22] font-serif italic text-center leading-tight">
                    {questions[step].title}
                  </h2>

                  <div className="grid gap-3">
                    {questions[step].options.map((option) => (
                      <button
                        key={option}
                        className="w-full py-5 px-8 text-left border-2 border-emerald-50 rounded-2xl hover:border-[#2d4a22] hover:bg-emerald-50 transition-all text-gray-700 font-semibold group flex justify-between items-center"
                        onClick={() => handleAnswer(option)}
                      >
                        <span>{option}</span>
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-200 group-hover:border-[#2d4a22] transition-colors" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-block px-4 py-1 bg-emerald-100 text-[#2d4a22] rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Quase lá
                    </div>
                    <h2 className="text-3xl font-bold text-[#2d4a22] font-serif italic">Para onde enviamos seu cronograma?</h2>
                    <p className="text-gray-500 text-sm">Seus dados estão seguros e serão usados apenas para a entrega do seu plano personalizado.</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Nome Completo</label>
                      <input
                        required
                        type="text"
                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#2d4a22] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                        placeholder="Ex: Maria Souza"
                        value={leadInfo.nome}
                        onChange={e => setLeadInfo({ ...leadInfo, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Melhor E-mail</label>
                      <input
                        required
                        type="email"
                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#2d4a22] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                        placeholder="Ex: maria@email.com"
                        value={leadInfo.email}
                        onChange={e => setLeadInfo({ ...leadInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-5 bg-[#2d4a22] text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-[#1f3317] transition-all disabled:opacity-50"
                      >
                        {loading ? "Processando..." : "Gerar Meu Cronograma"}
                      </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 pt-2">
                      🔒 Seus dados estão seguros conforme a LGPD.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

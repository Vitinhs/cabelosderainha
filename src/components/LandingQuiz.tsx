import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/services/supabaseClient";
import { QuizAnswers } from "@/types";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { CheckCircle2, ArrowRight, Lock } from "lucide-react";

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
    const newAnswers: QuizAnswers = { ...answers, [questions[step].id]: option };
    setAnswers(newAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.nome || !leadInfo.email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('clientes').insert([{
        nome: leadInfo.nome,
        email: leadInfo.email,
        respostas_quiz: answers,
        cronograma_entregue: false
      }]).select('id').single();

      if (error) {
        console.warn("Supabase insert error, proceeding anyway:", error);
        onFinish(answers, leadInfo, null);
      } else {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {!showLeadForm ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                      <span>Passo {step + 1} de {questions.length}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-primary h-full rounded-full"
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif italic text-center leading-tight">
                    {questions[step].title}
                  </h2>

                  <div className="grid gap-3">
                    {questions[step].options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className="w-full h-16 justify-between text-lg font-medium border-2 hover:border-primary hover:bg-accent px-8 rounded-2xl group transition-all"
                        onClick={() => handleAnswer(option)}
                      >
                        <span className="text-foreground/80 group-hover:text-primary">{option}</span>
                        <div className="w-6 h-6 rounded-full border-2 border-primary/20 group-hover:border-primary flex items-center justify-center transition-colors">
                          <span className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-primary rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      Diagnóstico Concluído
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif italic">Para onde enviamos seu ritual?</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">Sua rotina personalizada baseada em ativos naturais está pronta para ser gerada.</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-6 max-w-sm mx-auto">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                      <Input
                        required
                        className="h-14 rounded-xl border-2 focus:border-primary px-6 text-base font-medium"
                        placeholder="Ex: Maria Souza"
                        value={leadInfo.nome}
                        onChange={e => setLeadInfo({ ...leadInfo, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Melhor E-mail</label>
                      <Input
                        required
                        type="email"
                        className="h-14 rounded-xl border-2 focus:border-primary px-6 text-base font-medium"
                        placeholder="Ex: maria@email.com"
                        value={leadInfo.email}
                        onChange={e => setLeadInfo({ ...leadInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="pt-4">
                      <Button
                        disabled={loading}
                        type="submit"
                        className="w-full h-16 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 group overflow-hidden relative"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {loading ? "Processando..." : "Gerar Meu Cronograma"}
                          {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">
                      <Lock className="w-3 h-3" />
                      Privacidade garantida
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


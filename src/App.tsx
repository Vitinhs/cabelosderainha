
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { HairPlan, HairDiagnosis, QuizAnswers, HairType, ScalpType, MainGoal } from '@/types';
import { generateHairPlan } from '@/services/geminiService';
import HomeView from '@/views/HomeView';
import ScheduleView from '@/views/ScheduleView';
import ChatView from '@/views/ChatView';
import AuthView from '@/views/AuthView';
import LandingPage from '@/views/LandingPage';
import LandingQuiz from '@/components/LandingQuiz';
import ResultView from '@/views/ResultView';
import SubscriptionView from '@/views/SubscriptionView';
import DashboardView from '@/views/DashboardView';
import ProfileView from '@/views/ProfileView';
import RecipesView from '@/views/RecipesView';
import { useTheme } from '@/hooks/useTheme';

import { supabase } from '@/services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { PrivateRoute, PlanGuard } from '@/core/routing';
import { Toaster } from "@/components/ui";

import { toast } from "sonner";


type JourneyPhase = 'landing' | 'quiz' | 'result' | 'subscription' | 'app';

const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [phase, setPhase] = useState<JourneyPhase>('landing');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [hairPlan, setHairPlan] = useState<HairPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<{ answers: QuizAnswers; lead: any; clientId: string | null } | null>(null);

  useEffect(() => {
    console.log("App mounted. Checking session...");

    const sessionTimeout = setTimeout(() => {
      if (isAuthLoading) {
        console.warn("Session check hanging... forcing loading to false.");
        setIsAuthLoading(false);
      }
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check result:", session ? "Session found" : "No session");
      clearTimeout(sessionTimeout);
      setSession(session);
      if (session) {
        setPhase('app');
        loadUserPlan(session.user.id);
        checkSubscription(session.user.id);
        syncClientId(session.user.email, session.user.id);
      } else {
        setIsAuthLoading(false);
      }
    }).catch(err => {
      console.error("Error getting session:", err);
      clearTimeout(sessionTimeout);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state change:", _event, session ? "User active" : "No user");
      setSession(session);
      if (session) {
        setPhase('app');
        loadUserPlan(session.user.id);
        checkSubscription(session.user.id);
        syncClientId(session.user.email, session.user.id);
      } else {
        setHairPlan(null);
        setIsSubscriber(false);
        setIsAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const syncClientId = async (email: string | undefined, userId?: string) => {
    if (!email) return;
    console.log("Syncing client data for email:", email);
    const { data } = await supabase.from('clientes').select('id, respostas_quiz, user_id').eq('email', email).maybeSingle();

    if (data) {
      console.log("Client found in 'clientes' table:", data.id);

      // Vincular user_id se ainda não estiver vinculado
      if (!data.user_id && userId) {
        console.log("Linking user_id to client record...");
        await supabase.from('clientes').update({ user_id: userId }).eq('id', data.id);
      }

      setDiagnosisData(prev => {
        const base = prev || { answers: {}, lead: {}, clientId: data.id };
        return { ...base, clientId: data.id, answers: data.respostas_quiz || base.answers };
      });
    }
  };

  const checkSubscription = async (userId: string) => {
    // Buscar assinaturas vinculadas ao cliente que pertence a este usuário
    const { data } = await supabase
      .from('assinaturas')
      .select('status, clientes!inner(user_id)')
      .eq('clientes.user_id', userId)
      .eq('status', 'ativa')
      .maybeSingle();

    setIsSubscriber(!!data);
  };

  const loadUserPlan = async (userId: string) => {
    setIsAuthLoading(true);
    try {
      console.log("Loading hair plan for user:", userId);
      const { data, error } = await supabase
        .from('hair_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("Existing hair plan found for user.");
        const plan = data[0];
        setHairPlan({
          ...plan,
          createdAt: plan.created_at,
          diagnosis: plan.diagnosis,
          tasks: plan.tasks,
          summary: plan.summary
        } as unknown as HairPlan);
      } else {
        console.log("No hair plan found for this user in database.");
      }
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleQuizFinish = async (answers: QuizAnswers, lead: any, clientId: string | null) => {
    console.log("Quiz finish received in App.tsx. ClientId:", clientId);
    setDiagnosisData({ answers, lead, clientId });
    setPhase('result');
  };

  const handleGeneratePlan = async () => {
    if (!diagnosisData) return;
    console.log("Starting plan generation...");
    setIsLoading(true);
    setLastError(null);

    try {
      const answers = diagnosisData.answers;

      // Mapeamento robusto das respostas do quiz para o objeto de diagnóstico
      const diagnosis = {
        hairType: (answers.tipo as string) || "Liso",
        problems: answers.problema ? [answers.problema] : [],
        goals: answers.resultado ? [answers.resultado] : [],
        currentRoutine: answers.tempo ? `Problema há ${answers.tempo}` : "Não informada",
        mainGoal: (answers.resultado || "Hidratação") as any
      };

      console.log("Chamando API com diagnóstico:", diagnosis);

      // Timeout de 45 segundos para a IA (Gemini pode levar um tempo)
      const planPromise = generateHairPlan(diagnosis);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("A IA demorou muito para responder. Verifique sua conexão ou tente novamente.")), 45000)
      );

      const plan = await Promise.race([planPromise, timeoutPromise]) as HairPlan;
      console.log("Plano recebido com sucesso:", plan);

      if (!plan || !plan.tasks || plan.tasks.length === 0) {
        throw new Error("Não foi possível gerar as tarefas do cronograma. Tente refazer o quiz.");
      }

      setHairPlan(plan);

      if (session?.user) {
        const { error } = await supabase.from('hair_plans').insert([{
          user_id: session.user.id,
          diagnosis: diagnosis,
          tasks: plan.tasks,
          summary: plan.summary
        }]);
        if (error) console.error("Erro ao salvar plano no banco:", error);
      }
    } catch (error: any) {
      console.error("Erro detalhado em handleGeneratePlan:", error);
      setLastError(error.message || "Ocorreu um erro inesperado ao gerar seu plano.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (day: number) => {
    setHairPlan(prev => {
      if (!prev) return prev;

      const updatedTasks = prev.tasks.map(t =>
        t.day === day ? { ...t, completed: !t.completed } : t
      );

      const updatedPlan = { ...prev, tasks: updatedTasks };

      // Persistir no banco se usuário estiver logado
      if (session?.user) {
        console.log(`Updating task for day ${day} in database...`);
        supabase
          .from('hair_plans')
          .update({ tasks: updatedTasks })
          .eq('user_id', session.user.id)
          .then(({ error }) => {
            if (error) console.error("Erro ao atualizar tarefa no banco:", error);
          });
      }

      return updatedPlan;
    });
  };

  useEffect(() => {
    if (phase === 'result' && diagnosisData && !hairPlan && !isLoading) {
      handleGeneratePlan();
    }
  }, [phase, diagnosisData]);


  const renderPhase = () => {
    if (isLoading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen bg-background flex flex-col items-center justify-center space-y-8 text-center p-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-primary font-serif italic">Criando seu cronograma...</h2>
            <p className="text-muted-foreground max-w-xs mx-auto animate-pulse">Nossa IA está analisando seus fios para construir seu ritual de beleza único.</p>
          </div>
        </motion.div>
      );
    }


    if (lastError) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-4"
        >
          <h2 className="text-xl font-bold">Ops! Algo deu errado</h2>
          <p className="text-sm text-gray-500">{lastError}</p>
          <button onClick={() => setLastError(null)} className="px-6 py-2 bg-[#2d4a22] text-white rounded-full">Tentar Novamente</button>
        </motion.div>
      );
    }

    switch (phase) {
      case 'landing':
        return <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LandingPage onStartQuiz={() => setPhase('quiz')} /></motion.div>;
      case 'quiz':
        return <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><LandingQuiz onFinish={handleQuizFinish} /></motion.div>;
      case 'result':
        return (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ResultView
              diagnosisText={hairPlan?.summary || "Analisando seus fios..."}
              initialPlan={hairPlan?.tasks.slice(0, 3).map(t => t.title) || ["Carregando plano..."]}
              onSubscribe={() => setPhase('subscription')}
            />
          </motion.div>
        );
      case 'subscription':
        return (
          <motion.div key="subscription" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <SubscriptionView
              userId={session?.user?.id}
              clientId={diagnosisData?.clientId}
              onSuccess={() => { setPhase('app'); setActiveTab('dashboard'); }}
              onCancel={() => setPhase('app')}
            />
          </motion.div>
        );
      default:
        if (!session) return <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AuthView onSuccess={() => { }} /></motion.div>;
        return (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <Layout activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} toggleTheme={toggleTheme}>
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div key="home" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <HomeView hairPlan={hairPlan} onStartDiagnosis={() => setPhase('quiz')} />
                  </motion.div>
                )}
                {activeTab === 'dashboard' && (
                  <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <PrivateRoute onRedirect={() => setPhase('landing')}>
                      <DashboardView
                        hairPlan={hairPlan}
                        clienteId={diagnosisData?.clientId || null}
                        userId={session?.user?.id}
                        onToggleTask={handleToggleTask}
                        isSubscriber={isSubscriber}
                      />
                    </PrivateRoute>
                  </motion.div>
                )}
                {activeTab === 'schedule' && (
                  <motion.div key="schedule" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <PrivateRoute onRedirect={() => setPhase('landing')}>
                      {hairPlan
                        ? <ScheduleView plan={hairPlan} onToggleTask={handleToggleTask} />
                        : <HomeView hairPlan={hairPlan} onStartDiagnosis={() => setPhase('quiz')} />}
                    </PrivateRoute>
                  </motion.div>
                )}
                {activeTab === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <PrivateRoute onRedirect={() => setPhase('landing')}>
                      <PlanGuard
                        requiredPlan="premium"
                        upgradeTitle="Chat exclusivo Premium"
                        upgradeDescription="Faça upgrade para conversar com nossa consultora de beleza com IA."
                        upgradeActionLabel="Ver planos"
                        onUpgrade={() => setPhase('subscription')}
                      >
                        <ChatView />
                      </PlanGuard>
                    </PrivateRoute>
                  </motion.div>
                )}
                {activeTab === 'recipes' && (
                  <motion.div key="recipes" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <RecipesView />
                  </motion.div>
                )}
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <PrivateRoute onRedirect={() => setPhase('landing')}>
                      <ProfileView session={session} isSubscriber={isSubscriber} />
                    </PrivateRoute>
                  </motion.div>
                )}
              </AnimatePresence>
            </Layout>
          </motion.div>
        );
    }
  };

  if (isAuthLoading && !diagnosisData) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2d4a22] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <AnimatePresence mode="wait">
        {renderPhase()}
      </AnimatePresence>
    </>
  );
};


export default App;

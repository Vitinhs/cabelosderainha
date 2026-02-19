
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { HairPlan, HairDiagnosis, QuizAnswers, HairType, ScalpType, MainGoal } from './types';
import { generateHairPlan } from './services/geminiService';
import HomeView from './views/HomeView';
import ScheduleView from './views/ScheduleView';
import ChatView from './views/ChatView';
import AuthView from './views/AuthView';
import LandingPage from './views/LandingPage';
import LandingQuiz from './src/components/LandingQuiz';
import ResultView from './views/ResultView';
import SubscriptionView from './views/SubscriptionView';
import DashboardView from './views/DashboardView';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

type JourneyPhase = 'landing' | 'quiz' | 'result' | 'subscription' | 'app';

const App: React.FC = () => {
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
        syncClientId(session.user.email);
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
        syncClientId(session.user.email);
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

  const syncClientId = async (email: string | undefined) => {
    if (!email) return;
    console.log("Syncing client data for email:", email);
    const { data } = await supabase.from('clientes').select('id, respostas_quiz').eq('email', email).maybeSingle();

    if (data) {
      console.log("Client found in 'clientes' table:", data.id);
      setDiagnosisData(prev => {
        const base = prev || { answers: {}, lead: {}, clientId: data.id };
        return { ...base, clientId: data.id, answers: data.respostas_quiz || base.answers };
      });

      // Se não temos plano carregado, mas temos respostas, podemos tentar gerar/carregar
      if (!hairPlan && data.respostas_quiz && Object.keys(data.respostas_quiz).length > 0) {
        console.log("User has saved quiz answers but no plan in state. Phase is:", phase);
      }
    }
  };

  const checkSubscription = async (userId: string) => {
    const { data } = await supabase
      .from('assinaturas')
      .select('status')
      .eq('cliente_id', userId)
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
      const diagnosis: HairDiagnosis = {
        hairType: (answers.tipo as any) || HairType.STRAIGHT,
        scalpType: ScalpType.NORMAL,
        porosity: 'Média',
        hasChemicals: answers.quimica !== 'Nenhuma',
        frequencyOfWash: '3x por semana',
        mainGoal: (answers.resultado?.includes('queda') ? MainGoal.STRENGTH :
          answers.resultado?.includes('crescer') ? MainGoal.GROWTH :
            answers.resultado?.includes('Hidratação') ? MainGoal.HYDRATION :
              answers.resultado?.includes('danos') ? MainGoal.DAMAGE_REPAIR :
                MainGoal.HYDRATION),
        budgetLevel: 'Baixo (Caseiro)'
      };

      console.log("Calling generateHairPlan with diagnosis:", diagnosis);

      // Timeout de 30 segundos para a IA
      const planPromise = generateHairPlan(diagnosis);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("A IA demorou muito para responder. Tente novamente.")), 30000)
      );

      const plan = await Promise.race([planPromise, timeoutPromise]) as HairPlan;
      console.log("Hair plan received:", plan);

      if (!plan || !plan.tasks) {
        throw new Error("O plano veio vazio. Tente refazer o quiz.");
      }

      setHairPlan(plan);

      // Persistir no Supabase se logado
      if (session?.user) {
        console.log("User logged in. Persisting plan to database...");
        const { error } = await supabase.from('hair_plans').insert([{
          user_id: session.user.id,
          diagnosis: diagnosis,
          tasks: plan.tasks,
          summary: plan.summary
        }]);
        if (error) console.error("Erro ao salvar plano no banco:", error);
        else console.log("Plan saved to database.");
      }
    } catch (error: any) {
      console.error("Error in handleGeneratePlan:", error);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (phase === 'result' && diagnosisData && !hairPlan && !isLoading) {
      handleGeneratePlan();
    }
  }, [phase, diagnosisData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-screen bg-[#fcfbf7] flex flex-col items-center justify-center space-y-6 text-center p-6">
          <div className="w-16 h-16 border-4 border-[#2d4a22] border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#2d4a22] font-serif italic">Criando seu cronograma...</h2>
            <p className="text-sm text-gray-500 max-w-xs">Nossa IA está analisando seus fios para construir a melhor rotina 100% natural.</p>
          </div>
        </div>
      );
    }

    if (lastError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">Ops! Algo deu errado</h2>
          <p className="text-sm text-gray-500">{lastError}</p>
          <button onClick={() => setLastError(null)} className="px-6 py-2 bg-[#2d4a22] text-white rounded-full">Tentar Novamente</button>
        </div>
      );
    }

    if (phase === 'landing') return <LandingPage onStartQuiz={() => setPhase('quiz')} />;
    if (phase === 'quiz') return <LandingQuiz onFinish={handleQuizFinish} />;
    if (phase === 'result') return (
      <ResultView
        diagnosisText={hairPlan?.summary || "Analisando seus fios..."}
        initialPlan={hairPlan?.tasks.slice(0, 3).map(t => t.title) || ["Carregando plano..."]}
        onSubscribe={() => setPhase('subscription')}
      />
    );
    if (phase === 'subscription') return (
      <SubscriptionView
        onSuccess={() => { setPhase('app'); setActiveTab('dashboard'); }}
        onCancel={() => setPhase('app')}
      />
    );

    // Main App Phase
    if (!session) return <AuthView onSuccess={() => { }} />;

    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'home' && <HomeView hairPlan={hairPlan} onStartDiagnosis={() => setPhase('quiz')} />}
        {activeTab === 'dashboard' && <DashboardView hairPlan={hairPlan} clienteId={diagnosisData?.clientId || null} />}
        {activeTab === 'schedule' && (hairPlan ? <ScheduleView plan={hairPlan} onToggleTask={() => { }} /> : <HomeView hairPlan={hairPlan} onStartDiagnosis={() => setPhase('quiz')} />)}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'profile' && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#2d4a22]">Sua Conta</h2>
            <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold">Sair da Conta</button>
          </div>
        )}
      </Layout>
    );
  };

  if (isAuthLoading && !diagnosisData) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2d4a22] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return renderContent();
};

export default App;

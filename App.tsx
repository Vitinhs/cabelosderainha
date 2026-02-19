
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { HairPlan, HairDiagnosis, QuizAnswers } from './types';
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
  const [diagnosisData, setDiagnosisData] = useState<{ answers: QuizAnswers; lead: any } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setPhase('app');
        loadUserPlan(session.user.id);
        checkSubscription(session.user.id);
      } else {
        setIsAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setPhase('app');
        loadUserPlan(session.user.id);
        checkSubscription(session.user.id);
      } else {
        setHairPlan(null);
        setIsSubscriber(false);
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const { data } = await supabase
        .from('hair_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (data) {
        setHairPlan(data as unknown as HairPlan);
      }
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleQuizFinish = async (answers: QuizAnswers, lead: any) => {
    setDiagnosisData({ answers, lead });
    setPhase('result');
  };

  const handleGeneratePlan = async () => {
    if (!diagnosisData) return;
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

      const plan = await generateHairPlan(diagnosis);
      setHairPlan(plan);
    } catch (error: any) {
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
        {activeTab === 'dashboard' && <DashboardView hairPlan={hairPlan} />}
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

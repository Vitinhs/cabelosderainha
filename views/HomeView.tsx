
import React, { useState } from 'react';
import { HairPlan } from '../types';
import { fastHairTip } from '../services/geminiService';

interface HomeViewProps {
  hairPlan: HairPlan | null;
  onStartDiagnosis: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ hairPlan, onStartDiagnosis }) => {
  const [quickTip, setQuickTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const currentDay = hairPlan ? Math.floor((Date.now() - new Date(hairPlan.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1;
  const todayTask = hairPlan?.tasks.find(t => t.day === Math.min(currentDay, 30));
  const progress = hairPlan ? (hairPlan.tasks.filter(t => t.completed).length / 30) * 100 : 0;

  const handleGetTip = async (problem: string) => {
    setSelectedProblem(problem);
    setIsLoadingTip(true);
    // Pequeno delay para suavidade visual se a API for rápida demais
    setQuickTip(null);
    try {
      const tip = await fastHairTip(problem, hairPlan?.diagnosis);
      setQuickTip(tip);
    } catch (error) {
      setQuickTip("Ops! Não consegui buscar sua dica agora. Tente novamente em instantes.");
    } finally {
      setIsLoadingTip(false);
    }
  };

  const commonProblems = [
    { label: 'Frizz', icon: '🌬️' },
    { label: 'Queda', icon: '🍂' },
    { label: 'Oleosidade', icon: '✨' },
    { label: 'Pontas Duplas', icon: '✂️' },
    { label: 'Ressecamento', icon: '🌵' },
    { label: 'Caspa', icon: '❄️' }
  ];

  return (
    <div className="py-4 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Card */}
      <section className="bg-[#2d4a22] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-emerald-900/20">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Olá, Naturalista!</h2>
          <p className="text-sm text-emerald-100/80 mb-6">
            Sua jornada para um cabelo saudável e livre de químicos começa aqui.
          </p>
          {!hairPlan ? (
            <button 
              onClick={onStartDiagnosis}
              className="bg-white text-[#2d4a22] px-6 py-3 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-all hover:bg-emerald-50"
            >
              Criar meu cronograma
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest">Progresso Total</span>
                  <span className="text-xs font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-emerald-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-[10px] mt-2 text-emerald-100/70 italic">
                  {progress === 100 ? "Incrível! Ciclo de 30 dias completo." : `Você está no dia ${currentDay} da sua transformação.`}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-800/30 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl"></div>
      </section>

      {/* Today's Focus */}
      {hairPlan && todayTask && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2d4a22]">Foco de Hoje</h3>
            <span className="text-[10px] bg-[#e8f0e3] text-[#2d4a22] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
              Dia {todayTask.day} • {todayTask.category}
            </span>
          </div>
          <div className="bg-white border border-[#e8f0e3] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-gray-800 mb-2">{todayTask.title}</h4>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{todayTask.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#2d4a22] font-bold text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ver detalhes na aba "Plano"</span>
              </div>
              {todayTask.completed && (
                <span className="flex items-center text-emerald-600 text-[10px] font-bold uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Concluído
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Dica Express Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2d4a22]">Dica Express</h3>
          {quickTip && (
            <button 
              onClick={() => { setQuickTip(null); setSelectedProblem(null); }}
              className="text-[10px] text-gray-400 font-bold uppercase hover:text-red-400 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 px-1">Precisa de uma solução rápida para agora? Escolha um tema:</p>
        
        <div className="flex overflow-x-auto space-x-3 pb-3 no-scrollbar -mx-1 px-1">
          {commonProblems.map((p) => (
            <button
              key={p.label}
              onClick={() => handleGetTip(p.label)}
              disabled={isLoadingTip}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl border transition-all text-sm font-medium
                ${selectedProblem === p.label 
                  ? 'bg-[#2d4a22] text-white border-[#2d4a22] shadow-md shadow-emerald-900/10' 
                  : 'bg-white border-gray-100 text-gray-600 hover:border-[#2d4a22]/30 active:scale-95'}
                ${isLoadingTip && selectedProblem !== p.label ? 'opacity-50' : 'opacity-100'}
              `}
            >
              <span className="text-lg">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {(isLoadingTip || quickTip) && (
          <div className="bg-white border border-[#2d4a22]/10 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#2d4a22]"></div>
            
            {isLoadingTip ? (
              <div className="flex items-center space-x-4 py-2">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-emerald-100 rounded-full"></div>
                  <div className="w-10 h-10 border-4 border-[#2d4a22] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2d4a22]">Processando sua dica...</p>
                  <p className="text-[10px] text-gray-400">Consultando a sabedoria da natureza.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-[#e8f0e3] rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2d4a22]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-[#2d4a22] uppercase tracking-widest">Dica: {selectedProblem}</span>
                  </div>
                  <button 
                    onClick={() => handleGetTip(selectedProblem!)}
                    className="p-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
                    title="Pedir outra dica"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className="text-[15px] text-gray-800 leading-relaxed font-medium italic">
                  "{quickTip}"
                </p>
                {hairPlan && (
                  <p className="text-[9px] text-[#6b7c5e] uppercase font-bold tracking-tighter pt-1 border-t border-gray-50">
                    Adaptado para o seu tipo de cabelo: {hairPlan.diagnosis.hairType}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Philosophy static cards */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-[#2d4a22]">Filosofia Capillaire</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-5 rounded-3xl flex flex-col items-center text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 text-xl shadow-inner">✨</div>
            <div>
              <p className="text-xs font-bold text-gray-800">Menos é Mais</p>
              <p className="text-[10px] text-gray-400 mt-1">Sua beleza natural não precisa de químicos.</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-5 rounded-3xl flex flex-col items-center text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl shadow-inner">💧</div>
            <div>
              <p className="text-xs font-bold text-gray-800">Hidratação Vital</p>
              <p className="text-[10px] text-gray-400 mt-1">Beba água e use umectantes naturais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Natural Ingredients */}
      <section className="space-y-4 pb-8">
        <h3 className="text-lg font-bold text-[#2d4a22]">Ingredientes Estrela</h3>
        <div className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar -mx-1 px-1">
          {[
            { name: 'Babosa', icon: '🌿', desc: 'Hidratação profunda' },
            { name: 'Óleo de Côco', icon: '🥥', desc: 'Nutrição intensa' },
            { name: 'Mel', icon: '🍯', desc: 'Brilho e maciez' },
            { name: 'Vinagre Maçã', icon: '🍎', desc: 'Equilíbrio do pH' }
          ].map((ing, i) => (
            <div key={i} className="flex-shrink-0 w-32 bg-white border border-gray-50 rounded-3xl p-4 text-center shadow-sm hover:translate-y-[-2px] transition-transform">
              <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-3xl shadow-inner">
                {ing.icon}
              </div>
              <p className="text-xs font-bold text-gray-800">{ing.name}</p>
              <p className="text-[9px] text-gray-400 mt-1">{ing.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;

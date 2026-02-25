
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan } from '@/types';
import { fastHairTip } from '@/services/geminiService';
import { Button, Badge } from '@/components/ui';
import ScrollableRow from '@/components/ScrollableRow';

interface HomeViewProps {
  hairPlan: HairPlan | null;
  onStartDiagnosis: () => void;
}

const QUICK_PROBLEMS = [
  { label: 'Frizz', icon: '🌬️' },
  { label: 'Queda', icon: '🍂' },
  { label: 'Oleosidade', icon: '✨' },
  { label: 'Pontas Duplas', icon: '✂️' },
  { label: 'Ressecamento', icon: '🌵' },
  { label: 'Caspa', icon: '❄️' },
];

const INGREDIENTS = [
  { name: 'Babosa', icon: '🌿', desc: 'Hidratação profunda' },
  { name: 'Óleo de Coco', icon: '🥥', desc: 'Nutrição intensa' },
  { name: 'Mel', icon: '🍯', desc: 'Brilho e maciez' },
  { name: 'Vinagre Maçã', icon: '🍎', desc: 'Equilíbrio do pH' },
];

const HomeView: React.FC<HomeViewProps> = ({ hairPlan, onStartDiagnosis }) => {
  const [quickTip, setQuickTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const currentDay = hairPlan
    ? Math.floor((Date.now() - new Date(hairPlan.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;
  const todayTask = hairPlan?.tasks.find((t) => t.day === Math.min(currentDay, 30));
  const progress = hairPlan ? (hairPlan.tasks.filter((t) => t.completed).length / 30) * 100 : 0;

  const handleGetTip = async (problem: string) => {
    setSelectedProblem(problem);
    setIsLoadingTip(true);
    setQuickTip(null);
    try {
      const tip = await fastHairTip(problem, hairPlan?.diagnosis);
      setQuickTip(tip || null);
    } catch {
      setQuickTip('Ops! Não foi possível buscar sua dica agora. Tente novamente.');
    } finally {
      setIsLoadingTip(false);
    }
  };

  return (
    <div className="py-5 space-y-7">

      {/* ── Hero Card ── */}
      <section className="card-brand shadow-premium">
        {/* Glows decorativos */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--color-brand-300)' }} />
        <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-10"
          style={{ background: 'var(--color-gold-400)' }} />

        <div className="relative z-10 space-y-4">
          <div>
            <h2 className="text-section-title" style={{ color: 'var(--color-text-onBrand)' }}>
              Olá, Naturalista! 🌿
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Sua jornada para cabelos saudáveis começa aqui.
            </p>
          </div>

          {!hairPlan ? (
            <Button
              variant="secondary"
              size="default"
              onClick={onStartDiagnosis}
              style={{
                background: 'white',
                color: 'var(--color-action-primary)',
                border: 'none',
                width: 'auto',
              }}
            >
              Criar meu cronograma →
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)' }}>
                  Progresso Total
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'white' }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                {progress === 100
                  ? 'Incrível! Ciclo completo. 🎉'
                  : `Dia ${currentDay} da sua transformação.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Foco de Hoje ── */}
      <AnimatePresence>
        {hairPlan && todayTask && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-card-title">Foco de Hoje</h3>
              <Badge variant="brand">Dia {todayTask.day} • {todayTask.category}</Badge>
            </div>
            <div className="card" style={{ cursor: 'default' }}>
              <h4 className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {todayTask.title}
              </h4>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {todayTask.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-label">Ver detalhes na aba "Plano"</span>
                {todayTask.completed && (
                  <Badge variant="success" icon="✓">Concluído</Badge>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Dica Express ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-card-title">Dica Express</h3>
          {quickTip && (
            <button
              onClick={() => { setQuickTip(null); setSelectedProblem(null); }}
              className="text-label transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Limpar
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          Precisa de uma solução rápida? Escolha um tema:
        </p>

        <ScrollableRow className="gap-2">
          {QUICK_PROBLEMS.map((p) => {
            const isSelected = selectedProblem === p.label;
            return (
              <Button
                size="default"
                key={p.label}
                onClick={() => handleGetTip(p.label)}
                disabled={isLoadingTip}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150"
                style={{
                  background: isSelected ? 'var(--color-action-primary)' : 'var(--color-surface-card)',
                  color: isSelected ? 'white' : 'var(--color-text-secondary)',
                  borderColor: isSelected ? 'var(--color-action-primary)' : 'var(--color-border-default)',
                  opacity: isLoadingTip && !isSelected ? 0.5 : 1,
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </Button>
            );
          })}
        </ScrollableRow>

        <AnimatePresence>
          {(isLoadingTip || quickTip) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card-flat"
              style={{ borderLeft: '3px solid var(--color-action-primary)' }}
            >
              {isLoadingTip ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-border-brand)', borderTopColor: 'transparent' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-brand)' }}>
                      Consultando a natureza...
                    </p>
                    <p className="text-label">Sua dica personalizada está chegando</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand">Dica: {selectedProblem}</Badge>
                    <button
                      onClick={() => handleGetTip(selectedProblem!)}
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Nova dica"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-base leading-relaxed font-medium italic" style={{ color: 'var(--color-text-primary)' }}>
                    "{quickTip}"
                  </p>
                  {hairPlan && (
                    <p className="text-label" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem' }}>
                      Adaptado para: {hairPlan.diagnosis.hairType}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Filosofia ── */}
      <section className="space-y-3">
        <h3 className="text-card-title">Filosofia Cabelos de Rainha</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '✨', title: 'Menos é Mais', desc: 'Sua beleza natural dispensa químicos.' },
            { icon: '💧', title: 'Hidratação Vital', desc: 'Beba água e use umectantes naturais.' },
          ].map((item, i) => (
            <div key={i} className="card-flat flex flex-col items-center text-center gap-3 py-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'var(--color-surface-brand)' }}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</p>
                <p className="text-label mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ingredientes Estrela ── */}
      <section className="space-y-3 pb-4">
        <h3 className="text-card-title">Ingredientes Estrela</h3>
        <ScrollableRow className="gap-3">
          {INGREDIENTS.map((ing, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-28 card-flat text-center transition-transform hover:-translate-y-1 duration-200"
            >
              <div className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl mb-2"
                style={{ background: 'var(--color-surface-subtle)' }}>
                {ing.icon}
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{ing.name}</p>
              <p className="text-label mt-0.5">{ing.desc}</p>
            </div>
          ))}
        </ScrollableRow>
      </section>
    </div>
  );
};

export default HomeView;

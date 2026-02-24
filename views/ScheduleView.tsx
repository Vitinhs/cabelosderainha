
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask } from '../types';
import { Button, Badge } from '../src/components/ui';

interface ScheduleViewProps {
  plan: HairPlan;
  onToggleTask: (day: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Hidratação': 'var(--color-action-info)',
  'Nutrição': 'var(--color-gold-400)',
  'Reconstrução': 'var(--color-action-danger)',
  'Detox': 'var(--color-action-success)',
};

const CATEGORY_BADGE_VARIANTS: Record<string, 'brand' | 'warn' | 'error' | 'success' | 'premium'> = {
  'Hidratação': 'brand',
  'Nutrição': 'warn',
  'Reconstrução': 'error',
  'Detox': 'success',
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ plan, onToggleTask }) => {
  const [selectedTask, setSelectedTask] = useState<DayTask | null>(null);

  return (
    <div className="py-6 space-y-8 pb-28">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>Seu Calendário</h2>
        <p className="text-label">Acompanhe seu progresso de 30 dias.</p>
      </header>

      {/* Legenda de categorias */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_BADGE_VARIANTS).map(([cat, variant]) => (
          <Badge key={cat} variant={variant}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ background: CATEGORY_COLORS[cat] }}
            />
            {cat}
          </Badge>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-5 gap-3">
        {plan.tasks.map((task) => {
          const dotColor = CATEGORY_COLORS[task.category] || 'var(--color-text-muted)';
          return (
            <motion.button
              key={task.day}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedTask(task)}
              className="aspect-square rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150"
              style={{
                background: task.completed ? 'var(--color-surface-brand)' : 'var(--color-surface-card)',
                borderColor: task.completed ? 'var(--color-border-brand)' : 'var(--color-border-subtle)',
                boxShadow: task.completed ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  color: task.completed ? 'var(--color-text-brand)' : 'var(--color-text-muted)',
                  letterSpacing: '0.03em',
                }}
              >
                D{task.day}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5"
                style={{ background: dotColor }}
              />
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 rounded-full p-0.5 flex items-center justify-center"
                  style={{ background: 'var(--color-action-primary)', width: '14px', height: '14px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" viewBox="0 0 20 20" fill="white">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Modal de Detalhe da Tarefa */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 pointer-events-auto backdrop-blur-sm"
              style={{ background: 'rgba(45,74,34,0.15)' }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg rounded-t-[2.5rem] p-8 space-y-6 relative pointer-events-auto"
              style={{
                background: 'var(--color-surface-card)',
                borderTop: '1px solid var(--color-border-subtle)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
              }}
            >
              {/* Handle */}
              <div className="w-12 h-1.5 rounded-full mx-auto -mt-2"
                style={{ background: 'var(--color-border-default)' }} />

              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <Badge variant={CATEGORY_BADGE_VARIANTS[selectedTask.category] || 'brand'}>
                    {selectedTask.category}
                  </Badge>
                  <h3 className="text-section-title" style={{ fontSize: '1.3rem', fontFamily: 'var(--font-family-serif)', fontStyle: 'italic' }}>
                    Dia {selectedTask.day}: {selectedTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2.5 rounded-xl flex-shrink-0 transition-colors"
                  style={{ background: 'var(--color-surface-subtle)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo */}
              <div className="max-h-[50vh] overflow-y-auto space-y-5 pr-1 no-scrollbar">
                <section className="space-y-2">
                  <p className="text-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ritual de Hoje</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedTask.description}
                  </p>
                </section>

                {selectedTask.recipe && (
                  <section
                    className="p-5 rounded-2xl space-y-3"
                    style={{
                      background: 'var(--color-surface-brand)',
                      border: '1px solid var(--color-border-brand)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🥣</span>
                      <p className="text-label" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-brand)' }}>
                        Receita Alquimia Natural
                      </p>
                    </div>
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{ color: 'var(--color-text-brand)', whiteSpace: 'pre-line' }}
                    >
                      {selectedTask.recipe}
                    </p>
                  </section>
                )}
              </div>

              {/* Ação */}
              <Button
                variant={selectedTask.completed ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => {
                  onToggleTask(selectedTask.day);
                  setSelectedTask(null);
                }}
              >
                {selectedTask.completed ? '↩ Reabrir Tarefa' : '✓ Completar Ritual'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleView;

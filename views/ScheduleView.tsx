
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask } from '../types';
import { Button, Badge, Card } from '../src/components/ui';
import { LoadingState, EmptyState, ErrorState } from '../src/components/ui/states';

interface ScheduleViewProps {
  plan?: HairPlan | null;
  onToggleTask: (day: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/** Maps each task category to the correct Badge variant */
const CATEGORY_BADGE_VARIANTS: Record<
  string,
  'brand' | 'warn' | 'error' | 'success' | 'premium'
> = {
  Hidratação: 'brand',
  Nutrição: 'warn',
  Reconstrução: 'error',
  Detox: 'success',
  Descanso: 'premium',
};

/** Maps each task category to the CSS variable colour used for the dot indicator */
const CATEGORY_DOT_COLORS: Record<string, string> = {
  Hidratação: 'var(--color-status-info-text)',
  Nutrição: 'var(--color-gold-400)',
  Reconstrução: 'var(--color-status-error-text)',
  Detox: 'var(--color-status-success-text)',
  Descanso: 'var(--color-text-muted)',
};

// ─── Main component ──────────────────────────────────────────────────────────
const ScheduleView: React.FC<ScheduleViewProps> = ({
  plan,
  onToggleTask,
  loading = false,
  error = null,
  onRetry,
}) => {
  const [selectedTask, setSelectedTask] = useState<DayTask | null>(null);

  /* ── Guard states ── */
  if (loading) {
    return (
      <div className="py-6 space-y-8 pb-28">
        <LoadingState
          showAvatar={false}
          lines={4}
          label="Carregando seu calendário..."
        />
        {/* Grid skeleton */}
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="skeleton aspect-square"
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 pb-28">
        <ErrorState
          title="Erro ao carregar calendário"
          message={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!plan || plan.tasks.length === 0) {
    return (
      <div className="py-6 pb-28">
        <EmptyState
          icon="📅"
          title="Nenhum cronograma ainda"
          description="Complete o quiz para receber seu plano capilar personalizado de 30 dias."
        />
      </div>
    );
  }

  /* ── Derived data ── */
  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalCount = plan.tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="py-6 space-y-8 pb-28">

      {/* ── Header ── */}
      <header className="space-y-1">
        <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>
          Seu Calendário
        </h2>
        <p className="text-label">Acompanhe seu progresso de 30 dias.</p>
      </header>

      {/* ── Progress summary ── */}
      <Card variant="flat" className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-label">Progresso Geral</p>
          <Badge variant={progressPercent === 100 ? 'success' : 'brand'}>
            {completedCount}/{totalCount} rituais
          </Badge>
        </div>
        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--color-border-subtle)' }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-action-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </Card>

      {/* ── Category legend ── */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_BADGE_VARIANTS).map(([cat, variant]) => (
          <Badge key={cat} variant={variant}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ background: CATEGORY_DOT_COLORS[cat] ?? 'var(--color-text-muted)' }}
            />
            {cat}
          </Badge>
        ))}
      </div>

      {/* ── Days grid ── */}
      <div className="grid grid-cols-5 gap-3">
        {plan.tasks.map((task) => {
          const dotColor =
            CATEGORY_DOT_COLORS[task.category] ?? 'var(--color-text-muted)';
          return (
            <motion.button
              key={task.day}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedTask(task)}
              aria-label={`Dia ${task.day}: ${task.title}${task.completed ? ' (concluído)' : ''}`}
              className="aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-all"
              style={{
                background: task.completed
                  ? 'var(--color-surface-brand)'
                  : 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${task.completed
                  ? 'var(--color-border-brand)'
                  : 'var(--color-border-subtle)'
                  }`,
                boxShadow: task.completed ? 'var(--shadow-card)' : 'none',
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              {/* Day number */}
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  color: task.completed
                    ? 'var(--color-text-brand)'
                    : 'var(--color-text-muted)',
                  letterSpacing: '0.03em',
                }}
              >
                D{task.day}
              </span>

              {/* Category dot */}
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5"
                style={{ background: dotColor }}
              />

              {/* Check mark when completed */}
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 rounded-full p-0.5 flex items-center justify-center"
                  style={{
                    background: 'var(--color-action-primary)',
                    width: '14px',
                    height: '14px',
                  }}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2 w-2"
                    viewBox="0 0 20 20"
                    fill="var(--color-text-onBrand)"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Task detail bottom sheet ── */}
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
              style={{ background: 'var(--color-surface-overlay)' }}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes do Dia ${selectedTask.day}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg p-8 space-y-6 relative pointer-events-auto"
              style={{
                background: 'var(--color-surface-card)',
                borderTop: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
                boxShadow: 'var(--shadow-modal)',
              }}
            >
              {/* Drag handle */}
              <div
                className="w-12 h-1.5 rounded-full mx-auto -mt-2"
                style={{ background: 'var(--color-border-default)' }}
                aria-hidden="true"
              />

              {/* Sheet header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <Badge
                    variant={
                      CATEGORY_BADGE_VARIANTS[selectedTask.category] ?? 'brand'
                    }
                  >
                    {selectedTask.category}
                  </Badge>
                  <h3
                    className="text-section-title"
                    style={{
                      fontSize: '1.3rem',
                      fontFamily: 'var(--font-family-serif)',
                      fontStyle: 'italic',
                    }}
                  >
                    Dia {selectedTask.day}: {selectedTask.title}
                  </h3>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setSelectedTask(null)}
                  aria-label="Fechar detalhes"
                  className="p-2.5 flex-shrink-0 transition-colors"
                  style={{
                    background: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="max-h-[50vh] overflow-y-auto space-y-5 pr-1 no-scrollbar">

                {/* Ritual description */}
                <section className="space-y-2">
                  <p
                    className="text-label"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    Ritual de Hoje
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {selectedTask.description}
                  </p>
                </section>

                {/* Recipe block */}
                {selectedTask.recipe && (
                  <Card variant="brand" className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" role="img" aria-label="Receita">🥣</span>
                      <p
                        className="text-label"
                        style={{
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--color-text-onBrand)',
                        }}
                      >
                        Receita Alquimia Natural
                      </p>
                    </div>
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{
                        color: 'var(--color-text-onBrand)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {selectedTask.recipe}
                    </p>
                  </Card>
                )}
              </div>

              {/* CTA */}
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

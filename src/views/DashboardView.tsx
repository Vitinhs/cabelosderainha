import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask, MainGoal } from '@/types';
import { Button, Badge, Card } from '@/components/ui';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import EvolutionGallery from '@/components/EvolutionGallery';

interface DashboardViewProps {
    hairPlan: HairPlan | null;
    clienteId: string | null;
    userId?: string;
    onToggleTask: (day: number) => void;
    isSubscriber?: boolean;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

/* ── Smart Tip Sub-component ── */
const SmartTip: React.FC<{ goal?: MainGoal }> = ({ goal }) => {
    const tip = useMemo(() => {
        const base = [
            'Beba pelo menos 2L de água hoje para hidratar seus fios de dentro para fora. 💧',
            'Use uma fronha de cetim para reduzir o frizz e a quebra durante o sono. 🎀',
            'Nunca prenda o cabelo ainda úmido para evitar a proliferação de fungos. 🚫',
            'Massageie o couro cabeludo por 2 minutos hoje para estimular a circulação. 💆‍♀️',
        ];
        const goalTips: Record<string, string[]> = {
            [MainGoal.GROWTH]: ['O óleo de rícino é seu melhor amigo para o crescimento. Use na raiz! 🌱'],
            [MainGoal.STRENGTH]: ['Evite fontes de calor excessivas enquanto seus fios estão fragilizados. 🔥'],
            [MainGoal.HYDRATION]: ['Ao enxaguar a máscara, use água fria para selar as cutículas e dar brilho. ✨'],
            [MainGoal.DAMAGE_REPAIR]: ['A reconstrução deve ser feita com cautela. Siga exatamente o cronograma! 🛠️'],
        };
        const all = goal && goalTips[goal] ? [...base, ...goalTips[goal]] : base;
        return all[Math.floor(Math.random() * all.length)];
    }, [goal]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100"
        >
            <span className="text-xl">💡</span>
            <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Dica Premium</p>
                <p className="text-sm leading-relaxed font-medium mt-1 text-amber-900/80">
                    {tip}
                </p>
            </div>
        </motion.div>
    );
};

/* ── Consistency Chart Sub-component ── */
const ConsistencyChart: React.FC<{ tasks: DayTask[] }> = ({ tasks }) => {
    const last7Days = useMemo(() => {
        const sorted = [...tasks].sort((a, b) => a.day - b.day);
        const lastCompletedIdx = tasks.findLastIndex((t) => t.completed);
        const startIdx = Math.max(0, lastCompletedIdx - 3);
        return sorted.slice(startIdx, startIdx + 7);
    }, [tasks]);

    return (
        <div className="flex items-end justify-between h-20 pt-2">
            {last7Days.map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: t.completed ? '60px' : '12px' }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="w-2 rounded-full"
                        style={{
                            background: t.completed ? 'var(--color-action-primary)' : 'var(--color-border-subtle)',
                            boxShadow: t.completed ? '0 0 10px rgba(45,74,34,0.3)' : 'none',
                        }}
                    />
                    <span
                        className="text-[10px] font-bold"
                        style={{
                            color: t.completed ? 'var(--color-text-brand)' : 'var(--color-text-muted)',
                        }}
                    >
                        D{t.day}
                    </span>
                </div>
            ))}
        </div>
    );
};



/* ── Main Dashboard View ── */
const DashboardView: React.FC<DashboardViewProps> = ({
    hairPlan, clienteId, userId, onToggleTask, isSubscriber,
    loading = false, error = null, onRetry,
}) => {
    const completedCount = hairPlan?.tasks.filter((t) => t.completed).length || 0;
    const progress = hairPlan?.tasks.length
        ? Math.round((completedCount / hairPlan.tasks.length) * 100)
        : 0;

    const checklistTasks = useMemo(() => {
        if (!hairPlan?.tasks) return [];
        const firstIncompleteIdx = hairPlan.tasks.findIndex((t) => !t.completed);
        if (firstIncompleteIdx === -1) return hairPlan.tasks.slice(-3);
        const startIdx = Math.max(0, firstIncompleteIdx - 1);
        return hairPlan.tasks.slice(startIdx, startIdx + 3);
    }, [hairPlan?.tasks]);

    /* ── Guard states ── */
    if (loading) {
        return (
            <div className="py-6 space-y-6 pb-28">
                <LoadingState showAvatar lines={3} label="Carregando seu portal..." />
                <LoadingState lines={5} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6 pb-28">
                <ErrorState
                    title="Erro ao carregar dashboard"
                    message={error}
                    onRetry={onRetry}
                />
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6 pb-28">
            <header className="space-y-5">
                <div className="flex justify-between items-start">
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold font-serif italic text-primary">
                            Seu Portal, Rainha 👑
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Dia {completedCount + 1} da sua jornada</p>
                    </motion.div>
                    {isSubscriber && <Badge variant="premium">✨ VIP</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 space-y-2 bg-white/50 border-none shadow-sm">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progresso Geral</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">
                                {progress}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full rounded-full bg-primary"
                            />
                        </div>
                    </Card>
                    <Card className="p-4 space-y-1 bg-white/50 border-none shadow-sm">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Consistência</p>
                        <ConsistencyChart tasks={hairPlan?.tasks || []} />
                    </Card>
                </div>
            </header>

            <SmartTip goal={hairPlan?.diagnosis.mainGoal} />

            <Card className="p-6 space-y-5 bg-white shadow-sm border-emerald-50">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">Meta de Hoje</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Checklist</span>
                </div>

                <Card className="p-4 space-y-3 bg-surface-bg border-none shadow-none">
                    <AnimatePresence>
                        {checklistTasks.length > 0 ? (
                            checklistTasks.map((t) => (
                                <motion.div
                                    key={t.day}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => onToggleTask(t.day)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${t.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-100 hover:border-emerald-100'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.completed ? 'bg-primary border-primary' : 'border-gray-200'
                                        }`}>
                                        {t.completed && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dia {t.day}</p>
                                        <p className={`text-sm font-bold truncate ${t.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                            {t.title}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <EmptyState
                                icon="✨"
                                title="Tudo pronto por hoje!"
                                description="Você está cada dia mais radiante. Amanhã tem mais rituais esperando."
                                className="py-6"
                            />
                        )}
                    </AnimatePresence>
                </Card>
            </Card>

            {userId && (
                <Card className="p-6 bg-white shadow-sm border-emerald-50">
                    <EvolutionGallery userId={userId} />
                </Card>
            )}

            <div className="p-6 rounded-[2rem] bg-primary text-white text-center space-y-4 shadow-xl shadow-primary/20">
                <p className="text-sm font-medium opacity-90">Dúvidas sobre sua rotina?</p>
                <Button
                    variant="outline"
                    className="w-full bg-transparent border-white text-white hover:bg-white hover:text-primary rounded-xl"
                >
                    Falar com Especialista
                </Button>
            </div>
        </div>
    );
};

export default DashboardView;

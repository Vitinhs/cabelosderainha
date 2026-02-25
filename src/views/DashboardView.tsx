
import React, { useMemo, useState } from 'react';
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

// ─── Frases motivacionais rotativas ─────────────────────────────────────────
const DAILY_PHRASES = [
    'Cada ritual é um passo para a sua melhor versão. 🌿',
    'Seus fios agradecem cada gota de cuidado natural. 💚',
    'Consistência é o segredo das rainhas de cabelo. 👑',
    'A natureza tem tudo que seus fios precisam. 🍃',
    'Hidratação é amor próprio em forma de ritual. 💧',
    'Sua beleza natural é única e merece seus cuidados. ✨',
    'Um dia de ritual de cada vez. Você está no caminho certo. 🌱',
];

// ─── Badges de conquista por semana ─────────────────────────────────────────
const WEEK_BADGES = [
    { week: 1, emoji: '🌱', label: 'Semente Plantada', color: '#4a8c2a' },
    { week: 2, emoji: '🌿', label: 'Brotos Crescendo', color: '#3d7522' },
    { week: 3, emoji: '🍃', label: 'Folhas Abertas', color: '#28a745' },
    { week: 4, emoji: '👑', label: 'Rainha Natural', color: '#d4af37' },
];

// ─── Dica inteligente ────────────────────────────────────────────────────────
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
            [MainGoal.DAMAGE_REPAIR]: ['A reconstrução deve ser feita com cautela. Siga exatamente o ritual! 🛠️'],
        };
        const all = goal && goalTips[goal] ? [...base, ...goalTips[goal]] : base;
        return all[Math.floor(Math.random() * all.length)];
    }, [goal]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{
                background: 'var(--color-surface-brand)',
                border: '1px solid var(--color-border-brand)',
            }}
        >
            <span className="text-xl">💡</span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-brand)' }}>
                    Insight do Dia
                </p>
                <p className="text-sm leading-relaxed font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {tip}
                </p>
            </div>
        </motion.div>
    );
};

// ─── Gráfico de consistência ─────────────────────────────────────────────────
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
                            boxShadow: t.completed ? '0 0 10px rgba(74,140,42,0.3)' : 'none',
                        }}
                    />
                    <span
                        className="text-[10px] font-bold"
                        style={{ color: t.completed ? 'var(--color-text-brand)' : 'var(--color-text-muted)' }}
                    >
                        D{t.day}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── Autoavaliação semanal ───────────────────────────────────────────────────
const SelfEvaluation: React.FC = () => {
    const [scores, setScores] = useState({ brilho: 0, maciez: 0, forca: 0 });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const attrs = [
        { key: 'brilho' as const, label: '✨ Brilho' },
        { key: 'maciez' as const, label: '☁️ Maciez' },
        { key: 'forca' as const, label: '💪 Força' },
    ];

    return (
        <div className="space-y-4">
            <p className="text-label">Como seus fios estão essa semana?</p>
            {attrs.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-brand)' }}>
                            {scores[key] > 0 ? `${scores[key]}/5` : '—'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setScores(s => ({ ...s, [key]: n }))}
                                className="flex-1 h-2 rounded-full transition-all duration-150"
                                style={{
                                    background: n <= scores[key]
                                        ? 'var(--color-action-primary)'
                                        : 'var(--color-border-subtle)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <button
                onClick={handleSave}
                className="text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150"
                style={{
                    background: saved ? 'var(--color-action-primary)' : 'var(--color-surface-subtle)',
                    color: saved ? 'white' : 'var(--color-text-brand)',
                }}
            >
                {saved ? '✓ Salvo!' : 'Salvar avaliação'}
            </button>
        </div>
    );
};

// ─── Dashboard principal ─────────────────────────────────────────────────────
const DashboardView: React.FC<DashboardViewProps> = ({
    hairPlan, clienteId, userId, onToggleTask, isSubscriber,
    loading = false, error = null, onRetry,
}) => {
    const [weeklyNote, setWeeklyNote] = useState('');
    const [noteSaved, setNoteSaved] = useState(false);

    const completedCount = hairPlan?.tasks.filter((t) => t.completed).length || 0;
    const progress = hairPlan?.tasks.length
        ? Math.round((completedCount / hairPlan.tasks.length) * 100)
        : 0;

    const currentDay = completedCount + 1;
    const currentWeek = Math.ceil(currentDay / 7);

    const dailyPhrase = useMemo(() => {
        const idx = (currentDay - 1) % DAILY_PHRASES.length;
        return DAILY_PHRASES[idx];
    }, [currentDay]);

    const checklistTasks = useMemo(() => {
        if (!hairPlan?.tasks) return [];
        const firstIncompleteIdx = hairPlan.tasks.findIndex((t) => !t.completed);
        if (firstIncompleteIdx === -1) return hairPlan.tasks.slice(-3);
        const startIdx = Math.max(0, firstIncompleteIdx - 1);
        return hairPlan.tasks.slice(startIdx, startIdx + 3);
    }, [hairPlan?.tasks]);

    const earnedBadges = WEEK_BADGES.filter(b => currentWeek > b.week);

    const handleSaveNote = () => {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
    };

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
                <ErrorState title="Erro ao carregar dashboard" message={error} onRetry={onRetry} />
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6 pb-28">

            {/* ── Header ── */}
            <header className="space-y-5">
                <div className="flex justify-between items-start">
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold font-serif italic" style={{ color: 'var(--color-text-brand)' }}>
                            Seu Portal, Rainha 👑
                        </h2>
                        <p className="text-xs uppercase tracking-widest font-bold mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Dia {currentDay} da sua jornada
                        </p>
                    </motion.div>
                    {isSubscriber && <Badge variant="premium">✨ VIP</Badge>}
                </div>

                {/* Frase do dia */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl italic text-sm font-medium text-center"
                    style={{
                        background: 'var(--color-surface-brand)',
                        color: 'var(--color-text-brand)',
                        border: '1px solid var(--color-border-brand)',
                    }}
                >
                    {dailyPhrase}
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                            Progresso Geral
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-brand)' }}>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-border-subtle)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full rounded-full"
                                style={{ background: 'var(--color-action-primary)' }}
                            />
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl space-y-1" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                            Consistência
                        </p>
                        <ConsistencyChart tasks={hairPlan?.tasks || []} />
                    </div>
                </div>
            </header>

            {/* ── Desafio 30 Dias ── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-card-title">🗓️ Desafio 30 Dias</h3>
                    <Badge variant="brand">Semana {currentWeek}/4</Badge>
                </div>

                {/* Barra de dias */}
                <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                            Dia {Math.min(currentDay, 30)} / 30
                        </span>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-brand)' }}>
                            {completedCount} rituais concluídos
                        </span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1;
                            const task = hairPlan?.tasks.find(t => t.day === day);
                            const isCompleted = task?.completed;
                            const isCurrent = day === Math.min(currentDay, 30);
                            return (
                                <motion.div
                                    key={day}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.015 }}
                                    className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold"
                                    style={{
                                        background: isCompleted
                                            ? 'var(--color-action-primary)'
                                            : isCurrent
                                                ? 'var(--color-border-brand)'
                                                : 'var(--color-surface-subtle)',
                                        color: isCompleted ? 'white' : isCurrent ? 'white' : 'var(--color-text-muted)',
                                        boxShadow: isCurrent ? '0 0 8px rgba(74,140,42,0.5)' : 'none',
                                    }}
                                >
                                    {isCompleted ? '✓' : day}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Badges de semana */}
                {earnedBadges.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-label">🏅 Conquistas desbloqueadas</p>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {earnedBadges.map(b => (
                                <motion.div
                                    key={b.week}
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl"
                                    style={{ background: 'var(--color-surface-brand)', border: '1px solid var(--color-border-brand)', minWidth: 80 }}
                                >
                                    <span className="text-2xl">{b.emoji}</span>
                                    <span className="text-[10px] font-bold text-center" style={{ color: 'var(--color-text-brand)' }}>
                                        {b.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ── Dica inteligente ── */}
            <SmartTip goal={hairPlan?.diagnosis.mainGoal} />

            {/* ── Ritual de Hoje ── */}
            <section className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-card-title">🌿 Ritual de Hoje</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                        Check-in
                    </span>
                </div>

                <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
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
                                    className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                                    style={{
                                        background: t.completed ? 'var(--color-surface-brand)' : 'var(--color-surface-subtle)',
                                        borderColor: t.completed ? 'var(--color-border-brand)' : 'var(--color-border-subtle)',
                                    }}
                                >
                                    <div
                                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{
                                            background: t.completed ? 'var(--color-action-primary)' : 'transparent',
                                            borderColor: t.completed ? 'var(--color-action-primary)' : 'var(--color-border-default)',
                                        }}
                                    >
                                        {t.completed && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                                            Dia {t.day}
                                        </p>
                                        <p className={`text-sm font-bold truncate`}
                                            style={{
                                                color: t.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                                textDecoration: t.completed ? 'line-through' : 'none',
                                            }}>
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
                </div>
            </section>

            {/* ── Diário Capilar ── */}
            <section className="space-y-4">
                <h3 className="text-card-title">📊 Diário Capilar Inteligente</h3>

                {/* Autoavaliação */}
                <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-brand)' }}>
                        Autoavaliação da Semana
                    </p>
                    <SelfEvaluation />
                </div>

                {/* Notas semanais */}
                <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-brand)' }}>
                        ✍️ Notas Semanais
                    </p>
                    <textarea
                        rows={3}
                        value={weeklyNote}
                        onChange={e => setWeeklyNote(e.target.value)}
                        placeholder="Como estão seus fios? Alguma reação a algum produto? Observações importantes..."
                        className="w-full text-sm rounded-xl p-3 resize-none border"
                        style={{
                            background: 'var(--color-surface-subtle)',
                            borderColor: 'var(--color-border-subtle)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    <button
                        onClick={handleSaveNote}
                        className="text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150"
                        style={{
                            background: noteSaved ? 'var(--color-action-primary)' : 'var(--color-surface-subtle)',
                            color: noteSaved ? 'white' : 'var(--color-text-brand)',
                        }}
                    >
                        {noteSaved ? '✓ Nota salva!' : 'Salvar nota'}
                    </button>
                </div>

                {/* Galeria antes/depois */}
                {userId && (
                    <div className="p-5 rounded-2xl" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
                        <EvolutionGallery userId={userId} />
                    </div>
                )}
            </section>

            {/* ── CTA Chat ── */}
            <div
                className="p-6 rounded-[2rem] text-center space-y-4"
                style={{
                    background: 'var(--color-action-primary)',
                    boxShadow: 'var(--shadow-button-primary)',
                }}
            >
                <p className="text-sm font-medium opacity-90 text-white">
                    Dúvidas sobre seu Ritual Natural?
                </p>
                <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    style={{ background: 'white', color: 'var(--color-action-primary)', border: 'none' }}
                >
                    Falar com a Mentora Natural 🌿
                </Button>
            </div>
        </div>
    );
};

export default DashboardView;

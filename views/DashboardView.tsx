
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask, MainGoal } from '../types';
import { supabase } from '../services/supabaseClient';
import { Button, Badge } from '../src/components/ui';
import EvolutionGallery from '../src/components/EvolutionGallery';
import { useState } from 'react';

interface DashboardViewProps {
    hairPlan: HairPlan | null;
    clienteId: string | null;
    userId?: string;
    onToggleTask: (day: number) => void;
    isSubscriber?: boolean;
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
            className="card-flat flex items-start gap-3"
            style={{ background: 'var(--color-status-warn-bg)', borderColor: 'rgba(217,119,6,0.15)' }}
        >
            <span className="text-xl">💡</span>
            <div>
                <p className="text-label" style={{ color: 'var(--color-status-warn-text)' }}>Dica Premium</p>
                <p className="text-sm leading-relaxed font-medium mt-1" style={{ color: 'var(--color-status-warn-text)' }}>
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
                        style={{
                            fontSize: '0.55rem',
                            fontWeight: 700,
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

/* ── Video VIP Sub-component ── */
const VideoVIPSection: React.FC<{ clienteId: string | null }> = ({ clienteId }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGerarVideo = async () => {
        if (!clienteId) { setError('ID do cliente não encontrado. Tente recarregar.'); return; }
        setLoading(true);
        setError(null);
        try {
            const { data, error: fnError } = await supabase.functions.invoke('vip-video', {
                body: { clienteId, script: 'Tutorial VIP de cronograma capilar' },
            });
            if (fnError) throw fnError;
            if (data?.error) throw new Error(data.message || data.error);
            setVideoUrl(data.videoUrl);
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar vídeo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {videoUrl ? (
                <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-lg">
                    <video src={videoUrl} controls className="w-full h-full" autoPlay />
                </div>
            ) : (
                <div
                    className="p-6 rounded-2xl border border-dashed text-center space-y-3"
                    style={{
                        background: 'var(--color-surface-brand)',
                        borderColor: 'var(--color-border-brand)',
                    }}
                >
                    <div className="text-4xl">🎬</div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-brand)' }}>
                        Seu conteúdo personalizado
                    </p>
                    <p className="text-label">Clique abaixo para gerar seu vídeo exclusivo com IA.</p>
                </div>
            )}
            {error && (
                <p className="text-xs px-2 italic" style={{ color: 'var(--color-status-error-text)' }}>
                    ⚠️ {error}
                </p>
            )}
            <Button variant="primary" loading={loading} onClick={handleGerarVideo}>
                {videoUrl ? 'Gerar Outro Vídeo' : 'Gerar Meu Vídeo VIP'}
            </Button>
            <p className="text-label text-center">Usuários Premium têm gerações ilimitadas.</p>
        </div>
    );
};

/* ── Main Dashboard View ── */
const DashboardView: React.FC<DashboardViewProps> = ({
    hairPlan, clienteId, userId, onToggleTask, isSubscriber,
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

    return (
        <div className="py-6 space-y-6 pb-28" style={{ background: 'var(--color-surface-bg)' }}>

            {/* ── Header ── */}
            <header className="space-y-5">
                <div className="flex justify-between items-start">
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>
                            Seu Portal, Rainha 👑
                        </h2>
                        <p className="text-label mt-1">Dia {completedCount + 1} da sua jornada</p>
                    </motion.div>
                    {isSubscriber && <Badge variant="premium" icon="✨">VIP</Badge>}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card-flat space-y-2">
                        <p className="text-label">Progresso Geral</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-brand)' }}>
                                {progress}%
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--color-action-success)' }}>
                                +5%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden"
                            style={{ background: 'var(--color-border-subtle)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full"
                                style={{ background: 'var(--color-action-primary)' }}
                            />
                        </div>
                    </div>
                    <div className="card-flat space-y-1">
                        <p className="text-label">Consistência</p>
                        <ConsistencyChart tasks={hairPlan?.tasks || []} />
                    </div>
                </div>
            </header>

            {/* ── Smart Tip ── */}
            <SmartTip goal={hairPlan?.diagnosis.mainGoal} />

            {/* ── Checklist ── */}
            <section className="card space-y-5" style={{ cursor: 'default' }}>
                <div className="flex justify-between items-center">
                    <h3 className="text-card-title">Meta de Hoje</h3>
                    <span className="text-label">Checklist</span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {checklistTasks.length > 0 ? (
                            checklistTasks.map((t) => (
                                <motion.div
                                    key={t.day}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    onClick={() => onToggleTask(t.day)}
                                    className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150"
                                    style={{
                                        background: t.completed ? 'var(--color-surface-brand)' : 'var(--color-surface-card)',
                                        borderColor: t.completed ? 'var(--color-border-brand)' : 'var(--color-border-subtle)',
                                    }}
                                >
                                    <div
                                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{
                                            background: t.completed ? 'var(--color-action-primary)' : 'transparent',
                                            borderColor: t.completed ? 'var(--color-action-primary)' : 'var(--color-border-default)',
                                        }}
                                    >
                                        {t.completed && <span style={{ color: 'white', fontSize: '0.7rem' }}>✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-label">Dia {t.day}</p>
                                        <p
                                            className="text-sm font-bold truncate"
                                            style={{
                                                color: t.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                                textDecoration: t.completed ? 'line-through' : 'none',
                                            }}
                                        >
                                            {t.title}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 space-y-2">
                                <div className="text-3xl">✨</div>
                                <p className="text-sm font-bold" style={{ color: 'var(--color-text-brand)' }}>
                                    Tudo pronto por hoje!
                                </p>
                                <p className="text-label">Você está cada dia mais radiante.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ── Galeria de Evolução ── */}
            {userId && (
                <section className="card" style={{ cursor: 'default' }}>
                    <EvolutionGallery userId={userId} />
                </section>
            )}

            {/* ── Vídeo VIP ── */}
            <section className="card space-y-5" style={{ cursor: 'default' }}>
                <div
                    className="flex justify-between items-center pb-4"
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="p-2 rounded-xl text-lg"
                            style={{ background: 'var(--color-surface-subtle)' }}
                        >
                            🎥
                        </span>
                        <h3 className="text-card-title">Sua Aula Customizada</h3>
                    </div>
                    <Badge variant="premium">Premium</Badge>
                </div>
                <VideoVIPSection clienteId={clienteId} />
            </section>

            {/* ── Support ── */}
            <div className="card-brand text-center space-y-4">
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                    Dúvidas sobre sua rotina?
                </p>
                <button
                    className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.12)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}
                >
                    Falar com Especialista
                </button>
            </div>
        </div>
    );
};

export default DashboardView;

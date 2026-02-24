
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HairPlan, DayTask, MainGoal } from '../types';
import { supabase } from '../services/supabaseClient';
import EvolutionGallery from '../src/components/EvolutionGallery';

interface DashboardViewProps {
    hairPlan: HairPlan | null;
    clienteId: string | null;
    userId?: string;
    onToggleTask: (day: number) => void;
    isSubscriber?: boolean;
}

const SmartTip: React.FC<{ goal?: MainGoal }> = ({ goal }) => {
    const tips = useMemo(() => {
        const baseTips = [
            "Beba pelo menos 2L de água hoje para hidratar seus fios de dentro para fora. 💧",
            "Use uma fronha de cetim para reduzir o frizz e a quebra durante o sono. 🎀",
            "Nunca prenda o cabelo ainda úmido para evitar a proliferação de fungos. 🚫",
            "Massageie o couro cabeludo por 2 minutos hoje para estimular a circulação. 💆‍♀️"
        ];

        const goalSpecificTips: Record<string, string[]> = {
            [MainGoal.GROWTH]: ["O óleo de rícino é seu melhor amigo para o crescimento. Use na raiz! 🌱"],
            [MainGoal.STRENGTH]: ["Evite fontes de calor excessivas enquanto seus fios estão fragilizados. 🔥"],
            [MainGoal.HYDRATION]: ["Ao enxaguar a máscara, use água fria para selar as cutículas e dar brilho. ✨"],
            [MainGoal.DAMAGE_REPAIR]: ["A reconstrução deve ser feita com cautela. Siga exatamente o cronograma! 🛠️"]
        };

        const activeTips = goal && goalSpecificTips[goal]
            ? [...baseTips, ...goalSpecificTips[goal]]
            : baseTips;

        return activeTips[Math.floor(Math.random() * activeTips.length)];
    }, [goal]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100/50 shadow-sm"
        >
            <div className="flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Dica Premium</p>
                    <p className="text-sm text-amber-900 leading-relaxed font-medium">{tips}</p>
                </div>
            </div>
        </motion.div>
    );
};

const ConsistencyChart: React.FC<{ tasks: DayTask[] }> = ({ tasks }) => {
    // Pegar os últimos 7 dias com tarefas
    const last7Days = useMemo(() => {
        const sorted = [...tasks].sort((a, b) => a.day - b.day);
        // Encontrar o dia atual (ou o último dia com tarefa concluída)
        const lastCompletedIdx = tasks.findLastIndex(t => t.completed);
        const startIdx = Math.max(0, lastCompletedIdx - 3);
        const endIdx = Math.min(tasks.length, startIdx + 7);
        return sorted.slice(startIdx, endIdx);
    }, [tasks]);

    return (
        <div className="flex items-end justify-between h-24 px-2 pt-4">
            {last7Days.map((t, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: t.completed ? '100%' : '20%' }}
                        className={`w-2 rounded-full transition-all duration-500 ${t.completed ? 'bg-[#2d4a22] shadow-[0_0_12px_rgba(45,74,34,0.3)]' : 'bg-gray-100'}`}
                        style={{ height: t.completed ? '60px' : '15px' }}
                    />
                    <span className={`text-[8px] font-bold ${t.completed ? 'text-[#2d4a22]' : 'text-gray-300'}`}>D{t.day}</span>
                </div>
            ))}
        </div>
    );
};

const VideoVIPSection: React.FC<{ clienteId: string | null }> = ({ clienteId }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGerarVideo = async () => {
        if (!clienteId) {
            setError("ID do cliente não encontrado. Tente recarregar.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error: functionError } = await supabase.functions.invoke('vip-video', {
                body: { clienteId, script: "Tutorial VIP de cronograma capilar" }
            });

            if (functionError) throw functionError;
            if (data.error) throw new Error(data.message || data.error);

            setVideoUrl(data.videoUrl);
        } catch (err: any) {
            console.error("Erro ao gerar vídeo:", err);
            setError(err.message || "Falha ao gerar vídeo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
                    <video src={videoUrl} controls className="w-full h-full" autoPlay />
                </div>
            ) : (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200 text-center space-y-4">
                    <div className="text-4xl text-[#2d4a22] opacity-80">🎬</div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[#2d4a22]">Seu conteúdo personalizado</p>
                        <p className="text-[10px] text-gray-500">Clique abaixo para gerar seu vídeo exclusivo da semana com IA.</p>
                    </div>
                </div>
            )}

            {error && <p className="text-[10px] text-red-500 font-medium px-2 italic">⚠️ {error}</p>}

            <button
                onClick={handleGerarVideo}
                disabled={loading}
                className="w-full py-4 bg-[#2d4a22] text-white rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
                {loading ? "Processando..." : (videoUrl ? "Gerar Outro Vídeo" : "Gerar Meu Vídeo VIP")}
            </button>
            <p className="text-[9px] text-center text-gray-400 font-medium">
                Usuários Premium têm gerações ilimitadas.
            </p>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ hairPlan, clienteId, userId, onToggleTask, isSubscriber }) => {
    const completedCount = hairPlan?.tasks.filter(t => t.completed).length || 0;
    const progress = hairPlan?.tasks.length ? Math.round((completedCount / hairPlan.tasks.length) * 100) : 0;

    // Find transition window for checklist stable view
    const checklistTasks = useMemo(() => {
        if (!hairPlan?.tasks) return [];
        const firstIncompleteIdx = hairPlan.tasks.findIndex(t => !t.completed);

        // If all completed, show the last 3
        if (firstIncompleteIdx === -1) {
            return hairPlan.tasks.slice(-3);
        }

        // Show current pending task, one before (if exists) and one after (if exists)
        // This keeps the list stable and shows the "checked" state of the most recent task
        const startIdx = Math.max(0, firstIncompleteIdx - 1);
        return hairPlan.tasks.slice(startIdx, startIdx + 3);
    }, [hairPlan?.tasks]);

    return (
        <div className="min-h-screen bg-[#fcfbf7] py-6 px-4 space-y-6 pb-32">
            {/* Header section with Stats */}
            <header className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-3xl font-bold text-[#2d4a22] font-serif italic">Seu Portal, Rainha 👑</h2>
                        <p className="text-gray-400 text-xs font-medium">Dia {completedCount + 1} da sua jornada</p>
                    </motion.div>
                    {isSubscriber && (
                        <div className="bg-[#2d4a22] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/20">
                            Vip
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Geral</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-bold text-[#2d4a22]">{progress}%</span>
                            <span className="text-[10px] text-emerald-500 font-bold">+5%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-[#2d4a22]"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consistência</p>
                        <ConsistencyChart tasks={hairPlan?.tasks || []} />
                    </div>
                </div>
            </header>

            <SmartTip goal={hairPlan?.diagnosis.mainGoal} />

            {/* Checklist High-impact */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-[#2d4a22] text-lg font-serif">Meta de Hoje</h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Checklist</span>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {checklistTasks.length > 0 ? (
                            checklistTasks.map((t, i) => (
                                <motion.div
                                    key={t.day}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => onToggleTask(t.day)}
                                    className="flex items-center space-x-4 p-5 rounded-3xl border bg-white border-gray-50 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-[#2d4a22] border-[#2d4a22]' : 'border-gray-100 group-hover:border-[#2d4a22]'
                                        }`}>
                                        {t.completed ? (
                                            <span className="text-white text-xs">✓</span>
                                        ) : (
                                            <div className="w-2 h-2 bg-[#2d4a22] rounded-full scale-0 transition-transform group-hover:scale-100" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-0.5">Dia {t.day}</p>
                                        <p className={`text-sm font-bold transition-all ${t.completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                                            {t.title}
                                        </p>
                                    </div>
                                    <span className={`text-xs transition-colors ${t.completed ? 'text-emerald-50' : 'text-gray-300'}`}>
                                        {t.completed ? '✓' : '→'}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8 space-y-3"
                            >
                                <div className="text-3xl">✨</div>
                                <p className="text-sm font-medium text-[#2d4a22]">Tudo pronto por hoje!</p>
                                <p className="text-[10px] text-gray-400">Você está cada dia mais radiante.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Evolution & Gallery */}
            <div className="grid gap-6">
                {userId && (
                    <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm">
                        <EvolutionGallery userId={userId} />
                    </section>
                )}

                {/* VIP Video Section */}
                <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                        <div className="flex items-center space-x-2">
                            <span className="p-2 bg-pink-50 rounded-xl text-lg">🎥</span>
                            <h3 className="font-bold text-[#2d4a22]">Sua Aula Customizada</h3>
                        </div>
                        <span className="text-[9px] bg-[#2d4a22] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Premium</span>
                    </div>

                    <VideoVIPSection clienteId={clienteId} />
                </section>
            </div>

            {/* Support / Help */}
            <div className="p-6 bg-[#2d4a22] rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-emerald-900/20">
                <p className="text-emerald-100/80 text-xs font-medium">Dúvidas sobre sua rotina?</p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    Falar com Especialista
                </button>
            </div>
        </div>
    );
};

export default DashboardView;

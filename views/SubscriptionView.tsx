
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { Button, Badge } from '../src/components/ui';

interface SubscriptionViewProps {
    onSuccess: () => void;
    onCancel: () => void;
    userId?: string;
    clientId?: string | null;
}

const PREMIUM_FEATURES = [
    { icon: '✨', text: 'Acesso ao Dashboard Interativo' },
    { icon: '📊', text: 'Histórico de Progresso & Badges' },
    { icon: '🎬', text: 'Vídeo-aulas de Receitas Caseiras' },
    { icon: '💬', text: 'Dicas semanais via WhatsApp' },
    { icon: '👩‍⚕️', text: 'Suporte VIP com Especialistas' },
];

const FREE_FEATURES = [
    'Cronograma Base de 30 dias',
    'Lista de Ingredientes Naturais',
];

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSuccess, onCancel, userId, clientId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!userId) { onSuccess(); return; }

        setIsLoading(true);
        setErrorMsg(null);
        try {
            let targetClientId = clientId;

            if (!targetClientId) {
                const { data: userData } = await supabase.auth.getUser();
                if (userData.user?.email) {
                    const { data: clientData } = await supabase
                        .from('clientes').select('id').eq('email', userData.user.email).maybeSingle();
                    targetClientId = clientData?.id;
                }
            }

            if (!targetClientId) {
                throw new Error('Não foi possível localizar o seu registro. Tente refazer o diagnóstico.');
            }

            const { error: subError } = await supabase.from('assinaturas').insert([{
                cliente_id: targetClientId,
                status: 'ativa',
                data_inicio: new Date().toISOString(),
            }]);
            if (subError) throw subError;

            await supabase.from('clientes').update({ assinatura_status: 'premium' }).eq('id', targetClientId);

            onSuccess();
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao processar assinatura.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-5" style={{ background: 'var(--color-surface-bg)' }}>
            <div className="max-w-lg mx-auto space-y-10">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3"
                >
                    <div className="text-4xl">👑</div>
                    <h2 className="text-section-title">Escolha o seu plano</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Transforme seu cabelo com acompanhamento profissional e resultados acelerados.
                    </p>
                </motion.div>

                {/* ── Cards de Plano ── */}
                <div className="grid gap-5">

                    {/* Plano Grátis */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-flat flex flex-col gap-6"
                    >
                        <div>
                            <h3 className="text-card-title">Versão Grátis</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                O básico para começar
                            </p>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>R$ 0</p>
                        <ul className="space-y-2">
                            {FREE_FEATURES.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    <span style={{ color: 'var(--color-action-success)', fontWeight: 700 }}>✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Button variant="secondary" onClick={onCancel}>
                            Continuar no Grátis
                        </Button>
                    </motion.div>

                    {/* Plano Premium */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-brand flex flex-col gap-6"
                    >
                        {/* Glow decorativo */}
                        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-20"
                            style={{ background: 'var(--color-brand-300)' }} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-card-title" style={{ color: 'white' }}>Plano Premium</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                    Sua melhor versão
                                </p>
                            </div>
                            <Badge variant="success">Mais Popular</Badge>
                        </div>

                        <div className="relative z-10 flex items-baseline gap-1">
                            <span className="text-4xl font-bold" style={{ color: 'white' }}>R$ 29,90</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>/mês</span>
                        </div>

                        <ul className="relative z-10 space-y-3">
                            {PREMIUM_FEATURES.map((f) => (
                                <li key={f.text} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <span>{f.icon}</span>
                                    {f.text}
                                </li>
                            ))}
                        </ul>

                        {errorMsg && (
                            <p className="relative z-10 text-xs p-3 rounded-lg font-medium"
                                style={{ background: 'var(--color-status-error-bg)', color: 'var(--color-status-error-text)' }}>
                                {errorMsg}
                            </p>
                        )}

                        <div className="relative z-10">
                            <Button
                                variant="secondary"
                                size="lg"
                                loading={isLoading}
                                onClick={handleSubscribe}
                                style={{
                                    background: 'white',
                                    color: 'var(--color-action-primary)',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                }}
                            >
                                Assinar Agora
                            </Button>
                        </div>
                    </motion.div>
                </div>

                <p className="text-label text-center">
                    Pagamento seguro • Cancele quando quiser com um clique
                </p>
            </div>
        </div>
    );
};

export default SubscriptionView;

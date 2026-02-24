
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

interface SubscriptionViewProps {
    onSuccess: () => void;
    onCancel: () => void;
    userId?: string;
    clientId?: string | null;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSuccess, onCancel, userId, clientId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!userId) {
            onSuccess();
            return;
        }

        setIsLoading(true);
        try {
            let targetClientId = clientId;

            // Fallback: se não temos o clientId, buscamos pelo email do usuário logado
            if (!targetClientId) {
                const { data: userData } = await supabase.auth.getUser();
                if (userData.user?.email) {
                    const { data: clientData } = await supabase
                        .from('clientes')
                        .select('id')
                        .eq('email', userData.user.email)
                        .maybeSingle();
                    targetClientId = clientData?.id;
                }
            }

            if (!targetClientId) {
                throw new Error("Não foi possível localizar o seu registro de cliente. Tente refazer o diagnóstico.");
            }

            // 1. Criar registro na tabela assinaturas
            const { error: subError } = await supabase
                .from('assinaturas')
                .insert([{
                    cliente_id: targetClientId,
                    status: 'ativa',
                    data_inicio: new Date().toISOString()
                }]);

            if (subError) throw subError;

            // 2. Atualizar status no cliente
            const { error: clientError } = await supabase
                .from('clientes')
                .update({ assinatura_status: 'premium' })
                .eq('id', targetClientId);

            if (clientError) console.warn("Erro ao atualizar status do cliente:", clientError);

            onSuccess();
        } catch (error: any) {
            console.error("Erro na assinatura:", error);
            alert("Erro ao processar assinatura: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfbf7] py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-4xl font-bold text-[#2d4a22] font-serif italic">Escolha o seu plano de beleza</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Transforme seu cabelo com acompanhamento profissional e resultados acelerados.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between shadow-sm"
                    >
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Versão Grátis</h3>
                                <p className="text-gray-400 text-sm italic">O básico para começar</p>
                            </div>
                            <div className="text-4xl font-bold text-gray-800">R$ 0</div>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="flex items-center space-x-2">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>Cronograma Base de 30 dias</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>Lista de Ingredientes Naturais</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={onCancel}
                            className="mt-8 w-full py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Continuar no Grátis
                        </button>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#2d4a22] p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-400 text-[#2d4a22] rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Mais Popular
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold">Plano Premium</h3>
                                <p className="text-emerald-100/60 text-sm italic">Sua melhor versão</p>
                            </div>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-4xl font-bold">R$ 29,90</span>
                                <span className="text-emerald-100/50 text-sm">/mês</span>
                            </div>
                            <ul className="space-y-4 text-sm text-emerald-100/80">
                                <li className="flex items-center space-x-2">
                                    <span>✨</span>
                                    <span>Acesso ao Dashboard Interativo</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span>✨</span>
                                    <span>Histórico de Progresso & Badges</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span>✨</span>
                                    <span>Vídeo-aulas de Receitas Caseiras</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span>✨</span>
                                    <span>Dicas semanais via WhatsApp</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span>✨</span>
                                    <span>Suporte VIP com Especialistas</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="mt-8 w-full py-4 bg-white text-[#2d4a22] rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl relative z-10 disabled:opacity-50"
                        >
                            {isLoading ? "Processando..." : "Assinar Agora"}
                        </button>

                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-800/30 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>

                <p className="text-center text-[10px] text-gray-400">
                    Pagamento seguro via Stripe/Pix. Cancele quando quiser com apenas um clique.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionView;

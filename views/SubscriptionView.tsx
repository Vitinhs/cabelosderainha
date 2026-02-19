
import React from 'react';
import { motion } from 'framer-motion';

interface SubscriptionViewProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSuccess, onCancel }) => {
    return (
        <div className="min-h-screen bg-[#fcfbf7] py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-[#2d4a22] font-serif italic">Escolha o seu plano de beleza</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Transforme seu cabelo com acompanhamento profissional e resultados acelerados.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Versão Grátis</h3>
                                <p className="text-gray-400 text-sm italic">O básico para começar</p>
                            </div>
                            <div className="text-4xl font-bold text-gray-800">R$ 0</div>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="flex items-center space-x-2">
                                    <span className="text-emerald-500">✓</span>
                                    <span>Cronograma Base de 30 dias</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="text-emerald-500">✓</span>
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
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-[#2d4a22] p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
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
                            onClick={onSuccess}
                            className="mt-8 w-full py-4 bg-white text-[#2d4a22] rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl relative z-10"
                        >
                            Assinar Agora
                        </button>

                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-800/30 rounded-full blur-3xl"></div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-400">
                    Pagamento seguro via Stripe. Cancele quando quiser com apenas um clique.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionView;

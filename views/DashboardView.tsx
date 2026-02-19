
import React from 'react';
import { motion } from 'framer-motion';
import { HairPlan } from '../types';

interface DashboardViewProps {
    hairPlan: HairPlan | null;
}

const DashboardView: React.FC<DashboardViewProps> = ({ hairPlan }) => {
    const progress = 35; // Mock progress

    return (
        <div className="min-h-screen bg-[#fcfbf7] py-6 px-6 space-y-8">
            {/* Welcome & Progress */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-[#2d4a22] font-serif italic">Olá, Rainha! 👑</h2>
                        <p className="text-gray-500 text-sm">Sua transformação já começou.</p>
                    </div>
                    <div className="bg-[#e8f0e3] px-4 py-2 rounded-2xl text-[#2d4a22] font-bold text-xs uppercase tracking-widest">
                        Premium
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Progresso do Ciclo</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-[#2d4a22] rounded-full"
                        />
                    </div>
                </div>
            </section>

            {/* Main Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Checklist */}
                <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                    <h3 className="font-bold text-[#2d4a22] border-b border-gray-50 pb-4">Checklist de Hoje</h3>
                    <div className="space-y-4">
                        {[
                            { task: "Massagem capilar (5min)", done: true },
                            { task: "Hidratação com Babosa", done: false },
                            { task: "Beber 2L de água", done: true }
                        ].map((t, i) => (
                            <div key={i} className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${t.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-50'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${t.done ? 'bg-[#2d4a22] border-[#2d4a22] text-white' : 'border-gray-200'}`}>
                                    {t.done ? '✓' : ''}
                                </div>
                                <span className={`text-sm font-medium ${t.done ? 'text-[#2d4a22] line-through opacity-50' : 'text-gray-700'}`}>{t.task}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Content Corner */}
                <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                    <h3 className="font-bold text-[#2d4a22] border-b border-gray-50 pb-4">Conteúdo VIP</h3>
                    <div className="grid gap-4">
                        <div className="p-4 bg-yellow-50 rounded-2xl flex items-center space-x-4 border border-yellow-100">
                            <span className="text-2xl">📹</span>
                            <div>
                                <p className="text-xs font-bold text-yellow-800">Masterclass Babosa</p>
                                <p className="text-[10px] text-yellow-600">Aprenda a extrair o gel puro.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl flex items-center space-x-4 border border-blue-100">
                            <span className="text-2xl">📚</span>
                            <div>
                                <p className="text-xs font-bold text-blue-800">Guia de Umectação</p>
                                <p className="text-[10px] text-blue-600">E-book completo em PDF.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Upsell Store Placeholder */}
            <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-bold font-serif italic">Kit Rainha Natural 🌿</h3>
                        <p className="text-emerald-100/60 text-sm">Receba em casa os óleos e máscaras que usamos nas receitas.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-[#2d4a22] rounded-2xl font-bold text-sm whitespace-nowrap hover:bg-emerald-50 transition-all">
                        Ver na Loja
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-800/30 rounded-full blur-3xl"></div>
            </section>

            {/* Footer Nav Space */}
            <div className="h-20" />
        </div>
    );
};

export default DashboardView;

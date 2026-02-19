
import React from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

interface ResultViewProps {
    diagnosisText: string;
    initialPlan: string[];
    onSubscribe: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ diagnosisText, initialPlan, onSubscribe }) => {

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(45, 74, 34); // #2d4a22
        doc.text("Cronograma Capilar de Rainha", margin, y);
        y += 15;

        // Diagnosis
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text("Seu Diagnóstico:", margin, y);
        y += 10;

        doc.setFontSize(11);
        const splitDiagnosis = doc.splitTextToSize(diagnosisText, 170);
        doc.text(splitDiagnosis, margin, y);
        y += (splitDiagnosis.length * 7) + 10;

        // Plan
        doc.setFontSize(14);
        doc.setTextColor(45, 74, 34);
        doc.text("Suas Primeiras Tarefas:", margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        initialPlan.forEach((task, index) => {
            doc.text(`${index + 1}. ${task}`, margin + 5, y);
            y += 8;
        });

        y += 15;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Gerado por Capillaire AI - Sua beleza natural.", margin, y);

        doc.save("meu-cronograma-capilar.pdf");
    };

    return (
        <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-50 p-8 md:p-12 space-y-10"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-block px-4 py-1.5 bg-[#e8f0e3] text-[#2d4a22] rounded-full text-xs font-bold tracking-widest uppercase">
                            Seu Diagnóstico está Pronto
                        </div>
                        <h2 className="text-4xl font-bold text-[#2d4a22] font-serif italic">👑 Resultado da sua Análise</h2>
                        <p className="text-lg text-gray-700 leading-relaxed font-medium">
                            "{diagnosisText}"
                        </p>
                    </div>

                    <div className="bg-[#f9faf8] rounded-3xl p-8 border border-emerald-50 space-y-6">
                        <h3 className="font-bold text-[#2d4a22] uppercase tracking-widest text-xs">Seu Cronograma Base:</h3>
                        <ul className="grid gap-4">
                            {initialPlan.map((item, i) => (
                                <li key={i} className="flex items-center space-x-3 bg-white p-4 rounded-2xl shadow-sm border border-emerald-50">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <span className="font-semibold text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-2xl font-bold font-serif italic">Acelere seus resultados! 🚀</h3>
                                <p className="text-emerald-100/80 text-sm leading-relaxed">
                                    Receba acompanhamento diário, vídeo-aulas exclusivas e suporte via chat por apenas **R$ 29,90/mês**.
                                </p>
                                <button
                                    onClick={onSubscribe}
                                    className="w-full py-4 bg-white text-[#2d4a22] rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-[1.02] active:scale-95"
                                >
                                    Quero Acesso Premium
                                </button>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-800/30 rounded-full blur-3xl"></div>
                        </div>

                        <button
                            onClick={handleDownloadPDF}
                            className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                        >
                            Baixar Versão Gratuita em PDF
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResultView;

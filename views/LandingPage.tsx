
import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onStartQuiz: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartQuiz }) => {
    return (
        <div className="min-h-screen bg-[#fcfbf7] font-sans selection:bg-[#c1d0b8] selection:text-[#2d4a22]">
            {/* Header / Hero Section */}
            <header className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <div className="inline-block px-4 py-1.5 bg-[#e8f0e3] text-[#2d4a22] rounded-full text-sm font-bold tracking-widest uppercase mb-4">
                        Saúde Capilar 100% Natural
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-[#2d4a22] leading-tight font-serif italic">
                        Descubra o cronograma perfeito para o seu cabelo <br className="hidden md:block" /> em apenas 2 minutos.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Nossa Inteligência Artificial analisa seus fios e cria uma rotina exclusiva com ingredientes naturais, focada em resultados reais e economia.
                    </p>
                    <div className="pt-8">
                        <button
                            onClick={onStartQuiz}
                            className="px-10 py-5 bg-[#2d4a22] text-white rounded-full text-xl font-bold shadow-2xl shadow-emerald-900/20 hover:bg-[#1f3317] transition-all transform hover:scale-105 active:scale-95"
                        >
                            Começar Meu Quiz Agora
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Benefits Section */}
            <section className="bg-white py-24 border-y border-emerald-50">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-4">
                        <div className="text-4xl">🌿</div>
                        <h3 className="text-xl font-bold text-gray-800">100% Natural</h3>
                        <p className="text-gray-500">Nada de químicos agressivos. Apenas o que a natureza oferece de melhor para seus fios.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-4xl">🤖</div>
                        <h3 className="text-xl font-bold text-gray-800">Cuidado com IA</h3>
                        <p className="text-gray-500">Algoritmos avançados que entendem a porosidade e curvatura do seu cabelo.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-4xl">💰</div>
                        <h3 className="text-xl font-bold text-gray-800">Economia Real</h3>
                        <p className="text-gray-500">Aprenda a cuidar do seu cabelo com ingredientes que você já tem em casa.</p>
                    </div>
                </div>
            </section>

            {/* Social Proof (Mock) */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center text-[#2d4a22] mb-16 font-serif italic">O que dizem nossas rainhas</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        { name: "Mariana Silva", text: "Meu cabelo mudou completamente! O cronograma é super fácil de seguir.", color: "bg-pink-50" },
                        { name: "Carla Oliveira", text: "Finalmente entendi o que meu cabelo precisava sem gastar fortunas.", color: "bg-emerald-50" }
                    ].map((test, i) => (
                        <div key={i} className={`${test.color} p-8 rounded-3xl border border-white shadow-sm`}>
                            <p className="text-gray-700 italic mb-4">"{test.text}"</p>
                            <p className="font-bold text-[#2d4a22]">- {test.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Summary */}
            <section className="bg-[#2d4a22] text-white py-24">
                <div className="max-w-3xl mx-auto px-6 space-y-12">
                    <h2 className="text-3xl font-bold text-center font-serif italic">Dúvidas Frequentes</h2>
                    <div className="space-y-8">
                        <div>
                            <h4 className="font-bold mb-2">Qualquer tipo de cabelo pode fazer?</h4>
                            <p className="text-emerald-100/70 text-sm">Sim! Nossa IA adapta as receitas para lisos, ondulados, cacheados e crespos.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2">As receitas são difíceis de fazer?</h4>
                            <p className="text-emerald-100/70 text-sm">Não, usamos ingredientes simples como babosa, mel, óleos vegetais e vinagre de maçã.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-gray-400 text-sm font-medium">
                © 2026 Cabelos de Rainha • Política de Privacidade • Termos de Uso
            </footer>
        </div>
    );
};

export default LandingPage;

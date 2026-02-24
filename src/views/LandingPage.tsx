import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Leaf, Bot, Wallet, ChevronRight } from "lucide-react";

interface LandingPageProps {
    onStartQuiz: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartQuiz }) => {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-accent selection:text-accent-foreground">
            {/* Header / Hero Section */}
            <header className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 -z-10 opacity-10"
                >
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse delay-1000" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-accent-foreground rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        Saúde Capilar 100% Natural
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold text-primary leading-tight font-serif italic tracking-tighter">
                        O seu ritual de beleza, <br className="hidden md:block" /> redesenhado pela IA.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                        Analisamos a biologia do seu fio para criar um cronograma capilar exclusivo com ativos naturais. Resultados reais, sem químicos agressivos.
                    </p>
                    <div className="pt-8">
                        <Button
                            size="lg"
                            className="h-16 px-10 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all group"
                            onClick={onStartQuiz}
                        >
                            Começar Diagnóstico Gratuito
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </header>

            {/* Benefits Section */}
            <section className="bg-card py-24 border-y border-border relative">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                    {[
                        { icon: <Leaf className="w-8 h-8 text-primary" />, title: "Bio-Ativos Naturais", desc: "Protocolos baseados em óleos, ervas e ativos botânicos de alta performance." },
                        { icon: <Bot className="w-8 h-8 text-primary" />, title: "IA de Precisão", desc: "Algoritmos que compreendem densidade, porosidade e histórico químico." },
                        { icon: <Wallet className="w-8 h-8 text-primary" />, title: "Sustentabilidade", desc: "Cuidado consciente que respeita sua saúde e o seu orçamento." }
                    ].map((item, i) => (
                        <Card key={i} className="border-none bg-accent/30 hover:bg-accent/50 transition-colors">
                            <CardContent className="pt-8 space-y-4 text-center">
                                <div className="mx-auto w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-sm">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground font-serif">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-primary mb-16 font-serif italic tracking-tight">Vozes da Comunidade</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        { name: "Mariana Silva", text: "Meu cabelo recuperou o brilho que eu não via há anos. O cronograma é prático e muito eficaz.", role: "Cacheada há 2 anos" },
                        { name: "Carla Oliveira", text: "A IA acertou exatamente o que meu cabelo precisava. Economizei muito em produtos caros.", role: "Transição Capilar" }
                    ].map((test, i) => (
                        <Card key={i} className="border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden group">
                            <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                            <CardContent className="p-8">
                                <p className="text-foreground/80 italic text-lg mb-6 leading-relaxed">"{test.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-bold text-primary font-serif">
                                        {test.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary">{test.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{test.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-primary text-primary-foreground py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="max-w-3xl mx-auto px-6 text-center space-y-8 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif italic">Pronta para o seu melhor cabelo?</h2>
                    <p className="text-primary-foreground/80 text-lg">Junte-se a milhares de rainhas que já transformaram sua rotina.</p>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="h-16 px-12 rounded-full text-xl font-bold shadow-xl"
                        onClick={onStartQuiz}
                    >
                        Quero Meu Cronograma
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">
                © 2026 Cabelos de Rainha • Design & Inteligência Natural
            </footer>
        </div>
    );
};

export default LandingPage;

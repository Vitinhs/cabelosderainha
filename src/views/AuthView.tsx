
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/services/supabaseClient';
import { Button, Input, Label } from '@/components/ui';

interface AuthViewProps {
    onSuccess: () => void;
}

type AuthMode = 'login' | 'register';

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail ou entre diretamente.' });
                setMode('login');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
            style={{ background: 'var(--color-surface-bg)' }}
        >
            {/* Glow decorativo */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'var(--color-action-primary)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-sm relative"
            >
                {/* Logo + Brand */}
                <div className="text-center mb-10">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"
                        style={{ background: 'var(--color-surface-brand)' }}
                    >
                        🌿
                    </div>
                    <h1 className="text-section-title mb-1">Cabelos de Rainha</h1>
                    <p className="text-label">Cronograma Capilar Inteligente</p>
                </div>

                {/* Tabs de modo */}
                <div
                    className="flex rounded-lg p-1 mb-8"
                    style={{ background: 'var(--color-surface-subtle)' }}
                >
                    {(['login', 'register'] as AuthMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setMessage(null); }}
                            type="button"
                            className="flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200"
                            style={{
                                background: mode === m ? 'var(--color-surface-card)' : 'transparent',
                                color: mode === m ? 'var(--color-text-brand)' : 'var(--color-text-muted)',
                                boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                            }}
                        >
                            {m === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    ))}
                </div>

                {/* Formulário */}
                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {mode === 'register' && (
                            <motion.div
                                key="name-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1.5"
                            >
                                <Label htmlFor="fullName">Seu Nome</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ex: Vitória Silva"
                                    required={mode === 'register'}
                                    autoComplete="name"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                            required
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    {/* Mensagem de feedback */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3 rounded-lg text-sm font-medium"
                                style={{
                                    background: message.type === 'success'
                                        ? 'var(--color-status-success-bg)'
                                        : 'var(--color-status-error-bg)',
                                    color: message.type === 'success'
                                        ? 'var(--color-status-success-text)'
                                        : 'var(--color-status-error-text)',
                                }}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" variant="default" loading={loading} size="lg">
                        {mode === 'login' ? 'Entrar na minha conta' : 'Criar minha conta grátis'}
                    </Button>
                </form>

                {/* Footer */}
                <p
                    className="text-center text-xs mt-8"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    Ao continuar, você concorda com nossos{' '}
                    <a href="#" style={{ color: 'var(--color-text-brand)' }}>Termos</a> e{' '}
                    <a href="#" style={{ color: 'var(--color-text-brand)' }}>Privacidade</a>.
                </p>
            </motion.div>
        </div>
    );
};

export default AuthView;

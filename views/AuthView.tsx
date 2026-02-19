import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthViewProps {
    onSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onSuccess();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu email ou faça login.' });
                setIsLogin(true);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcfbf7]">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#2d4a22] mb-2">Cabelos de Rainha</h1>
                    <p className="text-gray-500 italic">Sua jornada para um cabelo natural e saudável</p>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {isLogin ? 'Bem-vinda de volta' : 'Comece sua jornada'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-transparent outline-none transition-all"
                                    placeholder="Seu nome"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#2d4a22] text-white rounded-xl font-bold text-lg hover:bg-[#1f3317] transition-colors shadow-lg shadow-emerald-900/10 disabled:opacity-50"
                        >
                            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-[#2d4a22] hover:underline"
                        >
                            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400">
                        Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthView;

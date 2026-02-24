import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../services/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthState {
    /** Sessão ativa do Supabase (null = não autenticado) */
    session: Session | null;
    /** Usuário autenticado extraído da sessão */
    user: User | null;
    /** Verdadeiro enquanto a sessão inicial está sendo verificada */
    loading: boolean;
    /** Mensagem de erro da última operação de auth */
    error: string | null;
}

export interface AuthActions {
    /** Inicia login com email + password via Supabase.
     *  Substitua a implementação interna para trocar de backend sem alterar a API. */
    login: (email: string, password: string) => Promise<void>;
    /** Encerra a sessão atual */
    logout: () => Promise<void>;
    /** Limpa o erro atual manualmente */
    clearError: () => void;
}

export type AuthContextValue = AuthState & AuthActions;

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ── Bootstrap: verifica sessão existente + escuta mudanças ──
    useEffect(() => {
        // Timeout de segurança: se o Supabase travar, desbloqueia a UI
        const safetyTimer = setTimeout(() => setLoading(false), 5000);

        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setSession(session);
            })
            .catch(() => {
                setError('Falha ao verificar sessão. Tente recarregar.');
            })
            .finally(() => {
                clearTimeout(safetyTimer);
                setLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, []);

    // ── Actions ──────────────────────────────────────────────────────────────────

    /** 
     * @backend-swap Substitua o corpo desta função para trocar de provedor de auth.
     * A assinatura (email, password) → Promise<void> não muda.
     */
    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * @backend-swap Substitua o corpo desta função para trocar de provedor de auth.
     */
    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao sair.');
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    // ── Value ─────────────────────────────────────────────────────────────────────

    const value: AuthContextValue = {
        session,
        user: session?.user ?? null,
        loading,
        error,
        login,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

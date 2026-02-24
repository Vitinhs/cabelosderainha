import React, { createContext, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Planos disponíveis no sistema, em ordem crescente de acesso. */
export type SubscriptionPlan = 'free' | 'premium' | 'vip';

export interface SubscriptionState {
    /** Plano atual do usuário. Default: 'free'. */
    plan: SubscriptionPlan;
    /** Carregando dados de assinatura do backend */
    loading: boolean;
    /** Erro na última operação de assinatura */
    error: string | null;
}

export interface SubscriptionHelpers {
    /** true se o plano for 'premium' ou 'vip' */
    isPremium: boolean;
    /** true somente se o plano for 'vip' */
    isVIP: boolean;
}

export interface SubscriptionActions {
    /**
     * Atualiza o plano do usuário localmente.
     * Chame após confirmar o pagamento no backend.
     *
     * @backend-swap Envolva esta função com a chamada ao seu gateway de pagamento
     * antes de persistir o plano localmente.
     */
    updatePlan: (plan: SubscriptionPlan) => void;
    /** Reseta o plano para 'free' (ex: ao fazer logout) */
    resetPlan: () => void;
    /** Limpa o erro atual */
    clearError: () => void;
}

export type SubscriptionContextValue = SubscriptionState & SubscriptionHelpers & SubscriptionActions;

// ─── Context ──────────────────────────────────────────────────────────────────

export const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plan, setPlan] = useState<SubscriptionPlan>('free');
    const [loading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ── Helpers ───────────────────────────────────────────────────────────────────

    const isPremium: boolean = plan === 'premium' || plan === 'vip';
    const isVIP: boolean = plan === 'vip';

    // ── Actions ───────────────────────────────────────────────────────────────────

    const updatePlan = useCallback((newPlan: SubscriptionPlan) => {
        setError(null);
        setPlan(newPlan);
    }, []);

    const resetPlan = useCallback(() => {
        setError(null);
        setPlan('free');
    }, []);

    const clearError = useCallback(() => setError(null), []);

    // ── Value ─────────────────────────────────────────────────────────────────────

    const value: SubscriptionContextValue = {
        plan,
        loading,
        error,
        isPremium,
        isVIP,
        updatePlan,
        resetPlan,
        clearError,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

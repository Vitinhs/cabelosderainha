import React from 'react';
import { useSubscription } from '../subscription/useSubscription';
import { SubscriptionPlan } from '../subscription/SubscriptionContext';
import { EmptyState } from '@/components/ui/states';

// ─── Plan hierarchy ───────────────────────────────────────────────────────────

/** Hierarquia de acesso: quanto maior o índice, maior o nível de acesso. */
const PLAN_LEVEL: Record<SubscriptionPlan, number> = {
    free: 0,
    premium: 1,
    vip: 2,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanGuardProps {
    /** Plano mínimo necessário para renderizar os children */
    requiredPlan: SubscriptionPlan;
    /** Conteúdo protegido — renderizado apenas com plano suficiente */
    children: React.ReactNode;
    /** Título exibido na tela de upgrade. Default: 'Plano insuficiente' */
    upgradeTitle?: string;
    /** Descrição exibida na tela de upgrade */
    upgradeDescription?: string;
    /** Rótulo do botão de upgrade opcional */
    upgradeActionLabel?: string;
    /** Handler do botão de upgrade */
    onUpgrade?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Protege funcionalidades que exigem um plano específico.
 *
 * Fluxo:
 *  1. plano do usuário >= requiredPlan → renderiza children
 *  2. plano insuficiente → exibe <EmptyState> de upgrade
 *
 * @example
 * <PlanGuard requiredPlan="vip" onUpgrade={() => setPhase('subscription')}>
 *   <VideoVIPSection />
 * </PlanGuard>
 *
 * @example
 * <PlanGuard requiredPlan="premium">
 *   <SmartTip />
 * </PlanGuard>
 */
export const PlanGuard: React.FC<PlanGuardProps> = ({
    requiredPlan,
    children,
    upgradeTitle = 'Plano insuficiente',
    upgradeDescription = 'Faça upgrade para acessar este conteúdo exclusivo.',
    upgradeActionLabel,
    onUpgrade,
}) => {
    const { plan } = useSubscription();

    const hasAccess = PLAN_LEVEL[plan as SubscriptionPlan] >= PLAN_LEVEL[requiredPlan];

    // ── Acesso negado ─────────────────────────────────────────────────────────────
    if (!hasAccess) {
        const planLabel = requiredPlan === 'vip' ? 'VIP' : 'Premium';

        return (
            <EmptyState
                icon="🔒"
                title={upgradeTitle}
                description={
                    upgradeDescription ||
                    `Este conteúdo requer o plano ${planLabel}. Faça upgrade para desbloquear.`
                }
                actionLabel={upgradeActionLabel}
                onAction={onUpgrade}
            />
        );
    }

    // ── Acesso concedido ──────────────────────────────────────────────────────────
    return <>{children}</>;
};

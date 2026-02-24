import { useContext } from 'react';
import { SubscriptionContext, SubscriptionContextValue } from './SubscriptionContext';

/**
 * Acessa o contexto global de assinatura.
 *
 * @throws {Error} Se usado fora de um <SubscriptionProvider>.
 *
 * @example
 * const { plan, isPremium, isVIP, updatePlan } = useSubscription();
 */
export function useSubscription(): SubscriptionContextValue {
    const context = useContext(SubscriptionContext);

    if (context === undefined) {
        throw new Error(
            '[useSubscription] O hook deve ser usado dentro de um <SubscriptionProvider>. ' +
            'Verifique se o provider foi adicionado ao topo da árvore de componentes.'
        );
    }

    return context;
}

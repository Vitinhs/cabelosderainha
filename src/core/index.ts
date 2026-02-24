/**
 * Auth — Contexto e hooks de autenticação global
 *
 * @example
 * import { AuthProvider, useAuth } from 'src/core/auth'
 * import { SubscriptionProvider, useSubscription } from 'src/core/subscription'
 * // ou via barrel global:
 * import { AuthProvider, useAuth, SubscriptionProvider, useSubscription } from 'src/core'
 */

export { AuthContext, AuthProvider } from './auth/AuthContext';
export type { AuthContextValue, AuthState, AuthActions } from './auth/AuthContext';
export { useAuth } from './auth/useAuth';

export { SubscriptionContext, SubscriptionProvider } from './subscription/SubscriptionContext';
export type {
    SubscriptionContextValue,
    SubscriptionState,
    SubscriptionActions,
    SubscriptionHelpers,
    SubscriptionPlan,
} from './subscription/SubscriptionContext';
export { useSubscription } from './subscription/useSubscription';

// Proteção de rotas e features
export { PrivateRoute } from './routing/PrivateRoute';
export { PlanGuard } from './routing/PlanGuard';

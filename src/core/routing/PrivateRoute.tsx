import React from 'react';
import { useAuth } from '../auth/useAuth';
import { LoadingState } from '../../components/ui/states/LoadingState';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrivateRouteProps {
    /** Conteúdo protegido — renderizado apenas quando autenticado */
    children: React.ReactNode;
    /**
     * Chamado quando o usuário não está autenticado.
     *
     * - Com React Router: use `() => navigate('/login')`
     * - Sem React Router (modelo atual de estado): use `() => setPhase('auth')`
     *
     * @backend-swap Substitua por navigate('/login') ao adicionar React Router.
     */
    onRedirect: () => void;
    /** Rótulo opcional exibido no LoadingState. Default: 'Verificando sessão...' */
    loadingLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Protege rotas/áreas que exigem autenticação.
 *
 * Fluxo:
 *  1. loading  → exibe <LoadingState />
 *  2. sem user → chama onRedirect() e renderiza null
 *  3. autenticado → renderiza children
 *
 * @example
 * <PrivateRoute onRedirect={() => setPhase('auth')}>
 *   <DashboardView />
 * </PrivateRoute>
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    onRedirect,
    loadingLabel = 'Verificando sessão...',
}) => {
    const { user, loading } = useAuth();

    // ── 1. Sessão ainda sendo verificada ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="py-6 pb-28">
                <LoadingState showAvatar lines={3} label={loadingLabel} />
            </div>
        );
    }

    // ── 2. Não autenticado → redireciona ─────────────────────────────────────────
    if (!user) {
        // Executar na próxima tick para evitar atualização de estado durante render
        Promise.resolve().then(onRedirect);
        return null;
    }

    // ── 3. Autenticado → renderiza conteúdo ──────────────────────────────────────
    return <>{children}</>;
};

import { useContext } from 'react';
import { AuthContext, AuthContextValue } from './AuthContext';

/**
 * Acessa o contexto global de autenticação.
 *
 * @throws {Error} Se usado fora de um <AuthProvider>.
 *
 * @example
 * const { user, login, logout, loading, error } = useAuth();
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            '[useAuth] O hook deve ser usado dentro de um <AuthProvider>. ' +
            'Verifique se o provider foi adicionado ao topo da árvore de componentes.'
        );
    }

    return context;
}

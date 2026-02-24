import React from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

interface ErrorStateProps {
    /** Título exibido no card de erro. Default: 'Algo deu errado' */
    title?: string;
    /** Mensagem de erro detalhada */
    message?: string;
    /** Rótulo do botão de retry. Default: 'Tentar novamente' */
    retryLabel?: string;
    /** Handler do botão de retry */
    onRetry?: () => void;
    /** Adiciona className extra ao Card container */
    className?: string;
}

/**
 * Estado de erro reutilizável.
 * Usa exclusivamente tokens semânticos do Design System.
 * Compatível com dark mode via CSS variables.
 */
export function ErrorState({
    title = 'Algo deu errado',
    message,
    retryLabel = 'Tentar novamente',
    onRetry,
    className = '',
}: ErrorStateProps) {
    return (
        <Card
            variant="flat"
            className={`py-10 flex flex-col items-center text-center space-y-5 ${className}`}
        // Override Card border to use error token
        >
            {/* Inner wrapper with error-tinted surface */}
            <div
                className="w-full flex flex-col items-center space-y-5 rounded-xl p-6"
                style={{
                    background: 'var(--color-status-error-bg)',
                    border: '1px solid var(--color-status-error-text)',
                }}
                role="alert"
                aria-live="assertive"
            >
                {/* Error icon */}
                <div
                    className="flex items-center justify-center text-3xl"
                    style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'var(--color-surface-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-status-error-text)',
                    }}
                    aria-hidden="true"
                >
                    ⚠️
                </div>

                {/* Badge */}
                <Badge variant="error">Erro</Badge>

                {/* Text content */}
                <div className="space-y-2 max-w-xs">
                    <h3
                        className="text-xl font-bold"
                        style={{
                            fontFamily: 'var(--font-family-serif)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {title}
                    </h3>
                    {message && (
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--color-status-error-text)' }}
                        >
                            {message}
                        </p>
                    )}
                </div>

                {/* Retry button */}
                {onRetry && (
                    <div style={{ width: '100%', maxWidth: '16rem' }}>
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onRetry}
                            style={{
                                borderColor: 'var(--color-status-error-text)',
                                color: 'var(--color-status-error-text)',
                            }}
                        >
                            {retryLabel}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}

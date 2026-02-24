import React from 'react';
import { Card } from '../Card';

interface LoadingStateProps {
    /** Número de linhas skeleton a exibir. Default: 3 */
    lines?: number;
    /** Mostrar bloco de avatar/ícone no topo. Default: false */
    showAvatar?: boolean;
    /** Texto exibido abaixo do skeleton. Default: 'Carregando...' */
    label?: string;
    /** Adiciona className extra ao Card container */
    className?: string;
}

/**
 * Estado de carregamento reutilizável.
 * Usa exclusivamente tokens semânticos do Design System.
 * Compatível com dark mode via CSS variables.
 */
export function LoadingState({
    lines = 3,
    showAvatar = false,
    label = 'Carregando...',
    className = '',
}: LoadingStateProps) {
    return (
        <Card variant="flat" className={`space-y-4 ${className}`}>
            <div
                role="status"
                aria-label={label}
                aria-busy="true"
                aria-live="polite"
                className="space-y-4"
            >
                {/* Optional avatar / icon skeleton */}
                {showAvatar && (
                    <div className="flex items-center gap-4">
                        <div
                            className="skeleton flex-shrink-0"
                            style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: 'var(--radius-md)',
                            }}
                        />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 rounded-sm" style={{ width: '55%' }} />
                            <div className="skeleton h-3 rounded-sm" style={{ width: '40%' }} />
                        </div>
                    </div>
                )}

                {/* Skeleton lines */}
                <div className="space-y-3">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className="skeleton h-4 rounded-sm"
                            style={{
                                width: i === lines - 1 ? '65%' : '100%',
                            }}
                        />
                    ))}
                </div>

                {/* Label */}
                {label && (
                    <p
                        className="text-label text-center"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {label}
                    </p>
                )}
            </div>
        </Card>
    );
}

import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';

interface EmptyStateProps {
    /** Emoji ou ícone decorativo exibido no topo */
    icon?: string;
    /** Título principal */
    title: string;
    /** Descrição explicativa opcional */
    description?: string;
    /** Rótulo do botão de ação opcional */
    actionLabel?: string;
    /** Handler do botão de ação */
    onAction?: () => void;
    /** Adiciona className extra ao Card container */
    className?: string;
}

/**
 * Estado vazio reutilizável.
 * Usa exclusivamente tokens semânticos do Design System.
 * Compatível com dark mode via CSS variables.
 */
export function EmptyState({
    icon = '📭',
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}: EmptyStateProps) {
    return (
        <Card variant="flat" className={`py-10 flex flex-col items-center text-center space-y-4 ${className}`}>
            {/* Decorative icon in a token-styled container */}
            <div
                className="flex items-center justify-center text-4xl"
                style={{
                    width: '5rem',
                    height: '5rem',
                    background: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border-default)',
                }}
                aria-hidden="true"
            >
                {icon}
            </div>

            {/* Text content */}
            <div className="space-y-1.5 max-w-xs">
                <h3
                    className="text-2xl font-bold"
                    style={{
                        fontFamily: 'var(--font-family-serif)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.25,
                    }}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Optional CTA */}
            {actionLabel && onAction && (
                <div style={{ width: '100%', maxWidth: '16rem' }}>
                    <Button variant="primary" size="md" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            )}
        </Card>
    );
}

import React from 'react';

type BadgeVariant = 'brand' | 'premium' | 'success' | 'error' | 'warn';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    icon?: string;
    className?: string;
}

export function Badge({ variant = 'brand', children, icon, className = '' }: BadgeProps) {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
}

import React from 'react';

type CardVariant = 'default' | 'flat' | 'brand' | 'subtle';

interface CardProps {
    variant?: CardVariant;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const variantMap: Record<CardVariant, string> = {
    default: 'card',
    flat: 'card-flat',
    brand: 'card-brand',
    subtle: 'card-subtle',
};

export function Card({ variant = 'default', children, className = '', onClick }: CardProps) {
    return (
        <div
            className={`${variantMap[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

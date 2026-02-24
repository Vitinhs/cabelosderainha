import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'strong' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-3 px-5',
    lg: 'text-base py-4 px-6',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = `btn-${variant}`;

    return (
        <button
            className={`${baseClass} ${sizeStyles[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Aguarde...</span>
                </>
            ) : (
                <>
                    {icon && <span className="shrink-0">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`input ${error ? 'border-[var(--color-action-danger)] focus:ring-red-200' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-[var(--color-status-error-text)] text-xs font-medium">{error}</p>
            )}
            {hint && !error && (
                <p className="text-[var(--color-text-muted)] text-xs">{hint}</p>
            )}
        </div>
    );
}

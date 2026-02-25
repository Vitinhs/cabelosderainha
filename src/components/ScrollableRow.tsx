
import React, { useRef } from 'react';

interface ScrollableRowProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Container com scroll horizontal invisível.
 * Sem barra visível — deslize livremente para os lados.
 */
const ScrollableRow: React.FC<ScrollableRowProps> = ({ children, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            className={`flex overflow-x-auto no-scrollbar gap-2 -mx-5 px-5 pb-1 ${className}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {children}
        </div>
    );
};

export default ScrollableRow;

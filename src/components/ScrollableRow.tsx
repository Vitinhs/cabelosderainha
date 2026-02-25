
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScrollableRowProps {
    children: React.ReactNode;
    className?: string;
    /** px adicionados antes e depois da row (para compensar o -mx) */
    px?: number;
}

/**
 * Envolve filhos em um container com scroll horizontal invisível.
 * Exibe uma barra de progresso fina e animada abaixo da row ao deslizar,
 * que some sozinha após 1.2s de inatividade.
 */
const ScrollableRow: React.FC<ScrollableRowProps> = ({ children, className = '', px = 4 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showBar, setShowBar] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        if (max <= 0) return;
        const progress = el.scrollLeft / max;
        setScrollProgress(progress);
        setShowBar(true);

        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowBar(false), 1200);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            el.removeEventListener('scroll', handleScroll);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [handleScroll]);

    return (
        <div className="relative" style={{ marginLeft: `-${px * 4}px`, marginRight: `-${px * 4}px` }}>
            {/* Scroll container */}
            <div
                ref={containerRef}
                className={`flex overflow-x-auto no-scrollbar ${className}`}
                style={{ paddingLeft: `${px * 4}px`, paddingRight: `${px * 4}px`, paddingBottom: '4px' }}
            >
                {children}
            </div>

            {/* Barra de progresso — invisível até deslizar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden"
                style={{
                    paddingLeft: `${px * 4}px`,
                    paddingRight: `${px * 4}px`,
                }}
                aria-hidden="true"
            >
                <div
                    className="h-full w-full relative"
                    style={{ background: 'var(--color-border-subtle)', borderRadius: 9999 }}
                >
                    <motion.div
                        className="absolute top-0 left-0 h-full"
                        animate={{
                            scaleX: showBar ? 1 : 0,
                            opacity: showBar ? 1 : 0,
                            x: `${scrollProgress * 100 * (1 - 0.3)}%`,   // thumb desliza proporcionalmente
                        }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                            width: '30%',
                            background: 'var(--color-action-primary)',
                            borderRadius: 9999,
                            transformOrigin: 'left',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScrollableRow;

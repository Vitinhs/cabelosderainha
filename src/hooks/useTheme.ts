import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Lê preferência salva; fallback para preferência do sistema
        const saved = localStorage.getItem('cr-theme') as Theme | null;
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark');
        } else {
            root.removeAttribute('data-theme');
            root.classList.remove('dark');
        }
        localStorage.setItem('cr-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

    return { theme, toggleTheme, isDark: theme === 'dark' };
}


import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Card } from '@/components/ui';

// ─── Dados das receitas ──────────────────────────────────────────────────────

const RECIPES = [
    {
        id: 1,
        emoji: '🥥',
        name: 'Máscara de Coco e Mel',
        time: '30 min',
        hairTypes: ['Seco', 'Ondulado', 'Cacheado'],
        problems: ['Ressecamento', 'Frizz'],
        goals: ['Hidratação'],
        benefits: 'Hidrata profundamente, sela cutículas e proporciona brilho intenso.',
        ingredients: [
            '2 colheres de sopa de óleo de coco',
            '1 colher de sopa de mel puro',
            '1 ovo caipira',
        ],
        steps: [
            'Misture todos os ingredientes até obter uma pasta homogênea.',
            'Aplique nos fios úmidos do meio às pontas.',
            'Deixe agir por 30 minutos com touca térmica.',
            'Enxágue com água morna e finalize com água fria.',
        ],
        category: 'Hidratação',
    },
    {
        id: 2,
        emoji: '🌿',
        name: 'Tônico de Babosa e Alecrim',
        time: '10 min',
        hairTypes: ['Todos'],
        problems: ['Queda', 'Oleosidade'],
        goals: ['Crescimento'],
        benefits: 'Estimula o crescimento, equilibra o couro cabeludo e fortalece as raízes.',
        ingredients: [
            '3 colheres de gel de babosa puro',
            '1 ramo de alecrim fresco',
            '200ml de água mineral',
        ],
        steps: [
            'Ferva a água com o alecrim por 5 minutos. Coe e deixe esfriar.',
            'Misture o chá com o gel de babosa.',
            'Aplique no couro cabeludo limpo com algodão ou spray.',
            'Massageie por 2 minutos. Não precisa enxaguar.',
        ],
        category: 'Nutrição',
    },
    {
        id: 3,
        emoji: '🍳',
        name: 'Reconstrução com Clara de Ovo',
        time: '20 min',
        hairTypes: ['Danificado', 'Liso', 'Ondulado'],
        problems: ['Pontas Duplas', 'Quebra'],
        goals: ['Crescimento', 'Força'],
        benefits: 'Reconstrói a fibra capilar, elimina pontas duplas e devolve elasticidade.',
        ingredients: [
            '2 claras de ovo',
            '1 colher de azeite de oliva extra virgem',
            '5 gotas de óleo essencial de lavanda',
        ],
        steps: [
            'Bata as claras em neve.',
            'Incorpore o azeite delicadamente.',
            'Aplique nos fios secos ou úmidos.',
            'Deixe agir por 20 minutos. Enxágue bem com água fria.',
        ],
        category: 'Reconstrução',
    },
    {
        id: 4,
        emoji: '🍎',
        name: 'Detox de Vinagre de Maçã',
        time: '5 min',
        hairTypes: ['Todos'],
        problems: ['Oleosidade', 'Caspa'],
        goals: ['Equilíbrio'],
        benefits: 'Remove resíduos de produtos, equilibra o pH e elimina a caspa naturalmente.',
        ingredients: [
            '2 colheres de sopa de vinagre de maçã orgânico',
            '1 copo de água morna',
        ],
        steps: [
            'Dilua o vinagre na água.',
            'Aplique no couro cabeludo após lavar o cabelo.',
            'Massageie delicadamente por 2 minutos.',
            'Enxágue com água fria. Não precisa de condicionador depois.',
        ],
        category: 'Detox',
    },
    {
        id: 5,
        emoji: '🫐',
        name: 'Máscara Antioxidante de Mirtilo',
        time: '25 min',
        hairTypes: ['Cacheado', 'Crespo'],
        problems: ['Ressecamento', 'Frizz'],
        goals: ['Hidratação', 'Brilho'],
        benefits: 'Rica em antioxidantes, revitaliza os fios opacos e intensifica a definição dos cachos.',
        ingredients: [
            '½ xícara de mirtilos frescos ou congelados',
            '2 colheres de iogurte natural integral',
            '1 colher de mel',
        ],
        steps: [
            'Amasse os mirtilos até formar uma polpa.',
            'Misture com o iogurte e o mel.',
            'Aplique do couro cabeludo às pontas.',
            'Deixe agir por 25 minutos e enxágue bem.',
        ],
        category: 'Hidratação',
    },
    {
        id: 6,
        emoji: '🧄',
        name: 'Ampola de Alho Anti-queda',
        time: '40 min',
        hairTypes: ['Todos'],
        problems: ['Queda'],
        goals: ['Crescimento', 'Força'],
        benefits: 'O alho é um dos maiores estimulantes da circulação capilar, reduzindo drasticamente a queda.',
        ingredients: [
            '3 dentes de alho amassados',
            '3 colheres de óleo de coco',
            '3 gotas de óleo essencial de peppermint',
        ],
        steps: [
            'Aqueça levemente o óleo de coco (não pode ferver).',
            'Misture o alho amassado e deixe macerar por 30 minutos.',
            'Coe e adicione as gotas de peppermint.',
            'Aplique na raiz e massageie. Deixe por 40 min com touca e enxágue bem.',
        ],
        category: 'Nutrição',
    },
    {
        id: 7,
        emoji: '🍵',
        name: 'Rinse de Chá Verde',
        time: '10 min',
        hairTypes: ['Oleoso', 'Liso', 'Ondulado'],
        problems: ['Oleosidade', 'Caspa'],
        goals: ['Equilíbrio'],
        benefits: 'Controla a oleosidade, tonifica o couro cabeludo e adiciona suave brilho.',
        ingredients: [
            '2 sachês de chá verde',
            '500ml de água quente',
            '1 colher de sopa de suco de limão',
        ],
        steps: [
            'Prepare o chá e deixe esfriar completamente.',
            'Adicione o suco de limão.',
            'Após lavar o cabelo, aplique o rinse do couro às pontas.',
            'Não enxágue. Deixe secar naturalmente.',
        ],
        category: 'Detox',
    },
    {
        id: 8,
        emoji: '🫚',
        name: 'Selagem com Óleo de Argan',
        time: '5 min',
        hairTypes: ['Todos'],
        problems: ['Frizz', 'Pontas Duplas'],
        goals: ['Brilho', 'Hidratação'],
        benefits: 'Sela as cutículas abertas, combate o frizz e protege contra o calor e humidade.',
        ingredients: [
            '3-4 gotas de óleo de argan puro',
            '1 borrifador com água',
        ],
        steps: [
            'Borrife água nos fios levemente úmidos.',
            'Aplique as gotas de argan espalhando nas palmas.',
            'Distribua pelos fios com movimentos suaves.',
            'Não enxágue. Finalize normalmente.',
        ],
        category: 'Nutrição',
    },
];

const HAIR_TYPES = ['Todos', 'Liso', 'Ondulado', 'Cacheado', 'Crespo', 'Seco', 'Oleoso', 'Danificado'];
const PROBLEMS = ['Todos', 'Frizz', 'Queda', 'Oleosidade', 'Ressecamento', 'Caspa', 'Pontas Duplas', 'Quebra'];
const GOALS = ['Todos', 'Hidratação', 'Crescimento', 'Força', 'Brilho', 'Equilíbrio'];

const CATEGORY_COLORS: Record<string, string> = {
    Hidratação: 'var(--color-status-info-text)',
    Nutrição: 'var(--color-text-accent)',
    Reconstrução: 'var(--color-status-error-text)',
    Detox: 'var(--color-status-success-text)',
};

// ─── Chip de filtro ──────────────────────────────────────────────────────────
const Chip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150"
        style={{
            background: active ? 'var(--color-action-primary)' : 'var(--color-surface-subtle)',
            color: active ? 'white' : 'var(--color-text-secondary)',
            border: active ? 'none' : '1px solid var(--color-border-default)',
        }}
    >
        {label}
    </button>
);

// ─── Card de receita ─────────────────────────────────────────────────────────
const RecipeCard: React.FC<{ recipe: typeof RECIPES[0]; onClick: () => void }> = ({ recipe, onClick }) => (
    <motion.button
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="w-full text-left p-5 rounded-2xl border transition-all duration-150"
        style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-border-subtle)',
            boxShadow: 'var(--shadow-card)',
        }}
    >
        <div className="flex items-start gap-4">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--color-surface-brand)' }}
            >
                {recipe.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                    {recipe.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    ⏱ {recipe.time} · {recipe.category}
                </p>
                <p className="text-xs mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {recipe.benefits}
                </p>
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
            {recipe.problems.map(p => (
                <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text-muted)' }}>
                    {p}
                </span>
            ))}
        </div>
    </motion.button>
);

// ─── Modal de detalhes ───────────────────────────────────────────────────────
const RecipeModal: React.FC<{ recipe: typeof RECIPES[0]; onClose: () => void }> = ({ recipe, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end px-4 pb-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
    >
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md mx-auto rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar"
            style={{ background: 'var(--color-surface-card)' }}
        >
            {/* Header */}
            <div className="p-6 pb-4" style={{ background: 'var(--color-surface-brand)' }}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{recipe.emoji}</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-brand)' }}>
                                {recipe.category}
                            </p>
                            <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                                {recipe.name}
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>⏱ {recipe.time}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-surface-subtle)', color: 'var(--color-text-muted)' }}>
                        ✕
                    </button>
                </div>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {recipe.benefits}
                </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
                {/* Ingredientes */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-brand)' }}>
                        🌿 Ingredientes
                    </h3>
                    <ul className="space-y-2">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-action-primary)' }} />
                                {ing}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Modo de preparo */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-brand)' }}>
                        📋 Modo de Preparo
                    </h3>
                    <ol className="space-y-3">
                        {recipe.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'var(--color-action-primary)', color: 'white' }}>
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Tags */}
                <section className="flex flex-wrap gap-2">
                    {recipe.hairTypes.map(t => (
                        <Badge key={t} variant="brand">{t}</Badge>
                    ))}
                    {recipe.goals.map(g => (
                        <Badge key={g} variant="success">{g}</Badge>
                    ))}
                </section>
            </div>
        </motion.div>
    </motion.div>
);

// ─── View principal ──────────────────────────────────────────────────────────
const RecipesView: React.FC = () => {
    const [filterHair, setFilterHair] = useState('Todos');
    const [filterProblem, setFilterProblem] = useState('Todos');
    const [filterGoal, setFilterGoal] = useState('Todos');
    const [selected, setSelected] = useState<typeof RECIPES[0] | null>(null);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return RECIPES.filter(r => {
            if (filterHair !== 'Todos' && !r.hairTypes.includes(filterHair) && !r.hairTypes.includes('Todos')) return false;
            if (filterProblem !== 'Todos' && !r.problems.includes(filterProblem)) return false;
            if (filterGoal !== 'Todos' && !r.goals.includes(filterGoal)) return false;
            if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [filterHair, filterProblem, filterGoal, search]);

    return (
        <div className="py-5 space-y-5 pb-28">
            {/* Header */}
            <header className="space-y-1">
                <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>📖 Receitas Naturais</h2>
                <p className="text-label">Biblioteca viva de tratamentos para seus fios.</p>
            </header>

            {/* Busca */}
            <input
                type="search"
                placeholder="Buscar receita..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border"
                style={{
                    background: 'var(--color-surface-card)',
                    borderColor: 'var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                }}
            />

            {/* Filtros */}
            <div className="space-y-3">
                <div>
                    <p className="text-label mb-2">Tipo de Cabelo</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {HAIR_TYPES.map(h => (
                            <Chip key={h} label={h} active={filterHair === h} onClick={() => setFilterHair(h)} />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-label mb-2">Problema</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {PROBLEMS.map(p => (
                            <Chip key={p} label={p} active={filterProblem === p} onClick={() => setFilterProblem(p)} />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-label mb-2">Objetivo</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {GOALS.map(g => (
                            <Chip key={g} label={g} active={filterGoal === g} onClick={() => setFilterGoal(g)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Resultado */}
            <div className="space-y-3">
                <p className="text-label">{filtered.length} receita{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                            <p className="text-2xl">🌿</p>
                            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Nenhuma receita com esses filtros.</p>
                        </motion.div>
                    ) : (
                        filtered.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelected(recipe)} />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default RecipesView;

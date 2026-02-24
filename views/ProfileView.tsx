
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { NotificationService } from '../src/services/notificationService';
import { Button, Badge, Card } from '../src/components/ui';
import { LoadingState, ErrorState } from '../src/components/ui/states';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProfileViewProps {
    session: any;
    isSubscriber?: boolean;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

// ─── SettingRow sub-component ─────────────────────────────────────────────────
interface SettingRowProps {
    icon: string;
    /** Must be a CSS variable reference, e.g. 'var(--color-surface-subtle)' */
    iconBg: string;
    title: string;
    subtitle: string;
    action: React.ReactNode;
    divider?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
    icon, iconBg, title, subtitle, action, divider = true,
}) => (
    <div
        className="p-5 flex items-center justify-between gap-4 transition-colors"
        style={divider ? { borderBottom: '1px solid var(--color-border-subtle)' } : undefined}
    >
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: iconBg, borderRadius: 'var(--radius-md)' }}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {title}
                </p>
                <p className="text-label mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="flex-shrink-0">{action}</div>
    </div>
);

// ─── Toggle switch ─────────────────────────────────────────────────────────────
interface ToggleSwitchProps {
    enabled: boolean;
    onToggle: () => void;
    ariaLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, ariaLabel }) => (
    <button
        role="switch"
        aria-checked={enabled}
        aria-label={ariaLabel}
        onClick={onToggle}
        className="w-14 h-7 rounded-full relative flex-shrink-0 border-0"
        style={{
            background: enabled ? 'var(--color-action-primary)' : 'var(--color-border-default)',
            boxShadow: enabled ? 'var(--shadow-card)' : 'none',
            transition: `background var(--duration-normal) var(--ease-smooth),
                         box-shadow var(--duration-normal) var(--ease-smooth)`,
            cursor: 'pointer',
        }}
    >
        <motion.div
            className="absolute top-1 w-5 h-5 rounded-full"
            layout
            animate={{ left: enabled ? '1.75rem' : '0.25rem' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            style={{
                background: 'var(--color-surface-card)',
                boxShadow: 'var(--shadow-card)',
            }}
        />
    </button>
);

// ─── Main component ────────────────────────────────────────────────────────────
const ProfileView: React.FC<ProfileViewProps> = ({
    session,
    isSubscriber,
    loading = false,
    error = null,
    onRetry,
}) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [showPWAGuide, setShowPWAGuide] = useState(false);
    const [isTestLoading, setIsTestLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const toggleNotifications = async () => {
        const granted = await NotificationService.requestPermission();
        setNotificationsEnabled(granted);
        if (!granted && Notification.permission === 'denied') {
            alert('As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.');
        }
    };

    const handleTestNotification = async () => {
        setIsTestLoading(true);
        await NotificationService.sendInstant(
            'Oi, Rainha! 👑',
            'Este é um teste do seu cronograma capilar. Seus fios agradecem o cuidado!'
        );
        setTimeout(() => setIsTestLoading(false), 1000);
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const userName = session?.user?.email?.split('@')[0] ?? 'Rainha';
    const userInitial = session?.user?.email?.charAt(0).toUpperCase() ?? '?';

    /* ── Guard states ── */
    if (loading) {
        return (
            <div className="py-6 space-y-7 pb-28 max-w-lg mx-auto">
                <LoadingState showAvatar lines={3} label="Carregando seu perfil..." />
                <LoadingState lines={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6 pb-28 max-w-lg mx-auto">
                <ErrorState
                    title="Erro ao carregar perfil"
                    message={error}
                    onRetry={onRetry}
                />
            </div>
        );
    }

    return (
        <div className="py-6 space-y-7 pb-28 max-w-lg mx-auto">

            {/* ── Header ── */}
            <header className="text-center md:text-left space-y-1">
                <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>
                    Sua Conta
                </h2>
                <p className="text-label">Gerencie seu perfil e preferências.</p>
            </header>

            {/* ── Perfil card ── */}
            <Card variant="flat" className="flex flex-col items-center md:flex-row gap-5">
                {/* Avatar */}
                <div
                    className="w-20 h-20 flex items-center justify-center text-3xl font-bold flex-shrink-0"
                    style={{
                        background: 'var(--color-surface-brand)',
                        color: 'var(--color-text-brand)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-brand)',
                    }}
                    aria-label={`Inicial do usuário: ${userInitial}`}
                >
                    {userInitial}
                </div>

                {/* User info */}
                <div className="text-center md:text-left space-y-1">
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {userName}
                    </p>
                    <p className="text-label">{session?.user?.email}</p>

                    {/* Plan badge */}
                    <div className="mt-2 flex justify-center md:justify-start gap-2">
                        {isSubscriber ? (
                            <Badge variant="premium" icon="✨">Membro VIP</Badge>
                        ) : (
                            <Badge variant="brand">Plano Gratuito</Badge>
                        )}
                    </div>
                </div>
            </Card>

            {/* ── Preferências ── */}
            <section className="space-y-2">
                <p
                    className="text-label px-1"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}
                >
                    Preferências do App
                </p>

                <Card variant="flat" className="p-0 overflow-hidden">
                    {/* Notificações */}
                    <SettingRow
                        icon="🔔"
                        iconBg="var(--color-surface-subtle)"
                        title="Lembretes Diários"
                        subtitle="Notificações para suas rotinas."
                        action={
                            <ToggleSwitch
                                enabled={notificationsEnabled}
                                onToggle={toggleNotifications}
                                ariaLabel="Ativar ou desativar lembretes diários"
                            />
                        }
                    />

                    {/* Testar Notificação */}
                    <AnimatePresence>
                        {notificationsEnabled && (
                            <motion.div
                                key="test-row"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <SettingRow
                                    icon="✨"
                                    iconBg="var(--color-status-warn-bg)"
                                    title="Testar Lembrete"
                                    subtitle="Verifique se as notificações estão chegando."
                                    action={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            loading={isTestLoading}
                                            onClick={handleTestNotification}
                                            style={{
                                                background: 'var(--color-status-warn-bg)',
                                                color: 'var(--color-status-warn-text)',
                                                border: '1px solid var(--color-status-warn-text)',
                                                width: 'auto',
                                            }}
                                        >
                                            Testar
                                        </Button>
                                    }
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Guia iOS / PWA */}
                    {isIOS && (
                        <div style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <button
                                onClick={() => setShowPWAGuide(!showPWAGuide)}
                                aria-expanded={showPWAGuide}
                                aria-label="Dificuldade com lembretes no iPhone"
                                className="w-full p-5 flex items-center justify-between gap-4 transition-colors"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                                        style={{
                                            background: 'var(--color-surface-subtle)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        📱
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                            Dificuldade no iPhone?
                                        </p>
                                        <p className="text-label">Saiba como ativar lembretes no iOS.</p>
                                    </div>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 flex-shrink-0"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    aria-hidden="true"
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        transform: showPWAGuide ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: `transform var(--duration-normal) var(--ease-smooth)`,
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {showPWAGuide && (
                                    <motion.div
                                        key="pwa-guide"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div
                                            className="mx-5 mb-5 p-5 space-y-4"
                                            style={{
                                                background: 'var(--color-surface-subtle)',
                                                border: '1px solid var(--color-border-default)',
                                                borderRadius: 'var(--radius-lg)',
                                            }}
                                        >
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                                No iPhone, a Apple exige que o app seja adicionado à tela de início para ativar notificações:
                                            </p>
                                            <ol className="text-xs space-y-2 list-decimal ml-4" style={{ color: 'var(--color-text-secondary)' }}>
                                                <li>Toque no botão <strong>Compartilhar</strong> em baixo.</li>
                                                <li>Selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                                                <li>Abra o app novo e habilite os lembretes novamente aqui.</li>
                                            </ol>
                                            <div
                                                className="flex items-center gap-2 text-xs font-bold p-3"
                                                style={{
                                                    background: 'var(--color-surface-card)',
                                                    color: 'var(--color-text-brand)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-border-brand)',
                                                }}
                                            >
                                                <span role="img" aria-label="Dica">💡</span>
                                                <span>Isso garantirá que seu plano nunca falhe.</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Suporte */}
                    <a
                        href="mailto:suporte@cabelosderainha.com"
                        aria-label="Abrir suporte VIP por e-mail"
                        className="w-full p-5 flex items-center gap-4 transition-colors"
                        style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
                    >
                        <div
                            className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: 'var(--color-surface-brand)', borderRadius: 'var(--radius-md)' }}
                        >
                            💬
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                Suporte VIP Especializado
                            </p>
                            <p className="text-label">Estamos aqui para tirar todas as suas dúvidas.</p>
                        </div>
                    </a>
                </Card>
            </section>

            {/* ── Logout ── */}
            <div className="pt-2 space-y-4">
                <Button
                    variant="secondary"
                    onClick={() => supabase.auth.signOut()}
                    style={{
                        color: 'var(--color-status-error-text)',
                        background: 'var(--color-status-error-bg)',
                        borderColor: 'var(--color-status-error-text)',
                    }}
                >
                    Sair da Conta
                </Button>
                <p className="text-center text-label" style={{ fontSize: '0.65rem' }}>
                    Cabelos de Rainha AI — Versão 2.1.0 Premium
                </p>
            </div>
        </div>
    );
};

export default ProfileView;

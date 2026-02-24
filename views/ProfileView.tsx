
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { NotificationService } from '../src/services/notificationService';
import { Button, Badge } from '../src/components/ui';

interface ProfileViewProps {
    session: any;
    isSubscriber?: boolean;
}

interface SettingRowProps {
    icon: string;
    iconBg: string;
    title: string;
    subtitle: string;
    action: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, iconBg, title, subtitle, action }) => (
    <div
        className="p-5 flex items-center justify-between gap-4 transition-colors"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
    >
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: iconBg }}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                <p className="text-label mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="flex-shrink-0">{action}</div>
    </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ session, isSubscriber }) => {
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

    return (
        <div className="py-6 space-y-7 pb-28 max-w-lg mx-auto">

            {/* ── Header ── */}
            <header className="text-center md:text-left space-y-1">
                <h2 className="text-section-title" style={{ fontStyle: 'italic' }}>Sua Conta</h2>
                <p className="text-label">Gerencie seu perfil e preferências.</p>
            </header>

            {/* ── Perfil ── */}
            <section className="card-flat flex flex-col items-center md:flex-row gap-5" style={{ cursor: 'default' }}>
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
                    style={{
                        background: 'var(--color-surface-brand)',
                        color: 'var(--color-text-brand)',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.07)',
                    }}
                >
                    {userInitial}
                </div>
                <div className="text-center md:text-left space-y-1">
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {userName}
                    </p>
                    <p className="text-label">{session?.user?.email}</p>
                    {isSubscriber && (
                        <div className="mt-2 inline-block">
                            <Badge variant="premium" icon="✨">Membro VIP</Badge>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Preferências ── */}
            <section className="space-y-2">
                <p
                    className="text-label px-1"
                    style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                >
                    Preferências do App
                </p>
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--color-surface-card)',
                        border: '1px solid var(--color-border-subtle)',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    {/* Toggle de Notificações */}
                    <SettingRow
                        icon="🔔"
                        iconBg="var(--color-surface-subtle)"
                        title="Lembretes Diários"
                        subtitle="Notificações para suas rotinas."
                        action={
                            <button
                                onClick={toggleNotifications}
                                className="w-14 h-7 rounded-full transition-all duration-300 relative flex-shrink-0"
                                style={{
                                    background: notificationsEnabled ? 'var(--color-action-primary)' : 'var(--color-border-default)',
                                    boxShadow: notificationsEnabled ? 'var(--shadow-sm)' : 'none',
                                }}
                            >
                                <div
                                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300"
                                    style={{ left: notificationsEnabled ? '1.75rem' : '0.25rem' }}
                                />
                            </button>
                        }
                    />

                    {/* Testar Notificação */}
                    {notificationsEnabled && (
                        <SettingRow
                            icon="✨"
                            iconBg="var(--color-status-warn-bg)"
                            title="Testar Lembrete"
                            subtitle="Verifique se as notificações estão chegando."
                            action={
                                <button
                                    onClick={handleTestNotification}
                                    disabled={isTestLoading}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50"
                                    style={{
                                        background: 'var(--color-status-warn-bg)',
                                        color: 'var(--color-status-warn-text)',
                                    }}
                                >
                                    {isTestLoading ? 'Enviando...' : 'Testar'}
                                </button>
                            }
                        />
                    )}

                    {/* Guia iOS / PWA */}
                    {isIOS && (
                        <div style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <button
                                onClick={() => setShowPWAGuide(!showPWAGuide)}
                                className="w-full p-5 flex items-center justify-between gap-4 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                                        style={{ background: 'var(--color-surface-subtle)' }}>
                                        📱
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                            Dificuldade no iPhone?
                                        </p>
                                        <p className="text-label">Saiba como ativar lembretes no iOS.</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 transition-transform ${showPWAGuide ? 'rotate-90' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {showPWAGuide && (
                                <div
                                    className="mx-5 mb-5 p-5 rounded-2xl space-y-4"
                                    style={{
                                        background: 'var(--color-surface-subtle)',
                                        border: '1px solid var(--color-border-subtle)',
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
                                    <div className="flex items-center gap-2 text-xs font-bold p-2 rounded-xl"
                                        style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-brand)' }}>
                                        <span>💡</span>
                                        <span>Isso garantirá que seu plano nunca falhe.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suporte */}
                    <button className="w-full p-5 flex items-center gap-4 transition-colors">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                            style={{ background: 'var(--color-surface-brand)' }}>
                            💬
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                Suporte VIP Especializado
                            </p>
                            <p className="text-label">Estamos aqui para tirar todas as suas dúvidas.</p>
                        </div>
                    </button>
                </div>
            </section>

            {/* ── Logout ── */}
            <div className="pt-2 space-y-4">
                <Button
                    variant="ghost"
                    onClick={() => supabase.auth.signOut()}
                    style={{
                        color: 'var(--color-status-error-text)',
                        background: 'var(--color-status-error-bg)',
                        border: '1px solid rgba(220,38,38,0.15)',
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


import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface ProfileViewProps {
    session: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [showPWAGuide, setShowPWAGuide] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const toggleNotifications = async () => {
        if (!('Notification' in window)) {
            alert("Seu navegador não suporta notificações.");
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        } else if (Notification.permission === 'denied') {
            alert("As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.");
            setNotificationsEnabled(false);
        } else {
            // Already granted or we want to toggle conceptually
            // In a real app we might unsubscribe/subscribe to push service here
            // For now, we'll just toggle the local state to show it's "active"
            setNotificationsEnabled(!notificationsEnabled);
        }
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return (
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2">
                <h2 className="text-2xl font-bold text-[#2d4a22]">Sua Conta</h2>
                <p className="text-sm text-gray-500">Gerencie seu perfil e preferências.</p>
            </header>

            {/* Profile Info */}
            <section className="bg-white rounded-3xl p-6 border border-emerald-50 shadow-sm flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#2d4a22] text-2xl font-bold">
                    {session?.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-[#2d4a22]">{session?.user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
            </section>

            {/* Settings */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Configurações</h3>

                <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                    {/* Notifications Toggle */}
                    <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 text-lg">🔔</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Lembretes Diários</p>
                                <p className="text-[10px] text-gray-400">Notificações para suas rotinas.</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleNotifications}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-[#2d4a22]' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* iOS / PWA Help */}
                    {isIOS && (
                        <button
                            onClick={() => setShowPWAGuide(!showPWAGuide)}
                            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-3 text-left">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 text-lg">📱</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Dificuldade com Lembretes?</p>
                                    <p className="text-[10px] text-gray-400">Saiba como ativar no iPhone.</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 transition-transform ${showPWAGuide ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {showPWAGuide && (
                        <div className="p-5 bg-purple-50/50 space-y-3">
                            <p className="text-[11px] text-purple-800 leading-relaxed">
                                No iPhone, as notificações funcionam melhor se você adicionar o app à sua tela de início:
                            </p>
                            <ol className="text-[10px] text-purple-700/80 space-y-1 list-decimal ml-4">
                                <li>Clique no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta no Safari).</li>
                                <li>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                                <li>Abra o app pela tela de início e ative os lembretes novamente.</li>
                            </ol>
                        </div>
                    )}

                    {/* Support */}
                    <button className="w-full p-5 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-emerald-50 rounded-xl text-[#2d4a22] text-lg">💬</div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">Suporte VIP</p>
                            <p className="text-[10px] text-gray-400">Fale com nossos consultores.</p>
                        </div>
                    </button>
                </div>
            </section>

            {/* Logout */}
            <div className="pt-4">
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors"
                >
                    Sair da Conta
                </button>
            </div>
        </div>
    );
};

export default ProfileView;

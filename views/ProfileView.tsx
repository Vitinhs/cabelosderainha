
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { NotificationService } from '../src/services/notificationService';

interface ProfileViewProps {
    session: any;
    isSubscriber?: boolean;
}

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
            alert("As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.");
        }
    };

    const handleTestNotification = async () => {
        setIsTestLoading(true);
        await NotificationService.sendInstant(
            "Oi, Rainha! 👑",
            "Este é um teste do seu cronograma capilar. Seus fios agradecem o cuidado!"
        );
        setTimeout(() => setIsTestLoading(false), 1000);
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return (
        <div className="py-6 px-4 space-y-8 animate-in fade-in duration-500 max-w-lg mx-auto pb-32">
            <header className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-[#2d4a22] font-serif italic">Sua Conta</h2>
                <p className="text-sm text-gray-400 font-medium">Gerencie seu perfil e preferências.</p>
            </header>

            {/* Profile Info */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm flex flex-col items-center md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-100 flex items-center justify-center text-[#2d4a22] text-3xl font-bold shadow-inner">
                    {session?.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left">
                    <p className="text-xl font-bold text-[#2d4a22]">{session?.user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-gray-400 font-medium">{session?.user?.email}</p>
                    {isSubscriber && (
                        <div className="mt-2 inline-block px-3 py-1 bg-[#2d4a22] text-white rounded-full text-[9px] font-bold uppercase tracking-widest">
                            Membro Vip
                        </div>
                    )}
                </div>
            </section>

            {/* Settings */}
            <section className="space-y-5">
                <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] px-4">Preferências do App</h3>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                    {/* Notifications Toggle */}
                    <div className="p-6 flex items-center justify-between group hover:bg-emerald-50/10 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 text-xl shadow-sm">🔔</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Lembretes Diários</p>
                                <p className="text-[10px] text-gray-400 font-medium">Notificações para suas rotinas.</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleNotifications}
                            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${notificationsEnabled ? 'bg-[#2d4a22] shadow-lg shadow-emerald-200' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${notificationsEnabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Test Notification Button (Premium) */}
                    {notificationsEnabled && (
                        <div className="p-6 flex items-center justify-between group hover:bg-emerald-50/10 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 text-xl shadow-sm">✨</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Testar Lembrete</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Verifique se as notificações estão chegando.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleTestNotification}
                                disabled={isTestLoading}
                                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-orange-200 active:scale-95 disabled:opacity-50"
                            >
                                {isTestLoading ? "Enviando..." : "Testar Agora"}
                            </button>
                        </div>
                    )}

                    {/* iOS / PWA Help */}
                    {isIOS && (
                        <div className="bg-white">
                            <button
                                onClick={() => setShowPWAGuide(!showPWAGuide)}
                                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-4 text-left">
                                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 text-xl shadow-sm">📱</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Dificuldade no iPhone?</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Saiba como ativar lembretes no iOS.</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 transition-transform ${showPWAGuide ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {showPWAGuide && (
                                <div className="mx-6 mb-6 p-6 bg-purple-50 rounded-3xl space-y-4 border border-purple-100/50">
                                    <p className="text-xs text-purple-800 leading-relaxed font-medium">
                                        No iPhone, a Apple exige que o app seja adicionado à tela de início para ativar notificações:
                                    </p>
                                    <ol className="text-[11px] text-purple-700/80 space-y-3 list-decimal ml-4">
                                        <li>Toque no botão <strong>Compartilhar</strong> em baixo.</li>
                                        <li>Selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                                        <li>Abra o app novo e habilite os lembretes novamente aqui.</li>
                                    </ol>
                                    <div className="flex items-center space-x-2 text-[10px] text-purple-600 font-bold bg-white/50 p-2 rounded-xl">
                                        <span>💡</span>
                                        <span>Isso garantirá que seu plano nunca falhe.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support */}
                    <button className="w-full p-6 flex items-center space-x-4 hover:bg-gray-50/50 transition-colors">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-[#2d4a22] text-xl shadow-sm">💬</div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">Suporte VIP Especializado</p>
                            <p className="text-[10px] text-gray-400 font-medium">Estamos aqui para tirar todas as suas dúvidas.</p>
                        </div>
                    </button>
                </div>
            </section>

            {/* Logout */}
            <div className="pt-6">
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full py-5 bg-pink-50 text-pink-500 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-pink-100 transition-all active:scale-95 border border-pink-100/50 shadow-sm"
                >
                    Sair da Conta
                </button>
                <p className="text-center mt-4 text-[9px] text-gray-300 font-medium">Cabelos de Rainha AI - Versão 2.1.0 Premium</p>
            </div>
        </div>
    );
};

export default ProfileView;

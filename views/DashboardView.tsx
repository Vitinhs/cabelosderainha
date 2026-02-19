import { supabase } from '../services/supabaseClient';

interface DashboardViewProps {
    hairPlan: HairPlan | null;
    clienteId: string | null;
}

const VideoVIPSection: React.FC<{ clienteId: string | null }> = ({ clienteId }) => {
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleGerarVideo = async () => {
        if (!clienteId) {
            setError("ID do cliente não encontrado. Tente recarregar.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error: functionError } = await supabase.functions.invoke('vip-video', {
                body: { clienteId, script: "Tutorial VIP de cronograma capilar" }
            });

            if (functionError) throw functionError;
            if (data.error) throw new Error(data.message || data.error);

            setVideoUrl(data.videoUrl);
        } catch (err: any) {
            console.error("Erro ao gerar vídeo:", err);
            setError(err.message || "Falha ao gerar vídeo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
                    <video src={videoUrl} controls className="w-full h-full" autoPlay />
                </div>
            ) : (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-dashed border-emerald-200 text-center space-y-4">
                    <div className="text-4xl">🎬</div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[#2d4a22]">Seu conteúdo personalizado</p>
                        <p className="text-[10px] text-gray-500">Clique abaixo para gerar seu vídeo exclusivo da semana com IA.</p>
                    </div>
                </div>
            )}

            {error && <p className="text-[10px] text-red-500 font-medium px-2 italic">⚠️ {error}</p>}

            <button
                onClick={handleGerarVideo}
                disabled={loading}
                className="w-full py-4 bg-[#2d4a22] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-[#1f3317] transition-all disabled:opacity-50"
            >
                {loading ? "Processando..." : (videoUrl ? "Gerar Outro Vídeo" : "Gerar Meu Vídeo VIP")}
            </button>
            <p className="text-[9px] text-center text-gray-400">
                Lembre-se: usuários free podem gerar 1 vídeo por semana.
            </p>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ hairPlan, clienteId }) => {
    const progress = 35; // Mock progress

    return (
        <div className="min-h-screen bg-[#fcfbf7] py-6 px-6 space-y-8">
            {/* Welcome & Progress */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-[#2d4a22] font-serif italic">Olá, Rainha! 👑</h2>
                        <p className="text-gray-500 text-sm">Sua transformação já começou.</p>
                    </div>
                    <div className="bg-[#e8f0e3] px-4 py-2 rounded-2xl text-[#2d4a22] font-bold text-xs uppercase tracking-widest">
                        Premium
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Progresso do Ciclo</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-[#2d4a22] rounded-full"
                        />
                    </div>
                </div>
            </section>

            {/* Main Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Checklist */}
                <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                    <h3 className="font-bold text-[#2d4a22] border-b border-gray-50 pb-4">Checklist de Hoje</h3>
                    <div className="space-y-4">
                        {[
                            { task: "Massagem capilar (5min)", done: true },
                            { task: "Hidratação com Babosa", done: false },
                            { task: "Beber 2L de água", done: true }
                        ].map((t, i) => (
                            <div key={i} className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${t.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-50'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${t.done ? 'bg-[#2d4a22] border-[#2d4a22] text-white' : 'border-gray-200'}`}>
                                    {t.done ? '✓' : ''}
                                </div>
                                <span className={`text-sm font-medium ${t.done ? 'text-[#2d4a22] line-through opacity-50' : 'text-gray-700'}`}>{t.task}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* VIP Video Section */}
                <section className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                        <h3 className="font-bold text-[#2d4a22]">Vídeo VIP da Semana</h3>
                        <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">Novo</span>
                    </div>

                    <VideoVIPSection clienteId={clienteId} />
                </section>
            </div>

            {/* Upsell Store Placeholder */}
            <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-bold font-serif italic">Kit Rainha Natural 🌿</h3>
                        <p className="text-emerald-100/60 text-sm">Receba em casa os óleos e máscaras que usamos nas receitas.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-[#2d4a22] rounded-2xl font-bold text-sm whitespace-nowrap hover:bg-emerald-50 transition-all">
                        Ver na Loja
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-800/30 rounded-full blur-3xl"></div>
            </section>

            {/* Footer Nav Space */}
            <div className="h-20" />
        </div>
    );
};

export default DashboardView;

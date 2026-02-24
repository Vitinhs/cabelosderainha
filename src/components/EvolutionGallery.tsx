
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/services/supabaseClient';

interface EvolutionGalleryProps {
    userId: string;
}

const EvolutionGallery: React.FC<EvolutionGalleryProps> = ({ userId }) => {
    const [images, setImages] = useState<{ url: string; created_at: string }[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadImages();
    }, [userId]);

    const loadImages = async () => {
        try {
            const { data, error } = await supabase
                .from('progress_photos')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error('Error loading images:', error);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para enviar.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('evolucoes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('evolucoes')
                .getPublicUrl(filePath);

            // 3. Save to progress_photos table
            const { error: dbError } = await supabase
                .from('progress_photos')
                .insert([{ user_id: userId, url: publicUrl, created_at: new Date().toISOString() }]);

            if (dbError) throw dbError;

            loadImages();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#2d4a22]">Minha Evolução</h3>
                <label className="cursor-pointer bg-emerald-50 text-[#2d4a22] px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all">
                    {uploading ? 'Enviando...' : '+ Adicionar Foto'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                    {images.map((img, idx) => (
                        <motion.div
                            key={img.url}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square rounded-3xl overflow-hidden border border-emerald-50 shadow-sm relative group"
                        >
                            <img src={img.url} alt={`Evolução ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <p className="text-[10px] text-white font-medium">
                                    {new Date(img.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {images.length === 0 && !uploading && (
                    <div className="col-span-2 py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400">Nenhuma foto ainda. Comece seu registro!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvolutionGallery;

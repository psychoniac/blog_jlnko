import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
//import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Send, AlertCircle } from 'lucide-react';

export default function CreatePost({ onPostCreated }) {
    //  const { user } = useAuth();
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError("Le contenu du post ne peut pas être vide.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Récupérer la session active au moment exact de l'envoi
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session?.user) {
                throw new Error("Session expirée ou non valide. Veuillez vous re-connecter.");
            }

            const activeUser = session.user;
            let imageUrl = null;

            // 2. Upload de l'image si présente
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${activeUser.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('posts-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicURLData } = supabase.storage
                    .from('posts-images')
                    .getPublicUrl(filePath);

                imageUrl = publicURLData.publicUrl;
            }

            // 3. Insertion du post avec l'ID utilisateur garanti
            const { error: insertError } = await supabase
                .from('posts')
                .insert([
                    {
                        user_id: activeUser.id,
                        content: content.trim(),
                        image_url: imageUrl,
                    }
                ]);

            if (insertError) throw insertError;

            // Nettoyage et notification
            setContent('');
            setImageFile(null);
            onPostCreated();

        } catch (err) {
            console.error('Erreur lors de la création du post :', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-underground-card border-2 border-underground-border p-6 shadow-[4px_4px_0px_0px_#333333] font-mono">
            <h2 className="text-lg font-bold text-underground-highlight mb-4 border-b border-underground-border pb-2">
        // DIFFUSER UN NOUVEAU RÉCIT
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-underground-danger/20 border border-underground-danger text-underground-danger text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">TON TEXTE / TON HISTOIRE</label>
                    <textarea
                        rows="6"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Exprime ce que tu as sur le cœur..."
                        className="w-full bg-underground-bg border border-underground-border p-3 text-underground-accent text-sm focus:border-underground-highlight outline-none resize-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">IMAGE ASSOCIÉE (OPTIONNEL)</label>
                    <div className="flex items-center space-x-2 border border-underground-border p-2 bg-underground-bg">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-underground-border file:text-underground-accent hover:file:bg-underground-highlight hover:file:text-black cursor-pointer"
                        />
                    </div>
                    {imageFile && (
                        <p className="text-xs text-underground-highlight mt-1">Fichier sélectionné : {imageFile.name}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-underground-highlight text-black font-bold border border-underground-highlight hover:bg-transparent hover:text-underground-highlight transition-all uppercase tracking-wider text-sm flex items-center justify-center space-x-2"
                >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Publication en cours...' : 'Publier sur le réseau'}</span>
                </button>
            </form>
        </div>
    );
}
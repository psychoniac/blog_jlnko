import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Share2, Terminal } from 'lucide-react';

export default function PostCard({ post, onOpenDetail }) {
    const { user } = useAuth();
    const authorName = post.profiles?.username || 'Anonyme';

    // Récupération initiale des compteurs depuis Supabase
    const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0);
    const [commentsCount] = useState(post.comments?.[0]?.count || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [shareCount, setShareCount] = useState(0);

    // Vérifier si l'utilisateur connecté a déjà liké ce post
    useEffect(() => {
        if (user && post.id) {
            checkIfUserLiked();
        }
    }, [user, post.id]);

    const checkIfUserLiked = async () => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('post_id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single();

            if (data) setHasLiked(true);
        } catch (err) {
            // Pas encore liké
            setHasLiked(false);
        }
    };

    // Gestion du clic sur le bouton Like (insertion / suppression dans Supabase)
    const handleLikeToggle = async () => {
        if (!user) {
            alert("Vous devez être connecté pour liker un récit.");
            return;
        }

        try {
            if (hasLiked) {
                // Retirer le like
                setHasLiked(false);
                setLikesCount((prev) => Math.max(0, prev - 1));

                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Ajouter un like
                setHasLiked(true);
                setLikesCount((prev) => prev + 1);

                const { error } = await supabase
                    .from('likes')
                    .insert([{ post_id: post.id, user_id: user.id }]);

                if (error) throw error;
            }
        } catch (err) {
            console.error('Erreur toggle like:', err.message);
            // Annuler en cas d'erreur
            checkIfUserLiked();
        }
    };

    // Gestion du partage avec Web Share API ou Copie dans le presse-papier
    const handleShare = async () => {
        const postUrl = `${window.location.origin}/?post=${post.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Chronique de @${authorName}`,
                    text: post.content.substring(0, 100) + '...',
                    url: postUrl,
                });
                setShareCount((prev) => prev + 1);
            } catch (err) {
                // Annulation par l'utilisateur
            }
        } else {
            navigator.clipboard.writeText(postUrl);
            setShareCount((prev) => prev + 1);
            alert("Lien du récit copié dans le presse-papier !");
        }
    };

    return (
        <article className="bg-underground-card border-2 border-underground-border rounded-none p-4 md:p-6 mb-6 shadow-[4px_4px_0px_0px_#333333]">

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-underground-border pb-3 mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-underground-border flex items-center justify-center font-mono font-bold text-underground-highlight">
                        {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className="font-mono font-bold text-underground-accent block">
                            @{authorName}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()} à {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                <Terminal className="w-5 h-5 text-gray-600" />
            </div>

            {/* Contenu textuel */}
            <div className="text-gray-300 font-mono text-sm md:text-base leading-relaxed mb-4 whitespace-pre-line">
                {post.content}
            </div>

            {/* Image */}
            {post.image_url && (
                <div className="mb-4 border border-underground-border overflow-hidden bg-black">
                    <img
                        src={post.image_url}
                        alt="Média underground"
                        className="w-full h-auto max-h-[400px] object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    />
                </div>
            )}

            {/* Barre de compteurs & actions */}
            <div className="flex items-center justify-between pt-3 border-t border-underground-border font-mono text-xs">
                {/* Bouton Like */}
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center space-x-2 px-3 py-1.5 border border-underground-border transition-colors ${hasLiked ? 'bg-underground-highlight text-black font-bold' : 'hover:bg-underground-border text-gray-300'}`}
                >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-black' : ''}`} />
                    <span>{likesCount} {likesCount > 1 ? 'Likes' : 'Like'}</span>
                </button>

                {/* Bouton Commentaires */}
                <button
                    onClick={() => onOpenDetail && onOpenDetail(post.id)}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>{commentsCount} {commentsCount > 1 ? 'Commentaires' : 'Commentaire'}</span>
                </button>

                {/* Bouton Partager */}
                <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    <span>{shareCount > 0 ? `${shareCount} Partagés` : 'Partager'}</span>
                </button>
            </div>

        </article>
    );
}
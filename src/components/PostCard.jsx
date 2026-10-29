import { useState } from 'react';
import { Heart, MessageSquare, Share2, Terminal } from 'lucide-react';

export default function PostCard({ post }) {
    // post.profiles contient les infos de la table profiles grâce à la jointure SQL
    const authorName = post.profiles?.username || 'Anonyme';
    const [likes, setLikes] = useState(0); // On pourra lier les likes réels juste après
    const [hasLiked, setHasLiked] = useState(false);

    const handleLike = () => {
        setHasLiked(!hasLiked);
        setLikes(hasLiked ? likes - 1 : likes + 1);
    };

    return (
        <article className="bg-underground-card border-2 border-underground-border rounded-none p-4 md:p-6 mb-6 shadow-[4px_4px_0px_0px_#333333]">

            {/* En-tête du post */}
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

            {/* Texte */}
            <div className="text-gray-300 font-mono text-sm md:text-base leading-relaxed mb-4 whitespace-pre-line">
                {post.content}
            </div>

            {/* Image (si présente) */}
            {post.image_url && (
                <div className="mb-4 border border-underground-border overflow-hidden bg-black">
                    <img
                        src={post.image_url}
                        alt="Média underground"
                        className="w-full h-auto max-h-[400px] object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    />
                </div>
            )}

            {/* Barre d'interaction */}
            <div className="flex items-center justify-between pt-3 border-t border-underground-border font-mono text-xs">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-3 py-1.5 border border-underground-border transition-colors ${hasLiked ? 'bg-underground-highlight text-black font-bold' : 'hover:bg-underground-border text-gray-300'}`}
                >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-black' : ''}`} />
                    <span>{likes} Mentions</span>
                </button>

                <button
                    onClick={() => alert("Les commentaires arrivent à l'étape suivante !")}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Commentaires</span>
                </button>

                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Lien copié dans le presse-papier !");
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                </button>
            </div>

        </article>
    );
}
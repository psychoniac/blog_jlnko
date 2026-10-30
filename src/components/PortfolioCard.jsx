import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Share2, ExternalLink, Trash2, Send, CornerDownRight, X } from 'lucide-react';

export default function PortfolioCard({ item, onDelete, isOwner }) {
    const { user } = useAuth();

    // États pour les likes
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    // États pour les commentaires
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [shareCount, setShareCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReactions();
    }, [item.id]);

    const fetchReactions = async () => {
        try {
            // Compter les likes du projet
            const { count: likes } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('portfolio_item_id', item.id);

            setLikesCount(likes || 0);

            // Vérifier si l'utilisateur actuel a liké ce projet
            if (user) {
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('portfolio_item_id', item.id)
                    .eq('user_id', user.id)
                    .maybeSingle(); // .maybeSingle() évite l'erreur 406 si aucun like n'est trouvé

                setHasLiked(!!data);
            }


            // Récupérer les commentaires associés
            const { data: commentsData } = await supabase
                .from('comments')
                .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
                .eq('portfolio_item_id', item.id)
                .order('created_at', { ascending: true });

            setComments(commentsData || []);

        } catch (err) {
            console.error('Erreur chargement réactions portfolio:', err.message);
        }
    };

    // Toggle Like
    const handleLikeToggle = async () => {
        if (!user) {
            alert("Vous devez être connecté pour liker un projet.");
            return;
        }

        try {
            if (hasLiked) {
                setHasLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));

                await supabase
                    .from('likes')
                    .delete()
                    .eq('portfolio_item_id', item.id)
                    .eq('user_id', user.id);
            } else {
                setHasLiked(true);
                setLikesCount(prev => prev + 1);

                await supabase
                    .from('likes')
                    .insert([{ portfolio_item_id: item.id, user_id: user.id }]);
            }
        } catch (err) {
            console.error('Erreur toggle like portfolio:', err.message);
            fetchReactions();
        }
    };

    // Ajouter un commentaire / réponse
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('comments')
                .insert([
                    {
                        portfolio_item_id: item.id,
                        user_id: user.id,
                        content: newComment.trim(),
                        parent_id: replyTo ? replyTo.id : null
                    }
                ]);

            if (insertError) throw insertError;

            setNewComment('');
            setReplyTo(null);
            fetchReactions();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Supprimer un commentaire
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Supprimer ce commentaire ?")) return;

        try {
            await supabase.from('comments').delete().eq('id', commentId);
            setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
        } catch (err) {
            alert("Erreur suppression: " + err.message);
        }
    };

    // Partager
    const handleShare = async () => {
        const projectUrl = `${window.location.origin}/?project=${item.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.description.substring(0, 100),
                    url: projectUrl
                });
                setShareCount(prev => prev + 1);
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(projectUrl);
            setShareCount(prev => prev + 1);
            alert("Lien du projet copié dans le presse-papier !");
        }
    };

    const mainComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

    return (
        <div className="bg-underground-card border-2 border-underground-border overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_#333333] font-mono">

            {/* Visualisation média & contenu */}
            <div>
                <div className="h-52 bg-black overflow-hidden border-b border-underground-border relative group">
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-black/80 border border-underground-border px-2 py-0.5 text-[10px] text-underground-highlight uppercase">
                        {item.category}
                    </span>
                </div>

                <div className="p-4 space-y-2">
                    <h3 className="font-bold text-underground-accent text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </div>
            </div>

            {/* Liens et suppression proprietaire */}
            <div className="p-4 pt-0">
                <div className="flex items-center justify-between border-t border-underground-border/40 pt-3 mb-3">
                    {item.link_url ? (
                        <a
                            href={item.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-underground-highlight hover:underline flex items-center space-x-1"
                        >
                            <span>Voir le projet / lien</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    ) : (
                        <span className="text-[10px] text-gray-600">Création originale</span>
                    )}

                    {isOwner && (
                        <button
                            onClick={() => onDelete(item.id)}
                            className="text-underground-danger hover:opacity-80 p-1"
                            title="Supprimer la création"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Barre d'interactions pour la communauté */}
                <div className="flex items-center justify-between border-t border-underground-border pt-3 text-xs">
                    <button
                        onClick={handleLikeToggle}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 border border-underground-border transition-colors ${hasLiked ? 'bg-underground-highlight text-black font-bold' : 'hover:bg-underground-border text-gray-300'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-black' : ''}`} />
                        <span>{likesCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1.5 px-2.5 py-1 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{comments.length}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center space-x-1.5 px-2.5 py-1 border border-underground-border hover:bg-underground-border text-gray-300 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{shareCount > 0 ? shareCount : 'Partager'}</span>
                    </button>
                </div>

                {/* Section commentaires dépliable */}
                {showComments && (
                    <div className="mt-4 pt-3 border-t border-underground-border/60 space-y-3">
                        {error && (
                            <div className="p-2 bg-underground-danger/20 border border-underground-danger text-underground-danger text-[10px]">
                                {error}
                            </div>
                        )}

                        {/* Formulaire de réaction */}
                        {user ? (
                            <form onSubmit={handleAddComment} className="space-y-2">
                                {replyTo && (
                                    <div className="flex items-center justify-between bg-underground-border/40 p-1.5 text-[10px]">
                                        <span className="text-gray-300">Réponse à <strong className="text-underground-highlight">@{replyTo.username}</strong></span>
                                        <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={replyTo ? `Répondre à @${replyTo.username}...` : "Commenter cette œuvre..."}
                                        className="flex-1 bg-underground-bg border border-underground-border px-2 py-1 text-xs text-underground-accent outline-none focus:border-underground-highlight"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-3 py-1 bg-underground-highlight text-black font-bold text-xs"
                                    >
                                        <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-[10px] text-gray-500">Connectez-vous pour réagir.</p>
                        )}

                        {/* Liste des réactions */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {mainComments.length === 0 ? (
                                <p className="text-[10px] text-gray-500">Aucun commentaire pour le moment.</p>
                            ) : (
                                mainComments.map((comment) => {
                                    const author = comment.profiles?.username || 'Anonyme';
                                    const replies = getReplies(comment.id);
                                    const isCommentOwner = user && user.id === comment.user_id;

                                    return (
                                        <div key={comment.id} className="border-l border-underground-border pl-2 py-0.5 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-underground-accent">@{author}</span>
                                                <div className="flex items-center space-x-2">
                                                    {user && (
                                                        <button
                                                            onClick={() => setReplyTo({ id: comment.id, username: author })}
                                                            className="text-[10px] text-underground-highlight flex items-center space-x-0.5"
                                                        >
                                                            <CornerDownRight className="w-2.5 h-2.5" />
                                                            <span>Répondre</span>
                                                        </button>
                                                    )}
                                                    {isCommentOwner && (
                                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-underground-danger">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-300">{comment.content}</p>

                                            {/* Réponses imbriquées */}
                                            {replies.map((reply) => (
                                                <div key={reply.id} className="ml-3 border-l border-underground-highlight/40 pl-2 pt-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-underground-highlight">@{reply.profiles?.username || 'Anonyme'}</span>
                                                        {user && user.id === reply.user_id && (
                                                            <button onClick={() => handleDeleteComment(reply.id)} className="text-underground-danger">
                                                                <Trash2 className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-300">{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
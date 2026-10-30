import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Terminal, Trash2, AlertCircle, CornerDownRight, X } from 'lucide-react';

export default function PostDetail({ postId, onBack }) {
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // Stocke le commentaire auquel on répond { id, username }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPostAndComments();
    }, [postId]);

    const fetchPostAndComments = async () => {
        setLoading(true);
        try {
            // 1. Récupérer le post
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
                .eq('id', postId)
                .single();

            if (postError) throw postError;
            setPost(postData);

            // 2. Récupérer les commentaires avec profiles
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData || []);

        } catch (err) {
            console.error('Erreur chargement détail post :', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Vous devez être connecté pour commenter.");

            const { error: insertError } = await supabase
                .from('comments')
                .insert([
                    {
                        post_id: postId,
                        user_id: session.user.id,
                        content: newComment.trim(),
                        parent_id: replyTo ? replyTo.id : null // Liaison vers le parent
                    }
                ]);

            if (insertError) throw insertError;

            setNewComment('');
            setReplyTo(null);
            fetchPostAndComments();

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Supprimer ce commentaire et ses réponses ?")) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500 font-mono text-sm">
                [CHARGEMENT DU RÉCIT ET DES RÉACTIONS...]
            </div>
        );
    }

    if (!post) {
        return (
            <div className="font-mono text-center py-8">
                <p className="text-underground-danger mb-4">Post introuvable ou supprimé.</p>
                <button onClick={onBack} className="px-4 py-2 bg-underground-border text-white text-xs">
                    Retour au flux
                </button>
            </div>
        );
    }

    const authorName = post.profiles?.username || 'Anonyme';

    // Séparation des commentaires principaux et des réponses
    const mainComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

    return (
        <div className="max-w-2xl mx-auto space-y-6 font-mono">

            {/* Bouton Retour */}
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-underground-highlight transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>RETOUR AU FLUX PRINCIPAL</span>
            </button>

            {/* Récit */}
            <article className="bg-underground-card border-2 border-underground-border p-4 md:p-6 shadow-[4px_4px_0px_0px_#333333]">
                <div className="flex items-center justify-between border-b border-underground-border pb-3 mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-underground-border flex items-center justify-center font-bold text-underground-highlight">
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className="font-bold text-underground-accent block">@{authorName}</span>
                            <span className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()} à {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <Terminal className="w-5 h-5 text-gray-600" />
                </div>

                <div className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-line">
                    {post.content}
                </div>

                {post.image_url && (
                    <div className="mb-4 border border-underground-border bg-black">
                        <img
                            src={post.image_url}
                            alt="Média du récit"
                            className="w-full h-auto max-h-[500px] object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                )}
            </article>

            {/* Espace Commentaires */}
            <section className="bg-underground-card border-2 border-underground-border p-4 md:p-6 shadow-[4px_4px_0px_0px_#333333]">
                <h3 className="text-sm font-bold text-underground-highlight mb-4 border-b border-underground-border pb-2">
          // ESPACE DE DISCUSSION ({comments.length})
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-underground-danger/20 border border-underground-danger text-underground-danger text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Formulaire de réaction */}
                {user ? (
                    <form onSubmit={handleAddComment} className="mb-6 space-y-3">

                        {/* Indicateur de réponse */}
                        {replyTo && (
                            <div className="flex items-center justify-between bg-underground-border/40 p-2 text-xs border-l-2 border-underground-highlight">
                                <span className="text-gray-300">Réponse à <strong className="text-underground-highlight">@{replyTo.username}</strong></span>
                                <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <textarea
                            rows="3"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? `Écris ta réponse à @${replyTo.username}...` : "Laisser une réaction, un mot d'encouragement..."}
                            className="w-full bg-underground-bg border border-underground-border p-3 text-underground-accent text-sm focus:border-underground-highlight outline-none resize-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="py-2 px-4 bg-underground-highlight text-black font-bold border border-underground-highlight hover:bg-transparent hover:text-underground-highlight transition-all uppercase text-xs flex items-center space-x-2"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? 'Envoi...' : (replyTo ? 'Envoyer la réponse' : 'Répondre')}</span>
                        </button>
                    </form>
                ) : (
                    <div className="mb-6 p-3 border border-underground-border bg-underground-bg text-xs text-gray-400">
                        Connectez-vous pour pouvoir laisser un commentaire ou répondre sous ce récit.
                    </div>
                )}

                {/* Liste des commentaires imbriqués */}
                {mainComments.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">Aucun commentaire pour le moment. Soyez le premier à réagir.</p>
                ) : (
                    <div className="space-y-4">
                        {mainComments.map((comment) => {
                            const commentAuthor = comment.profiles?.username || 'Anonyme';
                            const isOwner = user && user.id === comment.user_id;
                            const replies = getReplies(comment.id);

                            return (
                                <div key={comment.id} className="space-y-3">

                                    {/* Commentaire principal */}
                                    <div className="border-l-2 border-underground-border pl-4 py-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-underground-accent">@{commentAuthor}</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[10px] text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>

                                                {user && (
                                                    <button
                                                        onClick={() => setReplyTo({ id: comment.id, username: commentAuthor })}
                                                        className="text-xs text-underground-highlight hover:underline flex items-center space-x-1"
                                                    >
                                                        <CornerDownRight className="w-3 h-3" />
                                                        <span>Répondre</span>
                                                    </button>
                                                )}

                                                {isOwner && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-underground-danger hover:opacity-80 p-1"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 whitespace-pre-line">{comment.content}</p>
                                    </div>

                                    {/* Réponses imbriquées (sous-commentaires) */}
                                    {replies.length > 0 && (
                                        <div className="ml-6 space-y-3 border-l-2 border-underground-highlight/40 pl-4">
                                            {replies.map((reply) => {
                                                const replyAuthor = reply.profiles?.username || 'Anonyme';
                                                const isReplyOwner = user && user.id === reply.user_id;

                                                return (
                                                    <div key={reply.id} className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-underground-highlight">@{replyAuthor}</span>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-[10px] text-gray-500">
                                                                    {new Date(reply.created_at).toLocaleDateString()} {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isReplyOwner && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(reply.id)}
                                                                        className="text-underground-danger hover:opacity-80 p-1"
                                                                        title="Supprimer la réponse"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-300 whitespace-pre-line">{reply.content}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

        </div>
    );
}
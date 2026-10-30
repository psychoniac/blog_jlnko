import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { User, Terminal, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
    const { user, profile } = useAuth();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Récupérer uniquement les posts de l'utilisateur connecté
    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserPosts(data || []);
        } catch (err) {
            console.error('Erreur chargement posts utilisateur:', err.message);
        } finally {
            setLoadingPosts(false);
        }
    };
    // Initialiser les champs du formulaire dès que le profil ou l'user est chargé
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setBio(profile.bio || '');
        }
        if (user) {
            fetchUserPosts();
        }
    }, [user, profile]);



    // Mettre à jour le profil (pseudo et bio)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: username.trim(),
                    bio: bio.trim()
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage('Profil mis à jour avec succès !');
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    // Supprimer un post de l'utilisateur
    const handleDeletePost = async (postId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce récit ?")) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            // Retirer le post supprimé de la liste locale instantanément
            setUserPosts(userPosts.filter(p => p.id !== postId));
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 font-mono">

            {/* 1. Bloc Paramètres du Profil */}
            <div className="bg-underground-card border-2 border-underground-border p-6 shadow-[4px_4px_0px_0px_#333333]">
                <div className="flex items-center space-x-2 border-b border-underground-border pb-4 mb-6">
                    <User className="w-5 h-5 text-underground-highlight" />
                    <h2 className="text-lg font-bold text-underground-accent">
            // CONFIGURATION DU PROFIL
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-underground-danger/20 border border-underground-danger text-underground-danger text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">E-MAIL (COMPTE)</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-underground-bg/50 border border-underground-border px-3 py-2 text-gray-500 text-sm cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">PSEUDO (USERNAME)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-underground-bg border border-underground-border px-3 py-2 text-underground-accent text-sm focus:border-underground-highlight outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">BIO / DESCRIPTION</label>
                        <textarea
                            rows="3"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Quelques mots sur ton parcours..."
                            className="w-full bg-underground-bg border border-underground-border p-3 text-underground-accent text-sm focus:border-underground-highlight outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className="py-2 px-4 bg-underground-highlight text-black font-bold border border-underground-highlight hover:bg-transparent hover:text-underground-highlight transition-all uppercase text-xs flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{updating ? 'Enregistrement...' : 'Mettre à jour le profil'}</span>
                    </button>
                </form>
            </div>

            {/* 2. Bloc Gestion de ses propres Récits */}
            <div className="bg-underground-card border-2 border-underground-border p-6 shadow-[4px_4px_0px_0px_#333333]">
                <div className="flex items-center justify-between border-b border-underground-border pb-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-underground-highlight" />
                        <h2 className="text-lg font-bold text-underground-accent">
              // MES RÉCITS ({userPosts.length})
                        </h2>
                    </div>
                </div>

                {loadingPosts ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                        [CHARGEMENT DE VOS PUBLICATIONS...]
                    </div>
                ) : userPosts.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-6">Tu n'as publié aucun récit pour le moment.</p>
                ) : (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <div key={post.id} className="border border-underground-border p-4 bg-underground-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1 flex-1">
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.created_at).toLocaleDateString()} à {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                                </div>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="flex items-center space-x-1 px-3 py-1.5 border border-underground-danger text-underground-danger hover:bg-underground-danger hover:text-white transition-all text-xs flex-shrink-0"
                                    title="Supprimer ce post"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
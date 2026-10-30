import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import ProfilePage from './components/ProfilePage';

export default function App() {
    const [currentView, setCurrentView] = useState('home');
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    // Fonction pour récupérer la liste mise à jour des posts
    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des posts :', err.message);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Ce useEffect s'exécute au démarrage ET à chaque fois qu'on revient sur 'home'
    useEffect(() => {
        if (currentView === 'home') {
            fetchPosts();
        }
    }, [currentView]);

    return (
        <AuthProvider>
            <div className="min-h-screen bg-underground-bg text-underground-accent font-mono selection:bg-underground-highlight selection:text-black">

                <Navbar setCurrentView={setCurrentView} />

                <main className="max-w-2xl mx-auto p-4 md:p-6">
                    {currentView === 'home' && (
                        <div>
                            {/* En-tête d'accueil */}
                            <div className="text-center py-8 mb-6 border-b border-underground-border">
                                <h1 className="text-xl md:text-3xl font-bold text-underground-highlight mb-2">
                                    CHRONICLES OF THE UNDERGROUND
                                </h1>
                                <p className="text-gray-400 text-xs md:text-sm max-w-lg mx-auto">
                                    Récits de rue, reconstruction et résilience. Un espace brut pour partager l'envers du décor.
                                </p>
                            </div>

                            {/* Liste des posts */}
                            {loadingPosts ? (
                                <div className="text-center py-12 text-gray-500 text-sm">
                                    [CONNEXION AU RÉSEAU EN COURS...]
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-underground-border p-6">
                                    <p className="text-gray-400 text-sm mb-4">Aucun récit publié pour l'instant.</p>
                                    <button
                                        onClick={() => setCurrentView('create')}
                                        className="px-4 py-2 bg-underground-highlight text-black font-bold text-xs uppercase"
                                    >
                                        Rédiger le premier post
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {posts.map((post) => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === 'auth' && (
                        <AuthPage onLoginSuccess={() => setCurrentView('home')} />
                    )}

                    {currentView === 'create' && (
                        <CreatePost onPostCreated={() => {
                            setCurrentView('home'); // Le useEffect s'occupera de recharger la liste !
                        }} />
                    )}

                    {currentView === 'profile' && (
                        <ProfilePage />
                    )}
                </main>

            </div>
        </AuthProvider>
    );
}
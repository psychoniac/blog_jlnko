import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Terminal, Code, Palette, Camera, ExternalLink, Plus, Trash2, AlertCircle } from 'lucide-react';
import PortfolioCard from './PortfolioCard';

export default function Portfolio() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'dev', 'peinture', 'photo'
    const [loading, setLoading] = useState(true);

    // États pour le formulaire d'ajout (accessible si admin/propriétaire)
    const [showAddModal, setShowAddModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('dev');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchPortfolio = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('portfolio_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error('Erreur chargement portfolio:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);


    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!title.trim() || !imageFile) {
            setError("Le titre et l'image sont obligatoires.");
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // 1. Upload de l'image
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `portfolio/${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('posts-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                throw new Error("Erreur Storage : " + uploadError.message);
            }

            const { data: publicURLData } = supabase.storage
                .from('posts-images')
                .getPublicUrl(filePath);

            // 2. Insertion en base
            const { error: insertError } = await supabase
                .from('portfolio_items')
                .insert([
                    {
                        user_id: user.id,
                        title: title.trim(),
                        description: description.trim(),
                        category,
                        image_url: publicURLData.publicUrl,
                        link_url: linkUrl.trim() || null
                    }
                ]);

            if (insertError) {
                throw new Error("Erreur Base de données : " + insertError.message);
            }

            // Reset et fermeture
            setTitle('');
            setDescription('');
            setLinkUrl('');
            setImageFile(null);
            setShowAddModal(false);
            fetchPortfolio();

        } catch (err) {
            console.error(err);
            setError(err.message); // S'affiche désormais dans l'interface en cas de souci
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    // Supprimer un élément du portfolio
    const handleDeleteItem = async (id) => {
        if (!window.confirm("Supprimer cette réalisation du portfolio ?")) return;
        try {
            const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
            if (error) throw error;
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            alert("Erreur: " + err.message);
        }
    };
    return (
        <div className="max-w-4xl mx-auto space-y-6 font-mono">

            {/* En-tête du Portfolio */}
            <div className="bg-underground-card border-2 border-underground-border p-6 shadow-[4px_4px_0px_0px_#333333] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-underground-highlight mb-1">
                        <Terminal className="w-5 h-5" />
                        <h1 className="text-xl font-bold">// PORTFOLIO // GALERIE</h1>
                    </div>
                    <p className="text-xs text-gray-400">Développement web, spray art sur carton & photographie urbaine.</p>
                </div>

                {/* Le bouton Ajouter n'apparaît que pour ton adresse email d'admin */}
                {user && user.email === 'jlnko@hotmail.fr' && (
                    <button
                        onClick={() => setShowAddModal(!showAddModal)}
                        className="px-4 py-2 bg-underground-highlight text-black font-bold text-xs uppercase flex items-center space-x-2 hover:opacity-90"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une œuvre / projet</span>
                    </button>
                )}

                {/* Grille des réalisations avec le composant PortfolioCard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            onDelete={handleDeleteItem}
                            isOwner={user && user.id === item.user_id}
                        />
                    ))}
                </div>
            </div>

            {/* Formulaire d'ajout (Modal / Déroulant) */}
            {showAddModal && (
                <div className="bg-underground-card border-2 border-underground-highlight p-6 shadow-[4px_4px_0px_0px_#facc15]">
                    <h3 className="text-sm font-bold text-underground-highlight mb-4">// NOUVELLE CRÉATION</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-underground-danger/20 border border-underground-danger text-underground-danger text-xs flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">TITRE</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="ex: Dofus Companion / Toile #42"
                                    className="w-full bg-underground-bg border border-underground-border p-2 text-xs text-underground-accent outline-none focus:border-underground-highlight"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">CATÉGORIE</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-underground-bg border border-underground-border p-2 text-xs text-underground-accent outline-none focus:border-underground-highlight"
                                >
                                    <option value="dev">Développement Web (App)</option>
                                    <option value="peinture">Peinture / Spray Art</option>
                                    <option value="photo">Photographie</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">DESCRIPTION</label>
                            <textarea
                                rows="2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Technologies utilisées, démarche artistique, contexte..."
                                className="w-full bg-underground-bg border border-underground-border p-2 text-xs text-underground-accent outline-none focus:border-underground-highlight resize-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">LIEN EXTERNE (GITHUB / LIVE / INSTA)</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-underground-bg border border-underground-border p-2 text-xs text-underground-accent outline-none focus:border-underground-highlight"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">IMAGE / PHOTO</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-bold file:bg-underground-border file:text-underground-accent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-3 py-1.5 border border-underground-border text-xs text-gray-400 hover:text-white"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-1.5 bg-underground-highlight text-black font-bold text-xs uppercase"
                            >
                                {submitting ? 'Publication...' : 'Enregistrer dans le portfolio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Barre de filtres */}
            <div className="flex flex-wrap gap-2 pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs border border-underground-border transition-all ${filter === 'all' ? 'bg-underground-highlight text-black font-bold' : 'bg-underground-card text-gray-300 hover:border-underground-highlight'}`}
                >
                    [TOUT AFFICHER]
                </button>
                <button
                    onClick={() => setFilter('dev')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs border border-underground-border transition-all ${filter === 'dev' ? 'bg-underground-highlight text-black font-bold' : 'bg-underground-card text-gray-300 hover:border-underground-highlight'}`}
                >
                    <Code className="w-3.5 h-3.5" />
                    <span>Dev Apps</span>
                </button>
                <button
                    onClick={() => setFilter('peinture')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs border border-underground-border transition-all ${filter === 'peinture' ? 'bg-underground-highlight text-black font-bold' : 'bg-underground-card text-gray-300 hover:border-underground-highlight'}`}
                >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Peinture & Spray</span>
                </button>
                <button
                    onClick={() => setFilter('photo')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs border border-underground-border transition-all ${filter === 'photo' ? 'bg-underground-highlight text-black font-bold' : 'bg-underground-card text-gray-300 hover:border-underground-highlight'}`}
                >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photographie</span>
                </button>
            </div>

            {/* Grille des réalisations */}
            {loading ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                    [CHARGEMENT DE LA GALERIE...]
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-underground-border p-6 text-gray-400 text-xs">
                    Aucun élément dans cette catégorie pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-underground-card border-2 border-underground-border overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_#333333]">
                            <div>
                                <div className="h-48 bg-black overflow-hidden border-b border-underground-border relative group">
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

                            <div className="p-4 pt-0 flex items-center justify-between border-t border-underground-border/40 mt-4">
                                {item.link_url ? (
                                    <a
                                        href={item.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-underground-highlight hover:underline flex items-center space-x-1 pt-3"
                                    >
                                        <span>Voir le projet / lien</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                ) : (
                                    <span className="text-[10px] text-gray-600 pt-3">Création personnelle</span>
                                )}

                                {user && user.id === item.user_id && (
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-underground-danger hover:opacity-80 pt-3"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
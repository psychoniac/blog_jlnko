import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Terminal, Lock, Mail, User } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Connexion
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                // Inscription
                if (!username.trim()) throw new Error("Le pseudo est obligatoire.");

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username: username.trim() } // Envoyé au trigger SQL pour créer le profil
                    }
                });
                if (error) throw error;
                alert("Inscription réussie ! Vérifie tes e-mails si la confirmation est activée, ou connecte-toi.");
            }
            onLoginSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-underground-card border-2 border-underground-border shadow-[4px_4px_0px_0px_#333333] font-mono">

            <div className="flex items-center space-x-2 border-b border-underground-border pb-4 mb-6">
                <Terminal className="w-5 h-5 text-underground-highlight" />
                <h2 className="text-xl font-bold text-underground-accent">
                    {isLogin ? 'ACCÈS SYSTÈME // CONNEXION' : 'NOUVEAU PROFIL // INSCRIPTION'}
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-underground-danger/20 border border-underground-danger text-underground-danger text-xs">
                    [ERREUR] : {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">PSEUDO (USERNAME)</label>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ex: Rebirth_NYC"
                                className="w-full bg-underground-bg border border-underground-border pl-10 pr-3 py-2 text-underground-accent text-sm focus:border-underground-highlight outline-none"
                                required={!isLogin}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs text-gray-400 mb-1">E-MAIL</label>
                    <div className="relative flex items-center">
                        <Mail className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ton@email.com"
                            className="w-full bg-underground-bg border border-underground-border pl-10 pr-3 py-2 text-underground-accent text-sm focus:border-underground-highlight outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">MOT DE PASSE</label>
                    <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-underground-bg border border-underground-border pl-10 pr-3 py-2 text-underground-accent text-sm focus:border-underground-highlight outline-none"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-underground-highlight text-black font-bold border border-underground-highlight hover:bg-transparent hover:text-underground-highlight transition-all uppercase tracking-wider text-sm mt-2"
                >
                    {loading ? 'Traitement en cours...' : (isLogin ? 'Se connecter' : "Créer le compte")}
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-underground-border text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs text-gray-400 hover:text-underground-highlight underline transition-colors"
                >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
            </div>

        </div>
    );
}
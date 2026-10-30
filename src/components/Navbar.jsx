import { useState } from 'react';
import { Terminal, PlusCircle, User, LogOut, LogIn, Briefcase, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ setCurrentView }) {
    const { user, profile, signOut } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        signOut();
    };

    return (
        <>
            <header className="border-b-2 border-underground-border bg-underground-card sticky top-0 z-50 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">

                    {/* Logo / Titre du site */}
                    <button
                        onClick={() => setCurrentView('home')}
                        className="flex items-center space-x-2 text-underground-highlight font-mono font-bold tracking-wider text-lg hover:opacity-80 transition-opacity"
                    >
                        <Terminal className="w-6 h-6" />
                        <span>SUBWAY_CHRONICLES</span>
                    </button>

                    {/* Boutons de navigation */}
                    <div className="flex items-center space-x-3 font-mono text-xs md:text-sm">

                        {/* Lien Portfolio permanent */}
                        <button
                            onClick={() => setCurrentView('portfolio')}
                            className="flex items-center space-x-1.5 px-3 py-1.5 border border-underground-border text-underground-accent hover:border-underground-highlight transition-all"
                        >
                            <Briefcase className="w-4 h-4 text-underground-highlight" />
                            <span className="hidden md:inline">Portfolio</span>
                        </button>

                        {user ? (
                            <>
                                <button
                                    onClick={() => setCurrentView('create')}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-underground-highlight text-black font-bold border border-underground-highlight hover:bg-transparent hover:text-underground-highlight transition-all"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span className="hidden md:inline">Écrire</span>
                                </button>

                                <button
                                    onClick={() => setCurrentView('profile')}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 border border-underground-border text-underground-accent hover:border-underground-highlight transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    <span>@{profile?.username || 'Profil'}</span>
                                </button>

                                {/* Bouton de déconnexion qui ouvre la modale */}
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="p-1.5 border border-underground-border text-underground-danger hover:bg-underground-danger hover:text-white transition-all"
                                    title="Se déconnecter"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setCurrentView('auth')}
                                className="flex items-center space-x-1.5 px-4 py-1.5 bg-underground-accent text-black font-bold border border-underground-accent hover:bg-transparent hover:text-underground-accent transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Connexion</span>
                            </button>
                        )}
                    </div>

                </div>
            </header>

            {/* 🛑 MODALE DE CONFIRMATION DE DÉCONNEXION */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                    <div className="bg-underground-card border-2 border-underground-danger p-6 max-w-sm w-full shadow-[6px_6px_0px_0px_#ef4444] space-y-4 animate-in fade-in zoom-in duration-200">

                        <div className="flex items-center space-x-3 text-underground-danger">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">// CONFIRMER LA DÉCONNEXION</h2>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            Êtes-vous sûr de vouloir fermer votre session active sur le réseau ?
                        </p>

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2 px-3 border border-underground-border text-xs text-gray-300 hover:bg-underground-border hover:text-white uppercase transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 py-2 px-3 bg-underground-danger text-white font-bold text-xs uppercase hover:opacity-90 transition-all"
                            >
                                Déconnexion
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
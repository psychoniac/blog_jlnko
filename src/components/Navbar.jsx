import { Terminal, PlusCircle, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ setCurrentView }) {
    const { user, profile, signOut } = useAuth();

    return (
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

                            <button
                                onClick={signOut}
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
                            <span>Connexion / Inscription</span>
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
}
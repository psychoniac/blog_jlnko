import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';

export default function App() {
    const [currentView, setCurrentView] = useState('home');

    return (
        <AuthProvider>
            <div className="min-h-screen bg-underground-bg text-underground-accent font-mono selection:bg-underground-highlight selection:text-black">

                {/* Barre de navigation */}
                <Navbar setCurrentView={setCurrentView} />

                {/* Contenu principal selon la vue active */}
                <main className="max-w-4xl mx-auto p-4 md:p-6">
                    {currentView === 'home' && (
                        <div className="text-center py-12">
                            <h1 className="text-2xl md:text-4xl font-bold text-underground-highlight mb-4">
                                CHRONICLES OF THE UNDERGROUND
                            </h1>
                            <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base mb-8">
                                Récits de rue, reconstruction et résilience. Un espace brut pour partager l'envers du décor et la remontée vers la lumière.
                            </p>
                            <div className="border border-underground-border bg-underground-card p-6 inline-block">
                                <p className="text-xs text-gray-500 mb-2">[STATUT DU SYSTÈME]</p>
                                <p className="text-sm">Flux de publications en cours de chargement...</p>
                            </div>
                        </div>
                    )}

                    {currentView === 'auth' && (
                        <AuthPage onLoginSuccess={() => setCurrentView('home')} />
                    )}

                    {currentView === 'create' && (
                        <div className="p-6 bg-underground-card border border-underground-border">
                            <h2 className="text-lg font-bold mb-4 text-underground-highlight">NOUVELLE PUBLICATION</h2>
                            <p className="text-sm text-gray-400">Le formulaire d'écriture et d'upload photo arrive juste après !</p>
                        </div>
                    )}

                    {currentView === 'profile' && (
                        <div className="p-6 bg-underground-card border border-underground-border">
                            <h2 className="text-lg font-bold mb-4 text-underground-highlight">MON PROFIL</h2>
                            <p className="text-sm text-gray-400">Gestion du profil utilisateur en cours de construction...</p>
                        </div>
                    )}
                </main>

            </div>
        </AuthProvider>
    );
}
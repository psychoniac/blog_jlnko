import { Terminal, Shield, Code, Palette, Camera, Heart, ArrowLeft } from 'lucide-react';

export default function AboutPage({ setCurrentView }) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 font-mono pb-12">

            {/* Bouton Retour */}
            <button
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-underground-highlight transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>RETOUR AU FLUX PRINCIPAL</span>
            </button>

            {/* En-tête de la page À propos */}
            <section className="bg-underground-card border-2 border-underground-border p-6 md:p-8 shadow-[4px_4px_0px_0px_#333333] space-y-4">
                <div className="flex items-center space-x-3 border-b border-underground-border pb-4">
                    <Terminal className="w-6 h-6 text-underground-highlight" />
                    <h1 className="text-xl md:text-2xl font-bold text-underground-highlight">
            // À PROPOS DE CE PROJET
                    </h1>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                    Bienvenue dans les <strong className="text-underground-accent">Subway Chronicles</strong>. Cet espace a été conçu comme un fanzine numérique brut, inspiré par l'esthétique underground des années 90, la culture hip-hop old school et l'indépendance créative.
                </p>

                <p className="text-sm text-gray-300 leading-relaxed">
                    Plus qu'un simple blog, c'est un carnet de bord personnel et ouvert. Un espace d'expression pour documenter un parcours de reconstruction, partager l'envers du décor, et exposer des créations artistiques loin des algorithmes aseptisés des réseaux sociaux traditionnels.
                </p>
            </section>

            {/* Piliers du projet */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Pilier 1 : Résilience / Récits */}
                <div className="bg-underground-card border-2 border-underground-border p-5 shadow-[4px_4px_0px_0px_#333333] space-y-3">
                    <div className="flex items-center space-x-2 text-underground-highlight">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold text-sm">RÉCITS & RÉSILIENCE</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Partager les étapes d'un parcours de sevrage et de reconstruction face à l'addiction. Mettre des mots sur les combats du quotidien et la force de se relever.
                    </p>
                </div>

                {/* Pilier 2 : Code / Tech */}
                <div className="bg-underground-card border-2 border-underground-border p-5 shadow-[4px_4px_0px_0px_#333333] space-y-3">
                    <div className="flex items-center space-x-2 text-underground-highlight">
                        <Code className="w-5 h-5" />
                        <h3 className="font-bold text-sm">DÉVELOPPEMENT WEB</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Conception d'applications fullstack sur-mesure, architectures modulaires JavaScript/React, et outils orientés utilité et performance.
                    </p>
                </div>

                {/* Pilier 3 : Peinture / Spray Art */}
                <div className="bg-underground-card border-2 border-underground-border p-5 shadow-[4px_4px_0px_0px_#333333] space-y-3">
                    <div className="flex items-center space-x-2 text-underground-highlight">
                        <Palette className="w-5 h-5" />
                        <h3 className="font-bold text-sm">SPRAY ART & PEINTURE</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Exploration artistique à travers la peinture à la bombe sur carton et la création visuelle brute, directement inspirée de la culture street art.
                    </p>
                </div>

                {/* Pilier 4 : Photographie */}
                <div className="bg-underground-card border-2 border-underground-border p-5 shadow-[4px_4px_0px_0px_#333333] space-y-3">
                    <div className="flex items-center space-x-2 text-underground-highlight">
                        <Camera className="w-5 h-5" />
                        <h3 className="font-bold text-sm">PHOTOGRAPHIE URBAINE</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Capturer l'ambiance des environnements urbains, l'architecture industrielle et les textures de la ville à travers l'objectif.
                    </p>
                </div>

            </section>

            {/* Note de bas de page */}
            <section className="bg-underground-card border-2 border-underground-border p-4 text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4 text-underground-danger" />
                <span>Propulsé par React, Tailwind CSS & Supabase. Fait maison, en toute liberté.</span>
            </section>

        </div>
    );
}
export default function SuppressionDonnees() {
    return (
        <div className="min-h-screen bg-[#080810] text-white px-8 py-12 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Suppression des Données</h1>
            <p className="text-white/60 mb-4">Dernière mise à jour : Juin 2026</p>
            <div className="space-y-6 text-white/70 leading-relaxed">
                <section>
                    <h2 className="text-white font-semibold mb-2">Comment supprimer vos données</h2>
                    <p>Pour demander la suppression de vos données personnelles de la plateforme DGA Digital Program, envoyez un email à :</p>
                    <p className="text-cyan-400 mt-2">devandicorp@gmail.com</p>
                    <p className="mt-2">avec l'objet : <strong>"Suppression de mes données"</strong></p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">Délai de traitement</h2>
                    <p>Votre demande sera traitée dans un délai de 30 jours ouvrables.</p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">Données supprimées</h2>
                    <p>Seront supprimées : vos informations personnelles, vos publications et vos données de facturation.</p>
                </section>
            </div>
        </div>
    );
}
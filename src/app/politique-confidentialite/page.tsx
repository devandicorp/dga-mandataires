export default function PolitiqueConfidentialite() {
    return (
        <div className="min-h-screen bg-[#080810] text-white px-8 py-12 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Politique de Confidentialité</h1>
            <p className="text-white/60 mb-4">Dernière mise à jour : Juin 2026</p>
            <div className="space-y-6 text-white/70 leading-relaxed">
                <section>
                    <h2 className="text-white font-semibold mb-2">1. Collecte des données</h2>
                    <p>DGA Digital Program collecte uniquement les données nécessaires au fonctionnement de la plateforme de gestion des mandataires immobiliers.</p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">2. Utilisation des données</h2>
                    <p>Les données collectées sont utilisées exclusivement pour la gestion des mandataires, la publication de contenu sur les réseaux sociaux et la facturation.</p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">3. Données Facebook</h2>
                    <p>Notre application accède aux Pages Facebook des mandataires uniquement pour publier du contenu immobilier en leur nom, avec leur consentement explicite.</p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">4. Conservation des données</h2>
                    <p>Les données sont conservées tant que le mandataire est actif dans le programme DGA Digital.</p>
                </section>
                <section>
                    <h2 className="text-white font-semibold mb-2">5. Contact</h2>
                    <p>Pour toute question : devandicorp@gmail.com</p>
                </section>
            </div>
        </div>
    );
}
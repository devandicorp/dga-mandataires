// scripts/link-missing-pages.mjs
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const liaisons = [
    {
        page_id: "103691774843497",
        mandataire_nom: "Cyril Goun",
        token: "EAAV7CO505wgBRj8wG8iEzO7Nfv6tUHnfTSIJZAKNh8px4FJqUhOy2ZB0suhfoYNEMPseBDolVM8YGMXmHx8IKeH6FkOviBJKJ42p8JElv714oMb6qPmDf8nvihqMZCCDttZCMb6XEYEve0vY3pCVoXeR9E5dW6Vn0FQT6EkoA7dEdI12k27L6SE2hQgblJBWHjEZD",
    },
    {
        page_id: "1184105351451454",
        mandataire_nom: "Dosso karamoko",
        token: "EAAV7CO505wgBRop1f7ZClJwHwlEc7Gc6HJi3KO4G2q1MOguluhdVOYep5LWTM80p0LefKarPEbcTsVJRFzZByCl8JikhibBvqZCLABxy3CY71OLuz80ViP76LL61HyzwS7DTJAm4jNEM3YkHgY3L4oZA2fDWo7KHJZCkfiHgb50EW5p2MgVZB1bZBuMnkQRXfCo1Jxn",
    },
];

const { data: mandataires } = await supabase.from("mandataires").select("id, nom");

for (const liaison of liaisons) {
    const mandataire = mandataires.find(
        (m) => m.nom.toLowerCase().trim() === liaison.mandataire_nom.toLowerCase().trim()
    );

    if (!mandataire) {
        console.log(`⚠️ Mandataire non trouvé: "${liaison.mandataire_nom}"`);
        continue;
    }

    const { error } = await supabase
        .from("mandataires")
        .update({
            facebook_page_id: liaison.page_id,
            facebook_page_token: liaison.token,
        })
        .eq("id", mandataire.id);

    if (error) {
        console.error(`❌ Erreur pour ${mandataire.nom}: ${error.message}`);
    } else {
        console.log(`✅ ${mandataire.nom} → Page ${liaison.page_id}`);
    }
}

console.log("🎉 Terminé !");
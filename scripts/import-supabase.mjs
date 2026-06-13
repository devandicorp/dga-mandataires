// scripts/import-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Import Mandataires
console.log("📦 Import Mandataires...");
const mandataires = JSON.parse(readFileSync("scripts/mandataires.json", "utf-8"));

for (const m of mandataires) {
    const { error } = await supabase.from("mandataires").upsert(m, {
        onConflict: "airtable_id",
    });
    if (error) {
        console.error(`❌ Erreur pour ${m.nom}:`, error.message);
    } else {
        console.log(`✅ ${m.nom}`);
    }
}

// Import Factures
console.log("\n📦 Import Factures...");
const factures = JSON.parse(readFileSync("scripts/factures.json", "utf-8"));

for (const f of factures) {
    const { error } = await supabase.from("factures").upsert(f, {
        onConflict: "airtable_id",
    });
    if (error) {
        console.error(`❌ Erreur pour ${f.numero_facture}:`, error.message);
    } else {
        console.log(`✅ ${f.numero_facture}`);
    }
}

console.log("\n🎉 Import terminé !");
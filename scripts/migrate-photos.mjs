// scripts/migrate-photos.mjs
import Airtable from "airtable";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(nom) {
    return nom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function downloadImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer);
    } catch (err) {
        console.error(`❌ Impossible de télécharger: ${url}`);
        return null;
    }
}

async function uploadToSupabase(buffer, filename, folder) {
    const ext = filename?.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
        .from("photos")
        .upload(path, buffer, {
            contentType: `image/${ext === "png" ? "png" : "jpeg"}`,
            upsert: true,
        });

    if (error) {
        console.error(`❌ Upload échoué: ${error.message}`);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(path);

    return urlData.publicUrl;
}

async function migratePhotos() {
    console.log("📦 Récupération des données fraîches depuis Airtable...");
    const records = await base("Mandataire").select({}).all();
    console.log(`✅ ${records.length} mandataires récupérés\n`);

    for (const record of records) {
        const nom = record.get("Nom complet") || "Inconnu";
        const airtableId = record.id;
        const dossierNom = slugify(nom);

        console.log(`\n👤 ${nom} → dossier: ${dossierNom}`);

        const { data: mandataire } = await supabase
            .from("mandataires")
            .select("id, photos_pro")
            .eq("airtable_id", airtableId)
            .single();

        if (!mandataire) {
            console.log(`  ⚠️ Non trouvé dans Supabase — ignoré`);
            continue;
        }

        const newPhotosAi = [];
        const newPhotosDetoure = [];

        // Photos AI
        const photosAi = record.get("Photo AI") || [];
        for (const photo of photosAi) {
            console.log(`  🤖 AI: ${photo.filename}`);
            const buffer = await downloadImage(photo.url);
            if (!buffer) continue;
            const newUrl = await uploadToSupabase(buffer, photo.filename, `${dossierNom}/ai`);
            if (newUrl) newPhotosAi.push({ url: newUrl, filename: photo.filename });
        }

        // Photos Détourées
        const photosDetoure = record.get("Photo Détouré") || [];
        for (const photo of photosDetoure) {
            console.log(`  ✂️ Détouré: ${photo.filename}`);
            const buffer = await downloadImage(photo.url);
            if (!buffer) continue;
            const newUrl = await uploadToSupabase(buffer, photo.filename, `${dossierNom}/detoure`);
            if (newUrl) newPhotosDetoure.push({ url: newUrl, filename: photo.filename });
        }

        // Mettre à jour Supabase — garder photos_pro existantes
        const { error: updateError } = await supabase
            .from("mandataires")
            .update({
                photos_ai: newPhotosAi,
                photos_detoure: newPhotosDetoure,
                updated_at: new Date().toISOString(),
            })
            .eq("id", mandataire.id);

        if (updateError) {
            console.error(`❌ Erreur update ${nom}: ${updateError.message}`);
        } else {
            console.log(`✅ ${nom} — AI: ${newPhotosAi.length}, Détouré: ${newPhotosDetoure.length}`);
        }
    }

    console.log("\n🎉 Migration terminée !");
}

migratePhotos().catch(console.error);
// scripts/export-airtable.mjs
import Airtable from "airtable";
import { writeFileSync } from "fs";
import { mkdirSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID);

function safeString(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
        const first = value[0];
        if (!first) return "";
        if (typeof first === "string") return first;
        return first.name || first.email || first.text || "";
    }
    if (typeof value === "object") {
        return value.name || value.email || value.text || value.value || "";
    }
    return "";
}

function extractPhotos(attachments) {
    if (!attachments || !Array.isArray(attachments)) return [];
    return attachments.map((a) => ({ url: a.url, filename: a.filename }));
}

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").map((v) => v.trim());
}

mkdirSync("scripts", { recursive: true });

// Export Mandataires
console.log("📦 Export Mandataires...");
const mandataireRecords = await base("Mandataire").select({}).all();
const mandataires = mandataireRecords.map((record) => ({
    airtable_id: record.id,
    nom: safeString(record.get("Nom complet")),
    telephone: safeString(record.get("Téléphone")),
    email: safeString(record.get("Email")),
    zone: safeString(record.get("Zone d'activité")),
    site: safeString(record.get("Site Internet")),
    forfait: record.get("Forfait") || "PRESENCE",
    statut: safeString(record.get("Statut")),
    date_onboarding: safeString(record.get("Date onboarding")),
    biographie: safeString(record.get("Biographie")),
    bio_instagram: safeString(record.get("Bio Instagram")),
    bio_facebook: safeString(record.get("Bio Facebook")),
    type_clientele: toArray(record.get("Type clientèle")),
    type_biens: toArray(record.get("Type de biens")),
    photos_pro: extractPhotos(record.get("Photo pro")),
    photos_ai: extractPhotos(record.get("Photo AI")),
    photos_detoure: extractPhotos(record.get("Photo Détouré")),
    gerant: safeString(record.get("Gérant")),
    score: safeString(record.get("Score Actuel")),
}));

writeFileSync("scripts/mandataires.json", JSON.stringify(mandataires, null, 2));
console.log(`✅ ${mandataires.length} mandataires exportés`);

// Export Facturation
console.log("📦 Export Facturation...");
const factureRecords = await base("Facturation").select({}).all();
const factures = factureRecords.map((record) => ({
    airtable_id: record.id,
    facture_id: safeString(record.get("Facture_id")),
    numero_facture: safeString(record.get("Numéro_Facture")),
    mandataire_nom: safeString(record.get("Mandataire")),
    forfait: safeString(record.get("Forfait")),
    mode_paiement: safeString(record.get("Mode de Paiement")),
    date_paiement: safeString(record.get("Date Paiement")) || null,
    periode: safeString(record.get("Periode")),
    montant: Number(record.get("Montant")) || 0,
    devise: safeString(record.get("Devise")) || "FCFA",
    date_emission: safeString(record.get("Date Émission")) || null,
    date_echeance: safeString(record.get("Date Échéance")) || null,
    periodicite: safeString(record.get("Périodicité")),
    statut: safeString(record.get("Statut Auto")),
    reference_paiement: safeString(record.get("Référence Paiement")),
}));

writeFileSync("scripts/factures.json", JSON.stringify(factures, null, 2));
console.log(`✅ ${factures.length} factures exportées`);

console.log("🎉 Export terminé !");
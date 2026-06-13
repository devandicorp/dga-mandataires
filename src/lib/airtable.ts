// src/lib/airtable.ts

import Airtable from "airtable";

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface Mandataire {
    id: string;
    nom: string;
    telephone: string;
    email: string;
    zone: string;
    site: string;
    forfait: "PRESENCE" | "PROSPECTION";
    statut: string;
    date_onboarding: string;
    biographie: string;
    bio_instagram: string;
    bio_facebook: string;
    type_clientele: string[];
    type_biens: string[];
    photos_pro: string[];
    photos_ai: string[];
    photos_detoure: string[];
    gerant: string;
    score: string;
}

function safeString(value: any): string {
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

function extractPhotos(attachments: any[]): string[] {
    if (!attachments || !Array.isArray(attachments)) return [];
    return attachments.map((a) => a.url);
}

function toArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").map((v: string) => v.trim());
}

function mapRecord(record: any): Mandataire {
    return {
        id: record.id,
        nom: safeString(record.get("Nom complet")),
        telephone: safeString(record.get("Téléphone")),
        email: safeString(record.get("Email")),
        zone: safeString(record.get("Zone d'activité")),
        site: safeString(record.get("Site Internet")),
        forfait: (record.get("Forfait") as "PRESENCE" | "PROSPECTION") || "PRESENCE",
        statut: safeString(record.get("Statut")),
        date_onboarding: safeString(record.get("Date onboarding")),
        biographie: safeString(record.get("Biographie")),
        bio_instagram: safeString(record.get("Bio Instagram")),
        bio_facebook: safeString(record.get("Bio Facebook")),
        type_clientele: toArray(record.get("Type clientèle")),
        type_biens: toArray(record.get("Type de biens")),
        photos_pro: extractPhotos(record.get("Photo pro") as any[]),
        photos_ai: extractPhotos(record.get("Photo AI") as any[]),
        photos_detoure: extractPhotos(record.get("Photo Détouré") as any[]),
        gerant: safeString(record.get("Gérant")),
        score: safeString(record.get("Score Actuel")),
    };
}

export async function getMandataires(): Promise<Mandataire[]> {
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
        .select({ view: "Grid view" })
        .all();
    return records.map(mapRecord);
}

export async function getMandataireById(id: string): Promise<Mandataire | null> {
    try {
        const record = await base(process.env.AIRTABLE_TABLE_NAME!).find(id);
        return mapRecord(record);
    } catch {
        return null;
    }
}
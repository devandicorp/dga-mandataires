// src/lib/facturation.ts

import Airtable from "airtable";

const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

export interface Facture {
    id: string;
    facture_id: string;
    numero_facture: string;
    mandataire: string;
    forfait: string;
    photo_facture: string;
    mode_paiement: string;
    date_paiement: string;
    periode: string;
    montant: number;
    devise: string;
    date_emission: string;
    date_echeance: string;
    periodicite: string;
    statut: string;
    reference_paiement: string;
}

function extractPhoto(attachments: any[]): string {
    if (!attachments || !Array.isArray(attachments)) return "";
    return attachments[0]?.url || "";
}

function safeString(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
        const first = value[0];
        if (!first) return "";
        if (typeof first === "string") return first;
        return first.name || first.email || "";
    }
    if (typeof value === "object") {
        return value.name || value.email || value.value || "";
    }
    return "";
}

function mapFacture(record: any): Facture {
    return {
        id: record.id,
        facture_id: safeString(record.get("Facture_id")),
        numero_facture: safeString(record.get("Numéro_Facture")),
        mandataire: safeString(record.get("Mandataire")),
        forfait: safeString(record.get("Forfait")),
        photo_facture: extractPhoto(record.get("Photo_facture") as any[]),
        mode_paiement: safeString(record.get("Mode de Paiement")),
        date_paiement: safeString(record.get("Date Paiement")),
        periode: safeString(record.get("Periode")),
        montant: Number(record.get("Montant")) || 0,
        devise: safeString(record.get("Devise")) || "FCFA",
        date_emission: safeString(record.get("Date Émission")),
        date_echeance: safeString(record.get("Date Échéance")),
        periodicite: safeString(record.get("Périodicité")),
        statut: safeString(record.get("Statut Auto")),
        reference_paiement: safeString(record.get("Référence Paiement")),
    };
}

export async function getFactures(): Promise<Facture[]> {
    const records = await base("Facturation")
        .select({ view: "Grid view" })
        .all();
    return records.map(mapFacture);
}

export async function getFactureById(id: string): Promise<Facture | null> {
    try {
        const record = await base("Facturation").find(id);
        return mapFacture(record);
    } catch {
        return null;
    }
}

export async function getFacturesByMandataire(nomMandataire: string): Promise<Facture[]> {
    const records = await base("Facturation")
        .select({
            view: "Grid view",
            filterByFormula: `{Mandataire} = "${nomMandataire}"`,
        })
        .all();
    return records.map(mapFacture);
}
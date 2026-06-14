// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Mandataire {
    id: string;
    airtable_id: string;
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
    photos_pro: { url: string; filename: string }[];
    photos_ai: { url: string; filename: string }[];
    photos_detoure: { url: string; filename: string }[];
    gerant: string;
    score: string;
    facebook_page_id: string | null;
    facebook_page_token: string | null;
}

export interface Facture {
    id: string;
    airtable_id: string;
    facture_id: string;
    numero_facture: string;
    mandataire_nom: string;
    forfait: string;
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

// ---- Mandataires ----

export async function getMandataires(): Promise<Mandataire[]> {
    const { data, error } = await supabase
        .from("mandataires")
        .select("*")
        .order("nom", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getMandataireById(id: string): Promise<Mandataire | null> {
    const { data, error } = await supabase
        .from("mandataires")
        .select("*")
        .eq("id", id)
        .single();
    if (error) return null;
    return data;
}

export async function updateMandataire(id: string, fields: Partial<Mandataire>): Promise<boolean> {
    const { error } = await supabase
        .from("mandataires")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) throw new Error(error.message);
    return true;
}

// ---- Factures ----

export async function getFactures(): Promise<Facture[]> {
    const { data, error } = await supabase
        .from("factures")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getFactureById(id: string): Promise<Facture | null> {
    const { data, error } = await supabase
        .from("factures")
        .select("*")
        .eq("id", id)
        .single();
    if (error) return null;
    return data;
}

export async function getFacturesByMandataire(nom: string): Promise<Facture[]> {
    const { data, error } = await supabase
        .from("factures")
        .select("*")
        .eq("mandataire_nom", nom)
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createFacture(fields: Partial<Facture>): Promise<boolean> {
    const { error } = await supabase.from("factures").insert(fields);
    if (error) throw new Error(error.message);
    return true;
}

export async function updateFacture(id: string, fields: Partial<Facture>): Promise<boolean> {
    const { error } = await supabase
        .from("factures")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) throw new Error(error.message);
    return true;
}
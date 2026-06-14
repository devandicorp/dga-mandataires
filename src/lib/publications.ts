// src/lib/publications.ts
import { supabase } from "@/lib/supabase";

export interface Publication {
    id: string;
    mandataire_id: string;
    mandataire_nom: string;
    description: string;
    hashtags: string;
    cta_texte: string;
    cta_lien: string;
    medias: { url: string; filename: string; type: string }[];
    date_publication: string;
    plateforme: string;
    statut: "À planifier" | "Planifiée" | "Publiée";
    created_by: string;
    notes: string;
    facebook_post_id: string;
    created_at: string;
    updated_at: string;
}


export async function getPublications(): Promise<Publication[]> {
    const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("date_publication", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getPublicationsByMandataire(mandataireId: string): Promise<Publication[]> {
    const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("mandataire_id", mandataireId)
        .order("date_publication", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createPublication(fields: Partial<Publication>): Promise<boolean> {
    const { error } = await supabase.from("publications").insert(fields);
    if (error) throw new Error(error.message);
    return true;
}

export async function updatePublication(id: string, fields: Partial<Publication>): Promise<boolean> {
    const { error } = await supabase
        .from("publications")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) throw new Error(error.message);
    return true;
}

export async function deletePublication(id: string): Promise<boolean> {
    const { error } = await supabase.from("publications").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
}
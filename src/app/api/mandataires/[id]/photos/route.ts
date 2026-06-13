// src/app/api/mandataires/[id]/photos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

function slugify(nom: string): string {
    return nom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const DOSSIER_MAP: Record<string, string> = {
    photos_pro: "pro",
    photos_ai: "ai",
    photos_detoure: "detoure",
};

// Ajouter une photo
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const dossier = formData.get("dossier") as string;
        const file = formData.get("file") as File;

        if (!dossier || !file) {
            return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
        }

        const sousDossier = DOSSIER_MAP[dossier];
        if (!sousDossier) {
            return NextResponse.json({ success: false, error: "Dossier invalide" }, { status: 400 });
        }

        // Récupérer le mandataire pour avoir son nom
        const { data: mandataire, error: fetchError } = await supabase
            .from("mandataires")
            .select("id, nom, photos_pro, photos_ai, photos_detoure")
            .eq("id", id)
            .single();

        if (fetchError || !mandataire) {
            return NextResponse.json({ success: false, error: "Mandataire introuvable" }, { status: 404 });
        }

        const dossierNom = slugify(mandataire.nom);
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${dossierNom}/${sousDossier}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload dans Supabase Storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(path, buffer, {
                contentType: file.type || `image/${ext}`,
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        // Mettre à jour le tableau de photos dans Supabase
        const existingPhotos = (mandataire[dossier as keyof typeof mandataire] as any[]) || [];
        const updatedPhotos = [...existingPhotos, { url: publicUrl, filename: file.name }];

        const { error: updateError } = await supabase
            .from("mandataires")
            .update({
                [dossier]: updatedPhotos,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }
        revalidatePath(`/mandataires/${id}`);
        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error("Erreur POST photo:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Supprimer une photo
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { dossier, photoUrl } = body;

        // Récupérer le mandataire
        const { data: mandataire, error: fetchError } = await supabase
            .from("mandataires")
            .select("id, photos_pro, photos_ai, photos_detoure")
            .eq("id", id)
            .single();

        if (fetchError || !mandataire) {
            return NextResponse.json({ success: false, error: "Mandataire introuvable" }, { status: 404 });
        }

        // Supprimer de Supabase Storage
        const urlObj = new URL(photoUrl);
        const pathInStorage = urlObj.pathname.split("/photos/")[1];
        if (pathInStorage) {
            await supabase.storage.from("photos").remove([pathInStorage]);
        }

        // Mettre à jour le tableau
        const existingPhotos = (mandataire[dossier as keyof typeof mandataire] as any[]) || [];
        const updatedPhotos = existingPhotos.filter((p: any) => p.url !== photoUrl);

        const { error: updateError } = await supabase
            .from("mandataires")
            .update({
                [dossier]: updatedPhotos,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }
        revalidatePath(`/mandataires/${id}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erreur DELETE photo:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
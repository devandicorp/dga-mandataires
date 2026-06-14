// src/app/api/publications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data, error } = await supabase
            .from("publications")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateFields: Record<string, any> = {};
        if (body.mandataire_id !== undefined) updateFields.mandataire_id = body.mandataire_id;
        if (body.mandataire_nom !== undefined) updateFields.mandataire_nom = body.mandataire_nom;
        if (body.description !== undefined) updateFields.description = body.description;
        if (body.hashtags !== undefined) updateFields.hashtags = body.hashtags;
        if (body.cta_texte !== undefined) updateFields.cta_texte = body.cta_texte;
        if (body.cta_lien !== undefined) updateFields.cta_lien = body.cta_lien;
        if (body.medias !== undefined) updateFields.medias = body.medias;
        if (body.date_publication !== undefined) updateFields.date_publication = body.date_publication;
        if (body.plateforme !== undefined) updateFields.plateforme = body.plateforme;
        if (body.statut !== undefined) updateFields.statut = body.statut;
        if (body.notes !== undefined) updateFields.notes = body.notes;

        updateFields.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from("publications")
            .update(updateFields)
            .eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/calendrier");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Récupérer la publication pour avoir le facebook_post_id
        const { data: publication } = await supabase
            .from("publications")
            .select("facebook_post_id, mandataire_id, statut")
            .eq("id", id)
            .single();

        // Si publiée sur Facebook, supprimer aussi sur Facebook
        if (publication?.facebook_post_id && publication?.statut === "Publiée") {
            // Récupérer le token de la Page
            const { data: mandataire } = await supabase
                .from("mandataires")
                .select("facebook_page_token")
                .eq("id", publication.mandataire_id)
                .single();

            if (mandataire?.facebook_page_token) {
                const deleteRes = await fetch(
                    `https://graph.facebook.com/v21.0/${publication.facebook_post_id}`,
                    {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            access_token: mandataire.facebook_page_token,
                        }),
                    }
                );

                const deleteData = await deleteRes.json();
                if (deleteData.error) {
                    console.error("Erreur suppression Facebook:", deleteData.error.message);
                } else {
                    console.log("✅ Publication supprimée sur Facebook");
                }
            }
        }

        // Supprimer dans Supabase
        const { error } = await supabase.from("publications").delete().eq("id", id);
        if (error) throw new Error(error.message);

        revalidatePath("/calendrier");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
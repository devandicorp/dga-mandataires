// src/app/api/publications/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        const { publication_id } = await request.json();

        // Récupérer la publication
        const { data: publication, error: pubError } = await supabase
            .from("publications")
            .select("*")
            .eq("id", publication_id)
            .single();

        if (pubError || !publication) {
            return NextResponse.json({ success: false, error: "Publication introuvable" }, { status: 404 });
        }

        // Récupérer le token de la Page Facebook du mandataire
        const { data: mandataire, error: mandError } = await supabase
            .from("mandataires")
            .select("facebook_page_id, facebook_page_token, nom")
            .eq("id", publication.mandataire_id)
            .single();

        if (mandError || !mandataire) {
            return NextResponse.json({ success: false, error: "Mandataire introuvable" }, { status: 404 });
        }

        if (!mandataire.facebook_page_id || !mandataire.facebook_page_token) {
            return NextResponse.json({
                success: false,
                error: `Aucune Page Facebook associée à ${mandataire.nom}`
            }, { status: 400 });
        }

        // Construire le message
        const message = [
            publication.description,
            publication.hashtags,
        ].filter(Boolean).join("\n\n");

        // Publier sur Facebook
        let facebookPostId = null;

        if (publication.medias && publication.medias.length > 0) {
            // Publication avec image
            const firstMedia = publication.medias[0];

            const photoRes = await fetch(
                `https://graph.facebook.com/v21.0/${mandataire.facebook_page_id}/photos`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: firstMedia.url,
                        caption: message,
                        access_token: mandataire.facebook_page_token,
                    }),
                }
            );

            const photoData = await photoRes.json();

            if (photoData.error) {
                return NextResponse.json({
                    success: false,
                    error: `Erreur Facebook: ${photoData.error.message}`
                }, { status: 500 });
            }

            facebookPostId = photoData.post_id || photoData.id;

        } else {
            // Publication texte uniquement
            const postRes = await fetch(
                `https://graph.facebook.com/v21.0/${mandataire.facebook_page_id}/feed`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message,
                        access_token: mandataire.facebook_page_token,
                    }),
                }
            );

            const postData = await postRes.json();

            if (postData.error) {
                return NextResponse.json({
                    success: false,
                    error: `Erreur Facebook: ${postData.error.message}`
                }, { status: 500 });
            }

            facebookPostId = postData.id;
        }

        // Mettre à jour le statut de la publication
        // Mettre à jour le statut et sauvegarder le Post ID
        await supabase
            .from("publications")
            .update({
                statut: "Publiée",
                facebook_post_id: facebookPostId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", publication_id);

        revalidatePath("/calendrier");

        return NextResponse.json({
            success: true,
            facebook_post_id: facebookPostId,
            message: `Publication réussie sur la Page de ${mandataire.nom}`
        });

    } catch (error: any) {
        console.error("Erreur publication Facebook:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
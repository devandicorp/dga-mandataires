// src/app/api/publications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("publications")
            .select("*")
            .order("date_publication", { ascending: true });

        if (error) throw new Error(error.message);
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Récupérer le token Facebook du mandataire si fourni
        let facebookPostId = null;

        if (body.mandataire_id && body.date_publication) {
            const { data: mandataire } = await supabase
                .from("mandataires")
                .select("facebook_page_id, facebook_page_token, nom")
                .eq("id", body.mandataire_id)
                .single();

            if (mandataire?.facebook_page_id && mandataire?.facebook_page_token) {
                const publishDate = new Date(body.date_publication);
                const now = new Date();
                const message = [body.description, body.hashtags].filter(Boolean).join("\n\n");

                if (publishDate > now) {
                    // Publication planifiée
                    const scheduledTime = Math.floor(publishDate.getTime() / 1000);

                    const res = await fetch(
                        `https://graph.facebook.com/v21.0/${mandataire.facebook_page_id}/feed`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                message,
                                scheduled_publish_time: scheduledTime,
                                published: false,
                                access_token: mandataire.facebook_page_token,
                            }),
                        }
                    );

                    const data = await res.json();
                    if (!data.error) {
                        facebookPostId = data.id;
                        body.statut = "Planifiée";
                    }
                }
            }
        }

        const { error } = await supabase.from("publications").insert({
            mandataire_id: body.mandataire_id,
            mandataire_nom: body.mandataire_nom,
            description: body.description,
            hashtags: body.hashtags,
            cta_texte: body.cta_texte,
            cta_lien: body.cta_lien,
            medias: body.medias || [],
            date_publication: body.date_publication,
            plateforme: body.plateforme || "Facebook",
            statut: body.statut || "À planifier",
            created_by: body.created_by,
            notes: body.notes,
            facebook_post_id: facebookPostId,
        });

        if (error) throw new Error(error.message);

        revalidatePath("/calendrier");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
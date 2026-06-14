// src/app/api/cron/check-publications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
    // Vérifier le token secret pour sécuriser le cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date().toISOString();

        // Récupérer les publications planifiées dont la date est passée
        const { data: publications, error } = await supabase
            .from("publications")
            .select("id, facebook_post_id, mandataire_id, mandataire_nom")
            .eq("statut", "Planifiée")
            .lte("date_publication", now);

        if (error) throw new Error(error.message);
        if (!publications || publications.length === 0) {
            return NextResponse.json({ message: "Aucune publication à mettre à jour" });
        }

        let updated = 0;

        for (const pub of publications) {
            // Vérifier sur Facebook si la publication est bien publiée
            if (pub.facebook_post_id) {
                const { data: mandataire } = await supabase
                    .from("mandataires")
                    .select("facebook_page_token")
                    .eq("id", pub.mandataire_id)
                    .single();

                if (mandataire?.facebook_page_token) {
                    const res = await fetch(
                        `https://graph.facebook.com/v21.0/${pub.facebook_post_id}?fields=is_published&access_token=${mandataire.facebook_page_token}`
                    );
                    const data = await res.json();

                    if (data.is_published) {
                        await supabase
                            .from("publications")
                            .update({ statut: "Publiée", updated_at: new Date().toISOString() })
                            .eq("id", pub.id);
                        updated++;
                    }
                }
            } else {
                // Pas de post Facebook — mettre à jour quand même
                await supabase
                    .from("publications")
                    .update({ statut: "Publiée", updated_at: new Date().toISOString() })
                    .eq("id", pub.id);
                updated++;
            }
        }

        revalidatePath("/calendrier");
        return NextResponse.json({ message: `${updated} publications mises à jour` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
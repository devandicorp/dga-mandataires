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
        });

        if (error) throw new Error(error.message);

        revalidatePath("/calendrier");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
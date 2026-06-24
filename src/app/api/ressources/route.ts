// src/app/api/ressources/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mandataire_id = searchParams.get("mandataire_id");

        let query = supabase.from("ressources").select("*").order("created_at", { ascending: false });
        if (mandataire_id) query = query.eq("mandataire_id", mandataire_id);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { error } = await supabase.from("ressources").insert({
            mandataire_id: body.mandataire_id,
            titre: body.titre,
            description: body.description,
            type: body.type,
            fichier_url: body.fichier_url,
            fichier_nom: body.fichier_nom,
            mois: body.mois,
            created_by: body.created_by,
        });
        if (error) throw new Error(error.message);
        revalidatePath("/mandataires");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
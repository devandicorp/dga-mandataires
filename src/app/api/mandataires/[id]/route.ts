// src/app/api/mandataires/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateFields: Record<string, any> = {};
        if (body.nom !== undefined) updateFields.nom = body.nom;
        if (body.telephone !== undefined) updateFields.telephone = body.telephone;
        if (body.email !== undefined) updateFields.email = body.email;
        if (body.zone !== undefined) updateFields.zone = body.zone;
        if (body.site !== undefined) updateFields.site = body.site;
        if (body.forfait !== undefined) updateFields.forfait = body.forfait;
        if (body.statut !== undefined) updateFields.statut = body.statut;
        if (body.biographie !== undefined) updateFields.biographie = body.biographie;
        if (body.bio_instagram !== undefined) updateFields.bio_instagram = body.bio_instagram;
        if (body.bio_facebook !== undefined) updateFields.bio_facebook = body.bio_facebook;
        if (body.type_clientele !== undefined) updateFields.type_clientele = body.type_clientele;
        if (body.type_biens !== undefined) updateFields.type_biens = body.type_biens;

        updateFields.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from("mandataires")
            .update(updateFields)
            .eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/");
        revalidatePath(`/mandataires/${id}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
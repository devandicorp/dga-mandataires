// src/app/api/facturation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mandataire = searchParams.get("mandataire");

        let query = supabase.from("factures").select("*").order("created_at", { ascending: false });
        if (mandataire) query = query.eq("mandataire_nom", mandataire);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...fields } = body;

        const updateFields: Record<string, any> = {};
        if (fields.mode_paiement !== undefined) updateFields.mode_paiement = fields.mode_paiement;
        if (fields.date_paiement !== undefined) updateFields.date_paiement = fields.date_paiement;
        if (fields.reference_paiement !== undefined) updateFields.reference_paiement = fields.reference_paiement;
        if (fields.periodicite !== undefined) updateFields.periodicite = fields.periodicite;
        if (fields.statut !== undefined) updateFields.statut = fields.statut;

        updateFields.updated_at = new Date().toISOString();

        const { error } = await supabase.from("factures").update(updateFields).eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/facturation");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
// src/app/api/facturation/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { error } = await supabase.from("factures").insert({
            mandataire_nom: body.mandataire,
            forfait: body.forfait,
            montant: Number(body.montant),
            periode: body.periode,
            date_emission: body.date_emission,
            date_echeance: body.date_echeance,
            mode_paiement: body.mode_paiement,
            reference_paiement: body.reference_paiement,
            date_paiement: body.date_paiement,
            periodicite: body.periodicite,
            devise: "FCFA",
            statut: "Payée",
        });

        if (error) throw new Error(error.message);
        revalidatePath("/facturation");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
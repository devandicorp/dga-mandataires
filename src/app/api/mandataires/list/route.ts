// src/app/api/mandataires/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMandataires } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const full = searchParams.get("full");

        const mandataires = await getMandataires();

        if (full === "true") {
            return NextResponse.json(mandataires);
        }

        return NextResponse.json(
            mandataires.map((m) => ({
                id: m.id,
                nom: m.nom,
                forfait: m.forfait,
            }))
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
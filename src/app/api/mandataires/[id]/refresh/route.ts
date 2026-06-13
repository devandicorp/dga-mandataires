// src/app/api/mandataires/[id]/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMandataireById } from "@/lib/supabase";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const mandataire = await getMandataireById(id);
        if (!mandataire) {
            return NextResponse.json({ error: "Introuvable" }, { status: 404 });
        }
        return NextResponse.json({
            photos_pro: mandataire.photos_pro,
            photos_ai: mandataire.photos_ai,
            photos_detoure: mandataire.photos_detoure,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// src/app/api/ressources/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function slugify(nom: string): string {
    return nom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const mandataire_nom = formData.get("mandataire_nom") as string;
        const mandataire_id = formData.get("mandataire_id") as string;

        if (!file) {
            return NextResponse.json({ success: false, error: "Fichier manquant" }, { status: 400 });
        }

        const dossierNom = slugify(mandataire_nom || mandataire_id);
        const ext = file.name.split(".").pop() || "pdf";
        const path = `${dossierNom}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: uploadError } = await supabase.storage
            .from("ressources")
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from("ressources").getPublicUrl(path);

        return NextResponse.json({ success: true, url: urlData.publicUrl, filename: file.name });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
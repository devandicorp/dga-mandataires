// src/app/api/publications/upload/route.ts
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
        const mandataireNom = formData.get("mandataire_nom") as string;

        if (!file) {
            return NextResponse.json({ success: false, error: "Fichier manquant" }, { status: 400 });
        }

        const dossierNom = slugify(mandataireNom || "publications");
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${dossierNom}/publications/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);

        return NextResponse.json({ success: true, url: urlData.publicUrl });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
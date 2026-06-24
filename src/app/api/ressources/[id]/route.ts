// src/app/api/ressources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Récupérer le fichier pour supprimer du storage
        const { data: ressource } = await supabase
            .from("ressources")
            .select("fichier_url, mandataire_id")
            .eq("id", id)
            .single();

        // Supprimer du storage si fichier existe
        if (ressource?.fichier_url) {
            const url = new URL(ressource.fichier_url);
            const path = url.pathname.split("/ressources/")[1];
            if (path) {
                await supabase.storage.from("ressources").remove([path]);
            }
        }

        // Supprimer de la DB
        const { error } = await supabase.from("ressources").delete().eq("id", id);
        if (error) throw new Error(error.message);

        revalidatePath("/mandataires");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
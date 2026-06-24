// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Client admin avec service role key pour créer des utilisateurs
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, nom, role, mandataire_id } = body;

        // Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            app_metadata: { role, actif: true },
        });

        if (authError) throw new Error(authError.message);

        // Créer le profil dans la table users
        const { error: profileError } = await supabaseAdmin.from("users").insert({
            id: authData.user.id,
            email,
            nom,
            role,
            mandataire_id: mandataire_id || null,
            actif: true,
        });

        if (profileError) {
            // Supprimer l'utilisateur auth si le profil échoue
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new Error(profileError.message);
        }

        return NextResponse.json({ success: true, id: authData.user.id });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
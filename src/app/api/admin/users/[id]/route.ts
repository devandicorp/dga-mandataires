// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { error } = await supabaseAdmin
            .from("users")
            .update(body)
            .eq("id", id);

        if (error) throw new Error(error.message);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error: profileError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", id);

        if (profileError) throw new Error(profileError.message);

        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw new Error(authError.message);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
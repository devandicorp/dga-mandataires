// src/app/api/email/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { supabase } from "@/lib/supabase";
import { encrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, email_pro, password } = body;

        if (!email_pro || !password) {
            return NextResponse.json({ success: false, error: "Email et mot de passe requis" }, { status: 400 });
        }

        // Tester la connexion IMAP
        const client = new ImapFlow({
            host: "mail.dgaimmo.com",
            port: 993,
            secure: true,
            auth: {
                user: email_pro,
                pass: password,
            },
            logger: false,
        });

        try {
            await client.connect();
            await client.logout();
        } catch (imapError: any) {
            return NextResponse.json({
                success: false,
                error: "Identifiants email incorrects ou serveur inaccessible"
            }, { status: 401 });
        }

        // Chiffrer et sauvegarder
        const encryptedPassword = encrypt(password);

        const { error } = await supabase
            .from("users")
            .update({
                email_pro,
                email_pro_password_encrypted: encryptedPassword,
            })
            .eq("id", user_id);

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erreur connexion email:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
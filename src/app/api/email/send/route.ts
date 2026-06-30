// src/app/api/email/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, to, subject, html, cc, bcc } = body;

        if (!user_id || !to || !subject) {
            return NextResponse.json({ success: false, error: "Champs requis manquants" }, { status: 400 });
        }

        const { data: user } = await supabase
            .from("users")
            .select("email_pro, email_pro_password_encrypted")
            .eq("id", user_id)
            .single();

        if (!user?.email_pro || !user?.email_pro_password_encrypted) {
            return NextResponse.json({ success: false, error: "Email pro non configuré" }, { status: 400 });
        }

        const password = decrypt(user.email_pro_password_encrypted);

        const transporter = nodemailer.createTransport({
            host: "mail.dgaimmo.com",
            port: 465,
            secure: true,
            auth: {
                user: user.email_pro,
                pass: password,
            },
        });

        await transporter.sendMail({
            from: user.email_pro,
            to,
            cc: cc || undefined,
            bcc: bcc || undefined,
            subject,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erreur envoi email:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
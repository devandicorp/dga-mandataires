// src/app/api/email/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("user_id");
        const uid = searchParams.get("uid");
        const folder = searchParams.get("folder") || "INBOX";

        if (!user_id || !uid) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }

        const { data: user } = await supabase
            .from("users")
            .select("email_pro, email_pro_password_encrypted")
            .eq("id", user_id)
            .single();

        if (!user?.email_pro || !user?.email_pro_password_encrypted) {
            return NextResponse.json({ error: "Email pro non configuré" }, { status: 400 });
        }

        const password = decrypt(user.email_pro_password_encrypted);

        const client = new ImapFlow({
            host: "mail.dgaimmo.com",
            port: 993,
            secure: true,
            auth: {
                user: user.email_pro,
                pass: password,
            },
            logger: false,
        });

        await client.connect();
        const lock = await client.getMailboxLock(folder);

        let emailData: any = null;

        try {
            const message = await client.fetchOne(uid, { source: true, uid: true }, { uid: true });

            if (message && message.source) {
                const parsed = await simpleParser(message.source);

                emailData = {
                    uid: message.uid,
                    from: parsed.from?.value[0]?.address || "",
                    fromName: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address || "",
                    to: parsed.to ? (Array.isArray(parsed.to) ? parsed.to.map(t => t.text).join(", ") : parsed.to.text) : "",
                    subject: parsed.subject || "(Sans objet)",
                    date: parsed.date,
                    html: parsed.html || parsed.textAsHtml || "",
                    text: parsed.text || "",
                    attachments: parsed.attachments?.map(a => ({
                        filename: a.filename,
                        size: a.size,
                        contentType: a.contentType,
                    })) || [],
                };

                // Marquer comme lu
                await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
            }
        } finally {
            lock.release();
        }

        await client.logout();

        if (!emailData) {
            return NextResponse.json({ error: "Email introuvable" }, { status: 404 });
        }

        return NextResponse.json({ success: true, email: emailData });
    } catch (error: any) {
        console.error("Erreur lecture email:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
// src/app/api/email/inbox/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("user_id");
        const folder = searchParams.get("folder") || "INBOX";
        const limit = parseInt(searchParams.get("limit") || "20");

        if (!user_id) {
            return NextResponse.json({ error: "user_id requis" }, { status: 400 });
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
        const emails: any[] = [];

        try {
            const messages = client.fetch(
                { seq: "1:*" },
                { envelope: true, flags: true, uid: true, bodyStructure: true }
            );

            const allMessages: any[] = [];
            for await (const msg of messages) {
                allMessages.push(msg);
            }

            // Prendre les N derniers (les plus récents)
            const recent = allMessages.slice(-limit).reverse();

            for (const msg of recent) {
                emails.push({
                    uid: msg.uid,
                    from: msg.envelope.from?.[0]?.address || "Inconnu",
                    fromName: msg.envelope.from?.[0]?.name || msg.envelope.from?.[0]?.address || "Inconnu",
                    subject: msg.envelope.subject || "(Sans objet)",
                    date: msg.envelope.date,
                    isRead: msg.flags?.has("\\Seen") || false,
                    isFlagged: msg.flags?.has("\\Flagged") || false,
                });
            }
        } finally {
            lock.release();
        }

        await client.logout();

        return NextResponse.json({ success: true, emails });
    } catch (error: any) {
        console.error("Erreur lecture inbox:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
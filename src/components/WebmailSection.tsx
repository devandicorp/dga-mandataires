// src/components/WebmailSection.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Mail, Inbox, Send, Loader2, X, Reply,
    Paperclip, ChevronLeft, RefreshCw, Lock
} from "lucide-react";

interface Props {
    userId: string;
    emailPro: string | null;
}

interface EmailListItem {
    uid: number;
    from: string;
    fromName: string;
    subject: string;
    date: string;
    isRead: boolean;
}

interface EmailFull {
    uid: number;
    from: string;
    fromName: string;
    to: string;
    subject: string;
    date: string;
    html: string;
    text: string;
    attachments: any[];
}

export default function WebmailSection({ userId, emailPro }: Props) {
    const [connected, setConnected] = useState(!!emailPro);
    const [connecting, setConnecting] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);
    const [emailInput, setEmailInput] = useState(emailPro || "");
    const [passwordInput, setPasswordInput] = useState("");

    const [emails, setEmails] = useState<EmailListItem[]>([]);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<EmailFull | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [composing, setComposing] = useState(false);
    const [sending, setSending] = useState(false);
    const [composeForm, setComposeForm] = useState({ to: "", subject: "", html: "" });

    useEffect(() => {
        if (connected) {
            loadInbox();
        }
    }, [connected]);

    const handleConnect = async () => {
        if (!emailInput || !passwordInput) {
            setConnectError("Veuillez remplir tous les champs");
            return;
        }
        setConnecting(true);
        setConnectError(null);

        try {
            const res = await fetch("/api/email/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, email_pro: emailInput, password: passwordInput }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setConnected(true);
            setPasswordInput("");
        } catch (err: any) {
            setConnectError(err.message);
        } finally {
            setConnecting(false);
        }
    };

    const loadInbox = async () => {
        setLoadingEmails(true);
        try {
            const res = await fetch(`/api/email/inbox?user_id=${userId}&limit=20`);
            const data = await res.json();
            if (data.success) setEmails(data.emails);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingEmails(false);
        }
    };

    const openEmail = async (uid: number) => {
        setLoadingDetail(true);
        setSelectedEmail(null);
        try {
            const res = await fetch(`/api/email/read?user_id=${userId}&uid=${uid}`);
            const data = await res.json();
            if (data.success) {
                setSelectedEmail(data.email);
                setEmails((prev) => prev.map((e) => e.uid === uid ? { ...e, isRead: true } : e));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSend = async () => {
        if (!composeForm.to || !composeForm.subject) return;
        setSending(true);
        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    to: composeForm.to,
                    subject: composeForm.subject,
                    html: composeForm.html.replace(/\n/g, "<br>"),
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setComposing(false);
            setComposeForm({ to: "", subject: "", html: "" });
        } catch (err: any) {
            alert("Erreur envoi : " + err.message);
        } finally {
            setSending(false);
        }
    };

    // Formulaire de connexion email
    if (!connected) {
        return (
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                <div className="text-center mb-6">
                    <Lock size={28} className="text-cyan-400 mx-auto mb-3" />
                    <h2 className="text-white font-semibold text-lg">Connecter votre messagerie pro</h2>
                    <p className="text-white/40 text-sm mt-1">
                        Accédez à vos emails directement depuis votre espace
                    </p>
                </div>

                {connectError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {connectError}
                    </div>
                )}

                <div className="space-y-4 max-w-sm mx-auto">
                    <div>
                        <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email pro</label>
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="votre.nom@dgaimmo.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20"
                        />
                    </div>
                    <div>
                        <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mot de passe</label>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20"
                        />
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {connecting && <Loader2 size={14} className="animate-spin" />}
                        Connecter ma messagerie
                    </button>
                    <p className="text-white/20 text-xs text-center">
                        Vos identifiants sont chiffrés et stockés en sécurité.<br />Connexion à faire une seule fois.
                    </p>
                </div>
            </div>
        );
    }

    // Vue détail d'un email
    if (selectedEmail) {
        return (
            <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <button onClick={() => setSelectedEmail(null)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={18} className="text-white/60" />
                    </button>
                    <span className="text-white font-medium text-sm">Retour à la boîte de réception</span>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <h2 className="text-white font-semibold text-lg">{selectedEmail.subject}</h2>
                        <div className="flex items-center justify-between mt-2">
                            <div>
                                <p className="text-white/70 text-sm">{selectedEmail.fromName}</p>
                                <p className="text-white/30 text-xs">{selectedEmail.from}</p>
                            </div>
                            <span className="text-white/30 text-xs">
                                {new Date(selectedEmail.date).toLocaleString("fr-FR")}
                            </span>
                        </div>
                    </div>

                    {selectedEmail.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedEmail.attachments.map((att, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 border border-white/5">
                                    <Paperclip size={10} />
                                    {att.filename}
                                </span>
                            ))}
                        </div>
                    )}

                    <div
                        className="prose prose-invert prose-sm max-w-none text-white/70 border-t border-white/5 pt-4"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html || selectedEmail.text.replace(/\n/g, "<br>") }}
                    />

                    <button
                        onClick={() => {
                            setComposeForm({ to: selectedEmail.from, subject: "Re: " + selectedEmail.subject, html: "" });
                            setComposing(true);
                            setSelectedEmail(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-sm transition-all"
                    >
                        <Reply size={14} />
                        Répondre
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Inbox size={16} className="text-cyan-400" />
                    <span className="text-white font-medium text-sm">Boîte de réception</span>
                    <span className="text-white/30 text-xs">({emails.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadInbox} disabled={loadingEmails} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <RefreshCw size={14} className={`text-white/40 ${loadingEmails ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => { setComposeForm({ to: "", subject: "", html: "" }); setComposing(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-medium"
                    >
                        <Send size={12} />
                        Nouveau
                    </button>
                </div>
            </div>

            {/* Liste emails */}
            {loadingEmails ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-cyan-400" />
                </div>
            ) : emails.length === 0 ? (
                <div className="py-12 text-center">
                    <Mail size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Aucun email</p>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {emails.map((email) => (
                        <button
                            key={email.uid}
                            onClick={() => openEmail(email.uid)}
                            className="w-full text-left px-5 py-3.5 hover:bg-white/[0.02] transition-colors flex items-center gap-3"
                        >
                            {!email.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                            <div className={`flex-1 min-w-0 ${email.isRead ? "ml-5" : ""}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <p className={`text-sm truncate ${email.isRead ? "text-white/50" : "text-white font-medium"}`}>
                                        {email.fromName}
                                    </p>
                                    <span className="text-white/30 text-xs shrink-0">
                                        {new Date(email.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                                    </span>
                                </div>
                                <p className={`text-xs truncate mt-0.5 ${email.isRead ? "text-white/30" : "text-white/60"}`}>
                                    {email.subject}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Modal composition */}
            {composing && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-[#111118] border border-white/10 rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <span className="text-white font-medium text-sm">Nouveau message</span>
                            <button onClick={() => setComposing(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={16} className="text-white/60" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <input
                                type="email"
                                value={composeForm.to}
                                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                                placeholder="Destinataire"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20"
                            />
                            <input
                                type="text"
                                value={composeForm.subject}
                                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                                placeholder="Objet"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20"
                            />
                            <textarea
                                value={composeForm.html}
                                onChange={(e) => setComposeForm({ ...composeForm, html: e.target.value })}
                                placeholder="Votre message..."
                                rows={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none placeholder:text-white/20"
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
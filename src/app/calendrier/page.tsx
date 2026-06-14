// src/app/calendrier/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Calendrier from "@/components/Calendrier";
import { Publication } from "@/lib/publications";
import { X, Globe, Clock, User, Hash, ExternalLink, Trash2, Pencil, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CalendrierPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Publication | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
    const [publishError, setPublishError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/publications")
            .then((res) => res.json())
            .then((data) => {
                setPublications(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette publication ?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setPublications((prev) => prev.filter((p) => p.id !== id));
            setSelected(null);
        } catch (err: any) {
            alert("Erreur : " + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handlePublish = async (id: string) => {
        if (!confirm("Publier cette publication sur Facebook maintenant ?")) return;
        setPublishing(true);
        setPublishSuccess(null);
        setPublishError(null);

        try {
            const res = await fetch("/api/publications/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publication_id: id }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setPublishSuccess(data.message);
            setPublications((prev) =>
                prev.map((p) => p.id === id ? { ...p, statut: "Publiée" } : p)
            );
            if (selected?.id === id) {
                setSelected((prev) => prev ? { ...prev, statut: "Publiée" } : prev);
            }
        } catch (err: any) {
            setPublishError("Erreur : " + err.message);
        } finally {
            setPublishing(false);
        }
    };

    const STATUT_COLORS: Record<string, string> = {
        "À planifier": "bg-white/10 text-white/60 border-white/10",
        "Planifiée": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "Publiée": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">

                {/* Header */}
                <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Calendrier de Publication</h1>
                        <p className="text-white/40 text-sm mt-1">
                            {publications.length} publication{publications.length !== 1 ? "s" : ""} planifiée{publications.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Stats rapides */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-white/40" />
                            <span className="text-white/50 text-xs">{publications.filter(p => p.statut === "À planifier").length} à planifier</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-blue-400 text-xs">{publications.filter(p => p.statut === "Planifiée").length} planifiées</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 text-xs">{publications.filter(p => p.statut === "Publiée").length} publiées</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <Calendrier
                            publications={publications}
                            onSelectPublication={setSelected}
                        />
                    )}
                </div>

            </main>

            {/* Panel détail publication */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
                    <div className="relative w-[480px] h-full bg-[#0D0D12] border-l border-white/5 overflow-y-auto">

                        {/* Header panel */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0D0D12] z-10">
                            <h2 className="text-white font-semibold">Détail Publication</h2>
                            <div className="flex items-center gap-2">
                                {selected.statut !== "Publiée" && (
                                    <button
                                        onClick={() => handlePublish(selected.id)}
                                        disabled={publishing}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-xs transition-all disabled:opacity-50"
                                    >
                                        {publishing ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Globe size={12} />
                                        )}
                                        Publier
                                    </button>
                                )}
                                <Link href={`/calendrier/${selected.id}/edit`} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <Pencil size={16} className="text-white/60" />
                                </Link>
                                <button onClick={() => handleDelete(selected.id)} disabled={deleting} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 size={16} className="text-red-400/60 hover:text-red-400" />
                                </button>
                                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={16} className="text-white/60" />
                                </button>
                            </div>
                        </div>

                        {publishSuccess && (
                            <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                                ✅ {publishSuccess}
                            </div>
                        )}
                        {publishError && (
                            <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                ❌ {publishError}
                            </div>
                        )}

                        <div className="px-6 py-5 space-y-5">

                            {/* Statut + Plateforme */}
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${STATUT_COLORS[selected.statut]}`}>
                                    {selected.statut}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                                    <Globe size={12} />
                                    {selected.plateforme}
                                </span>
                            </div>

                            {/* Mandataire */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <User size={13} className="text-white/30" />
                                    <span className="text-white/40 text-xs uppercase tracking-wider">Mandataire</span>
                                </div>
                                <p className="text-white font-medium">{selected.mandataire_nom}</p>
                            </div>

                            {/* Date */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={13} className="text-white/30" />
                                    <span className="text-white/40 text-xs uppercase tracking-wider">Date de publication</span>
                                </div>
                                <p className="text-white">
                                    {selected.date_publication
                                        ? new Date(selected.date_publication).toLocaleDateString("fr-FR", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "—"}
                                </p>
                            </div>

                            {/* Description */}
                            {selected.description && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Description</p>
                                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                                        {selected.description}
                                    </p>
                                </div>
                            )}

                            {/* Hashtags */}
                            {selected.hashtags && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Hash size={13} className="text-white/30" />
                                        <span className="text-white/40 text-xs uppercase tracking-wider">Hashtags</span>
                                    </div>
                                    <p className="text-cyan-400/70 text-sm">{selected.hashtags}</p>
                                </div>
                            )}

                            {/* CTA */}
                            {(selected.cta_texte || selected.cta_lien) && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Bouton CTA</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-sm">{selected.cta_texte}</span>
                                        {selected.cta_lien && (
                                            <a href={selected.cta_lien} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    {selected.cta_lien && (
                                        <p className="text-white/30 text-xs mt-1 truncate">{selected.cta_lien}</p>
                                    )}
                                </div>
                            )}

                            {/* Médias */}
                            {selected.medias && selected.medias.length > 0 && (
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                                        Médias ({selected.medias.length})
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selected.medias.map((media, index) => (
                                            <div key={index} className="aspect-square rounded-xl overflow-hidden border border-white/5">
                                                <img src={media.url} alt={media.filename} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selected.notes && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Notes internes</p>
                                    <p className="text-white/60 text-sm">{selected.notes}</p>
                                </div>
                            )}

                            {/* Créé par */}
                            {selected.created_by && (
                                <p className="text-white/20 text-xs text-center">
                                    Créé par {selected.created_by}
                                </p>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
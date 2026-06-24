// src/components/RessourcesSection.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2, Trash2, Download, FolderOpen, Plus } from "lucide-react";

interface Ressource {
    id: string;
    titre: string;
    description: string;
    type: string;
    fichier_url: string;
    fichier_nom: string;
    mois: string;
    created_by: string;
    created_at: string;
}

interface Props {
    mandataireId: string;
    mandataireNom: string;
}

const TYPE_OPTIONS = [
    { value: "rapport", label: "📊 Rapport statistique" },
    { value: "carte_visite", label: "🪪 Carte de visite" },
    { value: "document", label: "📄 Document" },
];

const MOIS_OPTIONS = [
    "Janvier 2026", "Février 2026", "Mars 2026", "Avril 2026",
    "Mai 2026", "Juin 2026", "Juillet 2026", "Août 2026",
    "Septembre 2026", "Octobre 2026", "Novembre 2026", "Décembre 2026",
];

const TYPE_LABELS: Record<string, string> = {
    rapport: "📊 Rapport",
    carte_visite: "🪪 Carte de visite",
    document: "📄 Document",
};

export default function RessourcesSection({ mandataireId, mandataireNom }: Props) {
    const [ressources, setRessources] = useState<Ressource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        titre: "",
        description: "",
        type: "rapport",
        mois: "Juin 2026",
        created_by: "",
        fichier_url: "",
        fichier_nom: "",
    });

    useEffect(() => {
        fetch(`/api/ressources?mandataire_id=${mandataireId}`)
            .then((res) => res.json())
            .then((data) => {
                setRessources(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [mandataireId]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);

        try {
            const file = files[0];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("mandataire_id", mandataireId);
            formData.append("mandataire_nom", mandataireNom);

            const res = await fetch("/api/ressources/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setForm((prev) => ({
                ...prev,
                fichier_url: data.url,
                fichier_nom: data.filename,
                titre: prev.titre || data.filename,
            }));
        } catch (err: any) {
            setError("Erreur upload : " + err.message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        if (!form.titre) {
            setError("Veuillez ajouter un titre");
            return;
        }
        if (!form.fichier_url) {
            setError("Veuillez uploader un fichier");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/ressources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, mandataire_id: mandataireId }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // Recharger les ressources
            const updated = await fetch(`/api/ressources?mandataire_id=${mandataireId}`).then(r => r.json());
            setRessources(updated);
            setShowForm(false);
            setForm({ titre: "", description: "", type: "rapport", mois: "Juin 2026", created_by: "", fichier_url: "", fichier_nom: "" });
        } catch (err: any) {
            setError("Erreur : " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette ressource ?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/ressources/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setRessources((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
            setError("Erreur : " + err.message);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-white font-semibold text-lg">Ressources</h2>
                    <p className="text-white/30 text-sm mt-0.5">
                        {ressources.length} ressource{ressources.length !== 1 ? "s" : ""} partagée{ressources.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={14} />
                    Ajouter
                </button>
            </div>

            {/* Erreur */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Formulaire ajout */}
            {showForm && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-4">
                    <h3 className="text-white font-medium">Nouvelle ressource</h3>

                    {/* Upload fichier */}
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-center gap-3"
                    >
                        <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                <span className="text-cyan-400 text-sm">Upload en cours...</span>
                            </>
                        ) : form.fichier_nom ? (
                            <>
                                <span className="text-emerald-400 text-sm">✅ {form.fichier_nom}</span>
                            </>
                        ) : (
                            <>
                                <Upload size={16} className="text-white/30" />
                                <span className="text-white/40 text-sm">Cliquer pour uploader un fichier</span>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Titre *</label>
                            <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Type</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t.value} value={t.value} className="bg-[#111118]">{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mois concerné</label>
                            <select value={form.mois} onChange={(e) => setForm({ ...form, mois: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                {MOIS_OPTIONS.map((m) => (
                                    <option key={m} value={m} className="bg-[#111118]">{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Créé par</label>
                            <input type="text" value={form.created_by} onChange={(e) => setForm({ ...form, created_by: e.target.value })} placeholder="Votre nom..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Description</label>
                            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description optionnelle..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                            Enregistrer
                        </button>
                        <button onClick={() => { setShowForm(false); setError(null); }} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Liste des ressources */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-cyan-400" />
                </div>
            ) : ressources.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center">
                    <FolderOpen size={32} className="text-white/10 mx-auto mb-2" />
                    <p className="text-white/20 text-sm">Aucune ressource partagée</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ressources.map((res) => (
                        <div key={res.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                                {TYPE_LABELS[res.type]?.split(" ")[0] || "📄"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{res.titre}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-white/40 text-xs">{TYPE_LABELS[res.type]?.split(" ").slice(1).join(" ")}</span>
                                    {res.mois && <span className="text-white/30 text-xs">{res.mois}</span>}
                                    {res.created_by && <span className="text-white/20 text-xs">par {res.created_by}</span>}
                                </div>
                                {res.description && <p className="text-white/30 text-xs mt-1">{res.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {res.fichier_url && (
                                    <a href={res.fichier_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                                        <Download size={14} />
                                    </a>
                                )}
                                <button onClick={() => handleDelete(res.id)} disabled={deleting === res.id} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all disabled:opacity-50">
                                    {deleting === res.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
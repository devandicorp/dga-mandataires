// src/app/calendrier/nouvelle/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Save, Loader2, Upload, X, Image } from "lucide-react";
import Link from "next/link";

interface Mandataire {
    id: string;
    nom: string;
    forfait: string;
}

interface MediaItem {
    url: string;
    filename: string;
    type: string;
}

export default function NouvellePublication() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [mandataires, setMandataires] = useState<Mandataire[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        mandataire_id: "",
        mandataire_nom: "",
        description: "",
        hashtags: "",
        cta_texte: "",
        cta_lien: "",
        date_publication: "",
        plateforme: "Facebook",
        statut: "À planifier",
        created_by: "",
        notes: "",
    });

    const [medias, setMedias] = useState<MediaItem[]>([]);

    useEffect(() => {
        fetch("/api/mandataires/list")
            .then((res) => res.json())
            .then((data) => {
                setMandataires(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleMandataireChange = (id: string) => {
        const m = mandataires.find((m) => m.id === id);
        setForm((prev) => ({
            ...prev,
            mandataire_id: id,
            mandataire_nom: m?.nom || "",
        }));
    };

    const handleUploadMedia = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (!form.mandataire_id) {
            setError("Sélectionnez d'abord un mandataire");
            return;
        }
        setUploading(true);
        setError(null);

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("mandataire_id", form.mandataire_id);
                formData.append("mandataire_nom", form.mandataire_nom);

                const res = await fetch("/api/publications/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error);

                setMedias((prev) => [
                    ...prev,
                    { url: data.url, filename: file.name, type: file.type },
                ]);
            }
        } catch (err: any) {
            setError("Erreur upload : " + err.message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMedias((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!form.mandataire_id) {
            setError("Veuillez sélectionner un mandataire");
            return;
        }
        if (!form.date_publication) {
            setError("Veuillez choisir une date de publication");
            return;
        }
        if (!form.description) {
            setError("Veuillez ajouter une description");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/publications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, medias }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setSuccess(true);
            setTimeout(() => router.push("/calendrier"), 1000);
        } catch (err: any) {
            setError("Erreur : " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">

                {/* Header */}
                <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/calendrier" className="text-white/40 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold text-white">Nouvelle Publication</h1>
                            <p className="text-white/40 text-sm mt-0.5">Planifier une publication Facebook</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/calendrier" className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all">
                            Annuler
                        </Link>
                        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {success ? "Enregistré !" : "Enregistrer"}
                        </button>
                    </div>
                </div>

                <div className="px-8 py-6 max-w-3xl space-y-6">

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                            Publication créée ! Redirection...
                        </div>
                    )}

                    {/* Mandataire & Planification */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">1</span>
                            Mandataire & Planification
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mandataire</label>
                                {loading ? (
                                    <div className="flex items-center gap-2 text-white/30 text-sm">
                                        <Loader2 size={14} className="animate-spin" />Chargement...
                                    </div>
                                ) : (
                                    <select value={form.mandataire_id} onChange={(e) => handleMandataireChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                        <option value="" className="bg-[#111118]">— Choisir un mandataire —</option>
                                        {mandataires.map((m) => (
                                            <option key={m.id} value={m.id} className="bg-[#111118]">{m.nom}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Date & Heure de publication</label>
                                <input type="datetime-local" value={form.date_publication} onChange={(e) => handleChange("date_publication", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Statut</label>
                                <select value={form.statut} onChange={(e) => handleChange("statut", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                    <option value="À planifier" className="bg-[#111118]">À planifier</option>
                                    <option value="Planifiée" className="bg-[#111118]">Planifiée</option>
                                    <option value="Publiée" className="bg-[#111118]">Publiée</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Créé par</label>
                                <input type="text" value={form.created_by} onChange={(e) => handleChange("created_by", e.target.value)} placeholder="Votre nom..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Plateforme</label>
                                <select value={form.plateforme} onChange={(e) => handleChange("plateforme", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                    <option value="Facebook" className="bg-[#111118]">Facebook</option>
                                    <option value="Instagram" className="bg-[#111118]">Instagram</option>
                                    <option value="Facebook + Instagram" className="bg-[#111118]">Facebook + Instagram</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">2</span>
                            Contenu de la Publication
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Description</label>
                                <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={6} placeholder="Rédigez votre publication..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none placeholder:text-white/20" />
                                <p className="text-white/20 text-xs mt-1 text-right">{form.description.length} caractères</p>
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Hashtags</label>
                                <input type="text" value={form.hashtags} onChange={(e) => handleChange("hashtags", e.target.value)} placeholder="#immobilier #cotedivoire #investissement..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">3</span>
                            Bouton CTA
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Texte du bouton</label>
                                <input type="text" value={form.cta_texte} onChange={(e) => handleChange("cta_texte", e.target.value)} placeholder="Ex: Contactez-moi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Lien du bouton</label>
                                <input type="text" value={form.cta_lien} onChange={(e) => handleChange("cta_lien", e.target.value)} placeholder="https://wa.me/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Médias */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">4</span>
                            Médias
                        </h2>

                        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-6 cursor-pointer transition-all flex items-center justify-center gap-3 mb-4">
                            <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleUploadMedia(e.target.files)} />
                            {uploading ? (
                                <>
                                    <Loader2 size={18} className="text-cyan-400 animate-spin" />
                                    <span className="text-cyan-400 text-sm">Upload en cours...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={18} className="text-white/30" />
                                    <span className="text-white/40 text-sm">Cliquer pour ajouter des images ou vidéos</span>
                                </>
                            )}
                        </div>

                        {medias.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {medias.map((media, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
                                        {media.type.startsWith("video") ? (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                <Image size={24} className="text-white/30" />
                                                <span className="text-white/30 text-xs mt-1">{media.filename}</span>
                                            </div>
                                        ) : (
                                            <img src={media.url} alt={media.filename} className="w-full h-full object-cover" />
                                        )}
                                        <button onClick={() => handleRemoveMedia(index)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500/60 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <X size={12} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/40 text-xs">5</span>
                            Notes Internes
                        </h2>
                        <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} placeholder="Notes visibles uniquement par l'équipe..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none placeholder:text-white/20" />
                    </div>

                </div>
            </main>
        </div>
    );
}
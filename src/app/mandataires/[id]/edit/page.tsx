// src/app/mandataires/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PhotoUploader from "@/components/PhotoUploader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface PhotoItem {
    url: string;
    filename: string;
}

interface Mandataire {
    id: string;
    nom: string;
    telephone: string;
    email: string;
    zone: string;
    site: string;
    forfait: "PRESENCE" | "PROSPECTION";
    statut: string;
    date_onboarding: string;
    biographie: string;
    bio_instagram: string;
    bio_facebook: string;
    type_clientele: string[];
    type_biens: string[];
    photos_pro: PhotoItem[];
    photos_ai: PhotoItem[];
    photos_detoure: PhotoItem[];
    gerant: string;
    score: string;
}

const TYPE_BIENS_OPTIONS = ["Appartement", "Villa", "Terrain", "Bureau", "VEFA"];
const TYPE_CLIENTELE_OPTIONS = ["Primo-accédant", "Investisseur", "Vendeur", "Locataire"];

export default function EditMandataire() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [form, setForm] = useState<Mandataire | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/mandataires/${id}/load`)
            .then((res) => res.json())
            .then((data) => {
                setForm(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Impossible de charger les données");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (field: keyof Mandataire, value: any) => {
        setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const toggleArrayItem = (field: "type_biens" | "type_clientele", item: string) => {
        setForm((prev) => {
            if (!prev) return prev;
            const arr = prev[field] as string[];
            const updated = arr.includes(item)
                ? arr.filter((i) => i !== item)
                : [...arr, item];
            return { ...prev, [field]: updated };
        });
    };

    const handleSave = async () => {
        if (!form) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/mandataires/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nom: form.nom,
                    telephone: form.telephone,
                    email: form.email,
                    zone: form.zone,
                    site: form.site,
                    forfait: form.forfait,
                    statut: form.statut,
                    biographie: form.biographie,
                    bio_instagram: form.bio_instagram,
                    bio_facebook: form.bio_facebook,
                    type_clientele: form.type_clientele,
                    type_biens: form.type_biens,

                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setSuccess(true);
            setTimeout(() => {
                router.push(`/mandataires/${id}`);
            }, 1000);
        } catch (err: any) {
            setError("Erreur lors de la sauvegarde : " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex items-center justify-center">
                <Sidebar />
                <div className="ml-56 flex items-center gap-3">
                    <Loader2 size={20} className="animate-spin text-cyan-400" />
                    <span className="text-white/50">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-[#080810] text-white">
                <Sidebar />
                <div className="ml-56 flex items-center justify-center min-h-screen">
                    <p className="text-white/50">Mandataire introuvable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">

                {/* Header */}
                <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/mandataires/${id}`} className="text-white/40 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold text-white">Édition du Profil</h1>
                            <p className="text-white/40 text-sm mt-0.5">
                                Mettez à jour les informations de {form.nom}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/mandataires/${id}`}
                            className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
                        >
                            Annuler
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            {success ? "Enregistré !" : "Enregistrer"}
                        </button>
                    </div>
                </div>

                <div className="px-8 py-6 space-y-6">

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                            Modifications enregistrées ! Redirection...
                        </div>
                    )}

                    {/* Identité Professionnelle */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">1</span>
                            Identité Professionnelle
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    value={form.nom}
                                    onChange={(e) => handleChange("nom", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Téléphone</label>
                                <input
                                    type="text"
                                    value={form.telephone}
                                    onChange={(e) => handleChange("telephone", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Gérant</label>
                                <input
                                    type="text"
                                    value={form.gerant}
                                    onChange={(e) => handleChange("gerant", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zone & Forfait */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">2</span>
                            Zone & Forfait
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">{"Zone d'activité"}</label>
                                <input
                                    type="text"
                                    value={form.zone}
                                    onChange={(e) => handleChange("zone", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Site Internet</label>
                                <input
                                    type="text"
                                    value={form.site}
                                    onChange={(e) => handleChange("site", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Forfait</label>
                                <select
                                    value={form.forfait}
                                    onChange={(e) => handleChange("forfait", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                >
                                    <option value="PRESENCE" className="bg-[#111118]">PRÉSENCE</option>
                                    <option value="PROSPECTION" className="bg-[#111118]">PROSPECTION</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Statut</label>
                                <select
                                    value={form.statut}
                                    onChange={(e) => handleChange("statut", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                >
                                    <option value="Actif" className="bg-[#111118]">Actif</option>
                                    <option value="Inactif" className="bg-[#111118]">Inactif</option>
                                </select>
                            </div>
                        </div>

                        {/* Types de biens */}
                        <div className="mt-4">
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-3">Types de biens</label>
                            <div className="flex flex-wrap gap-2">
                                {TYPE_BIENS_OPTIONS.map((bien) => (
                                    <button
                                        key={bien}
                                        onClick={() => toggleArrayItem("type_biens", bien)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.type_biens.includes(bien)
                                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                            : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        {bien}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type clientèle */}
                        <div className="mt-4">
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-3">Type de clientèle</label>
                            <div className="flex flex-wrap gap-2">
                                {TYPE_CLIENTELE_OPTIONS.map((client) => (
                                    <button
                                        key={client}
                                        onClick={() => toggleArrayItem("type_clientele", client)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.type_clientele.includes(client)
                                            ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                                            : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        {client}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Biographie */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">3</span>
                            Biographie
                        </h2>
                        <textarea
                            value={form.biographie}
                            onChange={(e) => handleChange("biographie", e.target.value)}
                            rows={5}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                            placeholder="Biographie du mandataire..."
                        />
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">4</span>
                            Bios Réseaux Sociaux
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Bio Instagram</label>
                                <textarea
                                    value={form.bio_instagram}
                                    onChange={(e) => handleChange("bio_instagram", e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Bio Facebook</label>
                                <textarea
                                    value={form.bio_facebook}
                                    onChange={(e) => handleChange("bio_facebook", e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Galerie photos */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">5</span>
                            Galerie Photos
                        </h2>
                        <PhotoUploader
                            mandataireId={id}
                            dossier="photos_pro"
                            photos={form.photos_pro}
                            titre="Photos Pro"
                            couleur="cyan"
                            onUpdate={(photos) => handleChange("photos_pro", photos)}
                        />
                        <PhotoUploader
                            mandataireId={id}
                            dossier="photos_ai"
                            photos={form.photos_ai}
                            titre="Photos AI"
                            badge="Généré par IA"
                            couleur="violet"
                            onUpdate={(photos) => handleChange("photos_ai", photos)}
                        />
                        <PhotoUploader
                            mandataireId={id}
                            dossier="photos_detoure"
                            photos={form.photos_detoure}
                            titre="Photos Détourées"
                            badge="PNG Transparent"
                            couleur="emerald"
                            onUpdate={(photos) => handleChange("photos_detoure", photos)}
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}
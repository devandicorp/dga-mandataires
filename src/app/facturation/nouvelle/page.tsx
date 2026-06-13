// src/app/facturation/nouvelle/page.tsx
"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Mandataire {
    id: string;
    nom: string;
    forfait: string;
}

const FORFAIT_MONTANTS: Record<string, number> = {
    PRESENCE: 30000,
    PROSPECTION: 60000,
};

const MODES_PAIEMENT = ["Orange Money", "MTN Money", "Wave", "Virement", "Espèces"];
const PERIODES = [
    "Janvier 2026", "Février 2026", "Mars 2026", "Avril 2026",
    "Mai 2026", "Juin 2026", "Juillet 2026", "Août 2026",
    "Septembre 2026", "Octobre 2026", "Novembre 2026", "Décembre 2026",
];

function NouvelleFactureForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mandatairePreselect = searchParams.get("mandataire");
    const forfaitPreselect = searchParams.get("forfait");

    const [mandataires, setMandataires] = useState<Mandataire[]>([]);
    const [loadingMandataires, setLoadingMandataires] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30);

    const [form, setForm] = useState({
        mandataire: mandatairePreselect || "",
        forfait: forfaitPreselect || "PRESENCE",
        montant: forfaitPreselect ? FORFAIT_MONTANTS[forfaitPreselect] || 30000 : 30000,
        periode: "Juin 2026",
        date_emission: today,
        date_echeance: echeance.toISOString().split("T")[0],
        mode_paiement: "Orange Money",
        reference_paiement: "",
        date_paiement: today,
        periodicite: "Mensuelle",
    });

    useEffect(() => {
        fetch("/api/mandataires/list")
            .then((res) => res.json())
            .then((data) => {
                setMandataires(data);
                setLoadingMandataires(false);
            })
            .catch(() => setLoadingMandataires(false));
    }, []);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === "forfait") {
                updated.montant = FORFAIT_MONTANTS[value] || 30000;
            }
            return updated;
        });
    };

    const handleMandataireChange = (nom: string) => {
        const m = mandataires.find((m) => m.nom === nom);
        setForm((prev) => ({
            ...prev,
            mandataire: nom,
            forfait: m?.forfait || "PRESENCE",
            montant: FORFAIT_MONTANTS[m?.forfait || "PRESENCE"] || 30000,
        }));
    };

    const handleSave = async () => {
        if (!form.mandataire) {
            setError("Veuillez sélectionner un mandataire");
            return;
        }
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/facturation/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setSuccess(true);
            setTimeout(() => router.push("/facturation"), 1000);
        } catch (err: any) {
            setError("Erreur : " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="ml-56 min-h-screen">
            <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/facturation" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-white">Nouvelle Facture</h1>
                        <p className="text-white/40 text-sm mt-0.5">Créer une nouvelle ligne de facturation</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/facturation" className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all">
                        Annuler
                    </Link>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {success ? "Enregistré !" : "Enregistrer"}
                    </button>
                </div>
            </div>

            <div className="px-8 py-6 max-w-3xl space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                        Facture créée avec succès ! Redirection...
                    </div>
                )}

                {/* Mandataire */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">1</span>
                        Mandataire
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Sélectionner un mandataire</label>
                            {loadingMandataires ? (
                                <div className="flex items-center gap-2 text-white/30 text-sm">
                                    <Loader2 size={14} className="animate-spin" />Chargement...
                                </div>
                            ) : (
                                <select value={form.mandataire} onChange={(e) => handleMandataireChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                    <option value="" className="bg-[#111118]">— Choisir un mandataire —</option>
                                    {mandataires.map((m) => (
                                        <option key={m.id} value={m.nom} className="bg-[#111118]">{m.nom}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Forfait</label>
                            <select value={form.forfait} onChange={(e) => handleChange("forfait", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                <option value="PRESENCE" className="bg-[#111118]">PRÉSENCE</option>
                                <option value="PROSPECTION" className="bg-[#111118]">PROSPECTION</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Montant (FCFA)</label>
                            <input type="number" value={form.montant} onChange={(e) => handleChange("montant", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Période & Dates */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">2</span>
                        Période & Dates
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Période</label>
                            <select value={form.periode} onChange={(e) => handleChange("periode", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                {PERIODES.map((p) => (
                                    <option key={p} value={p} className="bg-[#111118]">{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Périodicité</label>
                            <select value={form.periodicite} onChange={(e) => handleChange("periodicite", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                <option value="Mensuelle" className="bg-[#111118]">Mensuelle</option>
                                <option value="Annuelle" className="bg-[#111118]">Annuelle</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Date Émission</label>
                            <input type="date" value={form.date_emission} onChange={(e) => handleChange("date_emission", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Date Échéance</label>
                            <input type="date" value={form.date_echeance} onChange={(e) => handleChange("date_echeance", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Paiement */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">3</span>
                        Paiement
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mode de Paiement</label>
                            <select value={form.mode_paiement} onChange={(e) => handleChange("mode_paiement", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                {MODES_PAIEMENT.map((m) => (
                                    <option key={m} value={m} className="bg-[#111118]">{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Date de Paiement</label>
                            <input type="date" value={form.date_paiement} onChange={(e) => handleChange("date_paiement", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Référence Paiement</label>
                            <input type="text" value={form.reference_paiement} onChange={(e) => handleChange("reference_paiement", e.target.value)} placeholder="Numéro de transaction..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function NouvelleFacture() {
    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <Suspense fallback={
                <main className="ml-56 min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </main>
            }>
                <NouvelleFactureForm />
            </Suspense>
        </div>
    );
}
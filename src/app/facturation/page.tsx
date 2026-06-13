// src/app/facturation/page.tsx
import { getFactures } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { TrendingUp, Clock, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

function StatutBadge({ statut }: { statut: string }) {
    const config: Record<string, string> = {
        "Payée": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        "En attente": "bg-amber-500/10 text-amber-400 border-amber-500/20",
        "En retard": "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const classes = config[statut] || "bg-white/5 text-white/40 border-white/10";
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${classes}`}>
            {statut || "—"}
        </span>
    );
}

export default async function FacturationPage() {
    const factures = await getFactures();

    const totalEncaisse = factures.filter((f) => f.statut === "Payée").reduce((sum, f) => sum + f.montant, 0);
    const totalEnAttente = factures.filter((f) => f.statut === "En attente").reduce((sum, f) => sum + f.montant, 0);
    const totalEnRetard = factures.filter((f) => f.statut === "En retard").reduce((sum, f) => sum + f.montant, 0);
    const nombrePayees = factures.filter((f) => f.statut === "Payée").length;
    const nombreEnAttente = factures.filter((f) => f.statut === "En attente").length;
    const nombreEnRetard = factures.filter((f) => f.statut === "En retard").length;

    const formatMontant = (montant: number) => new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">
                <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Facturation</h1>
                        <p className="text-white/40 text-sm mt-1">Suivi des paiements et revenus du réseau DGA Digital</p>
                    </div>
                    <Link href="/facturation/nouvelle" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span>+</span>
                        Nouvelle Facture
                    </Link>
                </div>

                <div className="px-8 py-6">
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/40 text-xs uppercase tracking-wider">Total Encaissé</span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatMontant(totalEncaisse)}</p>
                            <p className="text-emerald-400 text-xs mt-1">{nombrePayees} facture{nombrePayees > 1 ? "s" : ""} payée{nombrePayees > 1 ? "s" : ""}</p>
                        </div>

                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/40 text-xs uppercase tracking-wider">En Attente</span>
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <Clock size={14} className="text-amber-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatMontant(totalEnAttente)}</p>
                            <p className="text-amber-400 text-xs mt-1">{nombreEnAttente} facture{nombreEnAttente > 1 ? "s" : ""} en attente</p>
                        </div>

                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/40 text-xs uppercase tracking-wider">En Retard</span>
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle size={14} className="text-red-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatMontant(totalEnRetard)}</p>
                            <p className="text-red-400 text-xs mt-1">{nombreEnRetard} facture{nombreEnRetard > 1 ? "s" : ""} en retard</p>
                        </div>

                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/40 text-xs uppercase tracking-wider">Total Factures</span>
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                    <FileText size={14} className="text-cyan-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{factures.length}</p>
                            <p className="text-white/30 text-xs mt-1">Ce mois — Juin 2026</p>
                        </div>
                    </div>

                    <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-white font-semibold">
                                Toutes les Factures
                                <span className="text-white/30 font-normal text-sm ml-2">({factures.length})</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-cyan-500/50">
                                    <option value="">Tous les statuts</option>
                                    <option value="Payée">Payée</option>
                                    <option value="En attente">En attente</option>
                                    <option value="En retard">En retard</option>
                                </select>
                                <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-cyan-500/50">
                                    <option value="">Tous les forfaits</option>
                                    <option value="PRESENCE">Présence</option>
                                    <option value="PROSPECTION">Prospection</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Numéro</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Mandataire</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Forfait</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Période</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Montant</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Mode</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Échéance</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Statut</th>
                                        <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-wider font-medium">Preuve</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factures.map((facture, index) => (
                                        <tr key={facture.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}`}>
                                            <td className="px-6 py-4">
                                                <span className="text-cyan-400 text-sm font-mono">{facture.numero_facture || "—"}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white text-sm">{facture.mandataire_nom}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${facture.forfait === "PRESENCE" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                                                    {facture.forfait}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/60 text-sm">{facture.periode}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium text-sm">{formatMontant(facture.montant)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/60 text-sm">{facture.mode_paiement || "—"}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/60 text-sm">{facture.date_echeance || "—"}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatutBadge statut={facture.statut} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/20 text-xs">—</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
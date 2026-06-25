// src/components/MandataireEspace.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
    User, Calendar, FileText, Download,
    LogOut, MapPin, Phone, Mail, Globe,
    Clock, CheckCircle, Users, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
    mandataire: any;
    publications: any[];
    ressources: any[];
    leads: any[];
    userName: string;
}

const TABS = [
    { id: "profil", label: "Profil", icon: User },
    { id: "leads", label: "Leads", icon: Users },
    { id: "calendrier", label: "Calendrier", icon: Calendar },
    { id: "ressources", label: "Ressources", icon: FileText },
];

const STATUT_LEAD: Record<string, string> = {
    "Prospect Froid": "bg-white/10 text-white/50 border-white/10",
    "RDV Téléphonique": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Visite sur site": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Client": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const ACQUISITION_ICON: Record<string, string> = {
    "Site internet": "🌐",
    "Facebook": "📘",
    "Instagram": "📸",
    "LinkedIn": "💼",
    "Publicité": "📢",
};

const STATUT_PUB: Record<string, { color: string; icon: any }> = {
    "Planifiée": { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
    "Publiée": { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
};

const TYPE_LABELS: Record<string, string> = {
    rapport: "📊 Rapport",
    carte_visite: "🪪 Carte de visite",
    document: "📄 Document",
};

export default function MandataireEspace({ mandataire, publications, ressources, leads, userName }: Props) {
    const [activeTab, setActiveTab] = useState("profil");
    const router = useRouter();

    const photo = mandataire.photos_ai[0]?.url || mandataire.photos_pro[0]?.url || null;
    const initiales = mandataire.nom.split(" ").slice(0, 2).map((n: string) => n[0]).join("");

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.replace("/login");
    };

    return (
        <div className="min-h-screen bg-[#080810] text-white pb-24">

            {/* Header mobile */}
            <header className="sticky top-0 z-50 bg-[#080810]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {photo ? (
                        <img src={photo} alt={mandataire.nom} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center">
                            <span className="text-white/70 font-bold text-xs">{initiales}</span>
                        </div>
                    )}
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">{mandataire.nom}</p>
                        <p className="text-white/40 text-xs">DGA Digital Program</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all">
                    <LogOut size={16} />
                </button>
            </header>

            {/* Contenu */}
            <div className="px-4 py-4">

                {/* Tab Profil */}
                {activeTab === "profil" && (
                    <div className="space-y-4">

                        {/* Hero card */}
                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-4 mb-4">
                                {photo ? (
                                    <img src={photo} alt={mandataire.nom} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border-2 border-white/10 flex items-center justify-center">
                                        <span className="text-white/70 font-bold text-xl">{initiales}</span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-white font-bold text-base leading-tight">{mandataire.nom}</h1>
                                    {mandataire.zone && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin size={11} className="text-white/30" />
                                            <span className="text-white/50 text-xs">{mandataire.zone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mandataire.forfait === "PRESENCE" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                                            {mandataire.forfait}
                                        </span>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                            {mandataire.statut}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-2.5 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-cyan-400 shrink-0" />
                                    <span className="text-white/70 text-sm">{mandataire.telephone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-cyan-400 shrink-0" />
                                    <span className="text-white/60 text-sm truncate">{mandataire.email}</span>
                                </div>
                                {mandataire.site && (
                                    <div className="flex items-center gap-3">
                                        <Globe size={14} className="text-cyan-400 shrink-0" />
                                        <a href={"https://" + mandataire.site} target="_blank" rel="noopener noreferrer" className="text-cyan-400/70 text-sm truncate">
                                            {mandataire.site}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Biographie */}
                        {mandataire.biographie && (
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Biographie</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{mandataire.biographie}</p>
                            </div>
                        )}

                        {/* Spécialités */}
                        {(mandataire.type_biens?.length > 0 || mandataire.type_clientele?.length > 0) && (
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 space-y-4">
                                {mandataire.type_biens?.length > 0 && (
                                    <div>
                                        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Types de biens</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mandataire.type_biens.map((bien: string) => (
                                                <span key={bien} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 border border-white/5">{bien}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {mandataire.type_clientele?.length > 0 && (
                                    <div>
                                        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Clientèle</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mandataire.type_clientele.map((client: string) => (
                                                <span key={client} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400/70 border border-violet-500/10">{client}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Leads */}
                {activeTab === "leads" && (
                    <div className="space-y-4">
                        {/* KPIs */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: "Total", value: leads.length, color: "text-white" },
                                { label: "Froids", value: leads.filter(l => l.statut === "Prospect Froid").length, color: "text-white/50" },
                                { label: "En cours", value: leads.filter(l => ["RDV Téléphonique", "Visite sur site"].includes(l.statut)).length, color: "text-amber-400" },
                                { label: "Clients", value: leads.filter(l => l.statut === "Client").length, color: "text-emerald-400" },
                            ].map((kpi) => (
                                <div key={kpi.label} className="bg-[#111118] border border-white/5 rounded-xl p-3 text-center">
                                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                    <p className="text-white/30 text-xs mt-0.5">{kpi.label}</p>
                                </div>
                            ))}
                        </div>

                        {leads.length === 0 ? (
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center">
                                <Users size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Aucun lead pour le moment</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leads.map((lead) => (
                                    <div key={lead.id} className="bg-[#111118] border border-white/5 rounded-2xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-white font-medium text-sm">{lead.prenom} {lead.nom}</p>
                                                <p className="text-white/40 text-xs mt-0.5">{lead.telephone || lead.email}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${STATUT_LEAD[lead.statut] || "bg-white/5 text-white/40 border-white/10"}`}>
                                                {lead.statut}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                            <span className="text-white/40 text-xs">
                                                {ACQUISITION_ICON[lead.acquisition]} {lead.acquisition}
                                            </span>
                                            <span className="text-white/30 text-xs">
                                                {lead.date_acquisition ? new Date(lead.date_acquisition).toLocaleDateString("fr-FR") : "—"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Calendrier */}
                {activeTab === "calendrier" && (
                    <div className="space-y-3">
                        {publications.length === 0 ? (
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center">
                                <Calendar size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Aucune publication planifiée</p>
                            </div>
                        ) : (
                            publications.map((pub) => {
                                const statut = STATUT_PUB[pub.statut] || STATUT_PUB["Planifiée"];
                                const StatusIcon = statut.icon;
                                return (
                                    <div key={pub.id} className="bg-[#111118] border border-white/5 rounded-2xl p-4">
                                        <div className="flex items-start gap-3">
                                            {pub.medias?.[0] && (
                                                <img src={pub.medias[0].url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm leading-snug line-clamp-2">{pub.description}</p>
                                                {pub.date_publication && (
                                                    <p className="text-white/40 text-xs mt-2">
                                                        {format(new Date(pub.date_publication), "EEE d MMM yyyy · HH:mm", { locale: fr })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statut.color}`}>
                                                <StatusIcon size={10} />
                                                {pub.statut}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Tab Ressources */}
                {activeTab === "ressources" && (
                    <div className="space-y-3">
                        {ressources.length === 0 ? (
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center">
                                <FileText size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Aucune ressource disponible</p>
                            </div>
                        ) : (
                            ressources.map((res) => {
                                const ext = res.fichier_url?.split(".").pop()?.toLowerCase() || "";
                                const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
                                const isPdf = ext === "pdf";

                                return (
                                    <div key={res.id} className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">

                                        {/* Prévisualisation image */}
                                        {isImage && res.fichier_url && (
                                            <img
                                                src={res.fichier_url}
                                                alt={res.titre}
                                                className="w-full max-h-64 object-cover"
                                            />
                                        )}

                                        {/* Prévisualisation PDF */}
                                        {isPdf && res.fichier_url && (
                                            <iframe
                                                src={res.fichier_url}
                                                className="w-full h-64 border-0"
                                                title={res.titre}
                                            />
                                        )}

                                        {/* Infos + actions */}
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                                                {isImage ? "🖼️" : isPdf ? "📄" : TYPE_LABELS[res.type]?.split(" ")[0] || "📄"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{res.titre}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-white/40 text-xs">{TYPE_LABELS[res.type]?.split(" ").slice(1).join(" ")}</span>
                                                    {res.mois && <span className="text-white/30 text-xs">· {res.mois}</span>}
                                                </div>
                                            </div>
                                            {res.fichier_url && (
                                                <a href={res.fichier_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                                                    <Download size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Navigation bar mobile fixe en bas */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D12]/95 backdrop-blur-sm border-t border-white/5 px-4 py-2 z-50">
                <div className="flex items-center justify-around">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive ? "text-cyan-400" : "text-white/30"}`}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div >
    );
}
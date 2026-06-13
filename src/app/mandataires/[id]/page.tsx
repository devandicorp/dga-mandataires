import { getMandataireById, getMandataires } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import GalerieSection from "@/components/GalerieSection";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Calendar, User } from "lucide-react";

export const revalidate = 0;

export async function generateStaticParams() {
    const mandataires = await getMandataires();
    return mandataires.map((m) => ({ id: String(m.id) }));
}

interface Props {
    params: Promise<{ id: string }>;
}

export default async function FicheMandataire({ params }: Props) {
    const { id } = await params;
    const mandataire = await getMandataireById(id);
    if (!mandataire) return notFound();

    const photo = mandataire.photos_pro[0]?.url || null;
    const initiales = mandataire.nom.split(" ").slice(0, 2).map((n) => n[0]).join("");

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">

                {/* Header */}
                <div className="border-b border-white/5 px-8 py-6 flex items-center gap-4">
                    <Link href="/" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-white">Fiche Mandataire</h1>
                        <p className="text-white/40 text-sm mt-0.5">Mandataires / {mandataire.nom}</p>
                    </div>
                </div>

                <div className="px-8 py-6">

                    {/* Hero Card */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-6">

                            {/* Photo */}
                            <div className="relative shrink-0">
                                {photo ? (
                                    <img src={photo} alt={mandataire.nom} className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border-2 border-white/10 flex items-center justify-center">
                                        <span className="text-white/70 font-bold text-xl">{initiales}</span>
                                    </div>
                                )}
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#111118]" />
                            </div>

                            {/* Infos principales */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white leading-tight">{mandataire.nom}</h2>
                                        {mandataire.zone && (
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <MapPin size={13} className="text-white/30" />
                                                <span className="text-white/50 text-sm">{mandataire.zone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link href={`/mandataires/${id}/edit`} className="px-3 py-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs transition-all flex items-center gap-1.5">
                                            ✏️ Modifier
                                        </Link>
                                        <Link href={`/facturation/nouvelle?mandataire=${encodeURIComponent(mandataire.nom)}&forfait=${mandataire.forfait}`} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs transition-all flex items-center gap-1.5">
                                            💳 Facturer
                                        </Link>
                                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${mandataire.forfait === "PRESENCE" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                                            {mandataire.forfait}
                                        </span>
                                        <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                            {mandataire.statut}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={13} className="text-white/30" />
                                        <span className="text-white/40 text-sm">Onboarding : {mandataire.date_onboarding}</span>
                                    </div>
                                    {mandataire.gerant && (
                                        <div className="flex items-center gap-2">
                                            <User size={13} className="text-white/30" />
                                            <span className="text-white/40 text-sm">Gérant : {mandataire.gerant}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Contenu 2 colonnes */}
                    <div className="grid grid-cols-3 gap-6">

                        {/* Colonne gauche */}
                        <div className="col-span-1 space-y-4">

                            {/* Contact */}
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Contact</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone size={14} className="text-cyan-400 shrink-0" />
                                        <span className="text-white/70 text-sm">{mandataire.telephone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail size={14} className="text-cyan-400 shrink-0" />
                                        <span className="text-white/70 text-sm truncate">{mandataire.email}</span>
                                    </div>
                                    {mandataire.site && (
                                        <div className="flex items-center gap-3">
                                            <Globe size={14} className="text-cyan-400 shrink-0" />
                                            <a href={"https://" + mandataire.site} target="_blank" rel="noopener noreferrer" className="text-cyan-400/70 hover:text-cyan-400 text-sm truncate transition-colors">
                                                {mandataire.site}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Types de biens */}
                            {mandataire.type_biens.length > 0 && (
                                <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Types de biens</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mandataire.type_biens.map((bien) => (
                                            <span key={bien} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 border border-white/5">
                                                {bien}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clientèle */}
                            {mandataire.type_clientele.length > 0 && (
                                <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Type de clientèle</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mandataire.type_clientele.map((client) => (
                                            <span key={client} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400/70 border border-violet-500/10">
                                                {client}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Biographie */}
                            {mandataire.biographie && (
                                <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Biographie</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">{mandataire.biographie}</p>
                                </div>
                            )}

                            {/* Réseaux sociaux */}
                            {(mandataire.bio_instagram || mandataire.bio_facebook) && (
                                <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Bios Réseaux Sociaux</h3>
                                    {mandataire.bio_instagram && (
                                        <div className="mb-4">
                                            <p className="text-white/30 text-xs mb-2">Instagram</p>
                                            <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{mandataire.bio_instagram}</p>
                                        </div>
                                    )}
                                    {mandataire.bio_facebook && (
                                        <div>
                                            <p className="text-white/30 text-xs mb-2">Facebook</p>
                                            <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{mandataire.bio_facebook}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Colonne droite — Galerie */}
                        <div className="col-span-2">
                            <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                                <GalerieSection
                                    photos_pro={mandataire.photos_pro}
                                    photos_ai={mandataire.photos_ai}
                                    photos_detoure={mandataire.photos_detoure}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
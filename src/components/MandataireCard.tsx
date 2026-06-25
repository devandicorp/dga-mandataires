// src/components/MandataireCard.tsx
"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Mandataire } from "@/lib/supabase";

interface Props {
    mandataire: Mandataire;
}

export default function MandataireCard({ mandataire }: Props) {
    const photo = mandataire.photos_ai[0]?.url || mandataire.photos_pro[0]?.url || null;
    const initiales = mandataire.nom
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("");

    return (
        <Link href={`/mandataires/${mandataire.id}`}>
            <div className="group bg-[#111118] border border-white/5 rounded-2xl p-5 hover:border-white/20 hover:bg-[#16161f] transition-all duration-300 cursor-pointer h-full flex flex-col">

                {/* Photo + Badge */}
                <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                        {photo ? (
                            <img
                                src={photo}
                                alt={mandataire.nom}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border-2 border-white/10 flex items-center justify-center">
                                <span className="text-white/70 font-semibold text-sm">
                                    {initiales}
                                </span>
                            </div>
                        )}
                        {/* Point vert statut actif */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#111118]" />
                    </div>

                    {/* Badge forfait */}
                    <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${mandataire.forfait === "PRESENCE"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                            }`}
                    >
                        {mandataire.forfait}
                    </span>
                </div>

                {/* Nom */}
                <h3 className="text-white font-semibold text-sm leading-tight mb-1 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {mandataire.nom}
                </h3>

                {/* Zone */}
                {mandataire.zone && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <MapPin size={11} className="text-white/30 shrink-0" />
                        <span className="text-white/40 text-xs truncate">
                            {mandataire.zone}
                        </span>
                    </div>
                )}

                {/* Séparateur */}
                <div className="border-t border-white/5 mt-auto pt-3 space-y-1.5">
                    {/* Téléphone */}
                    <div className="flex items-center gap-2">
                        <Phone size={11} className="text-white/30 shrink-0" />
                        <span className="text-white/50 text-xs truncate">
                            {mandataire.telephone}
                        </span>
                    </div>
                    {/* Email */}
                    <div className="flex items-center gap-2">
                        <Mail size={11} className="text-white/30 shrink-0" />
                        <span className="text-white/50 text-xs truncate">
                            {mandataire.email}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
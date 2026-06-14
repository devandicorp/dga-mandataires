// src/components/Calendrier.tsx
"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Publication } from "@/lib/publications";
import Link from "next/link";

interface Props {
    publications: Publication[];
    onSelectPublication: (pub: Publication) => void;
}

const STATUT_COLORS = {
    "À planifier": "bg-white/10 text-white/60 border-white/10",
    "Planifiée": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Publiée": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const STATUT_DOT = {
    "À planifier": "bg-white/40",
    "Planifiée": "bg-blue-400",
    "Publiée": "bg-emerald-400",
};

export default function Calendrier({ publications, onSelectPublication }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Ajouter des jours vides au début pour aligner avec le bon jour de la semaine
    const firstDayOfWeek = monthStart.getDay();
    const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const getPublicationsForDay = (day: Date) => {
        return publications.filter((pub) => {
            if (!pub.date_publication) return false;
            return isSameDay(new Date(pub.date_publication), day);
        });
    };

    return (
        <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={16} className="text-white/60" />
                    </button>
                    <h2 className="text-white font-semibold capitalize">
                        {format(currentDate, "MMMM yyyy", { locale: fr })}
                    </h2>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronRight size={16} className="text-white/60" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-xs text-white/40 hover:text-white px-3 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                        Aujourd'hui
                    </button>
                </div>
                <Link href="/calendrier/nouvelle" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus size={14} />
                    Nouvelle Publication
                </Link>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 border-b border-white/5">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((jour) => (
                    <div key={jour} className="py-3 text-center text-white/30 text-xs font-medium uppercase tracking-wider">
                        {jour}
                    </div>
                ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7">
                {/* Jours vides */}
                {Array.from({ length: emptyDays }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-white/5 bg-white/[0.01]" />
                ))}

                {/* Jours du mois */}
                {days.map((day, index) => {
                    const dayPublications = getPublicationsForDay(day);
                    const isCurrentDay = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const col = (emptyDays + index) % 7;
                    const isLastCol = col === 6;

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[120px] border-b border-white/5 p-2 ${!isLastCol ? "border-r" : ""} ${isCurrentDay ? "bg-cyan-500/5" : ""}`}
                        >
                            {/* Numéro du jour */}
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay
                                    ? "bg-cyan-500 text-white"
                                    : isCurrentMonth
                                        ? "text-white/70"
                                        : "text-white/20"
                                    }`}>
                                    {format(day, "d")}
                                </span>
                                {dayPublications.length > 0 && (
                                    <span className="text-white/30 text-xs">{dayPublications.length}</span>
                                )}
                            </div>

                            {/* Publications du jour */}
                            <div className="space-y-1">
                                {dayPublications.slice(0, 3).map((pub) => (
                                    <button
                                        key={pub.id}
                                        onClick={() => onSelectPublication(pub)}
                                        className={`w-full text-left px-2 py-1 rounded-lg border text-xs truncate transition-all hover:opacity-80 ${STATUT_COLORS[pub.statut]}`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUT_DOT[pub.statut]}`} />
                                            <span className="truncate">{pub.mandataire_nom}</span>
                                        </div>
                                    </button>
                                ))}
                                {dayPublications.length > 3 && (
                                    <p className="text-white/30 text-xs px-2">+{dayPublications.length - 3} autres</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-6 px-6 py-3 border-t border-white/5">
                {Object.entries(STATUT_DOT).map(([statut, color]) => (
                    <div key={statut} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-white/40 text-xs">{statut}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
// src/components/GalerieSection.tsx
"use client";

import { useState } from "react";
import { X, ZoomIn, FolderOpen } from "lucide-react";

interface PhotoItem {
    url: string;
    filename: string;
}

interface DossierProps {
    titre: string;
    badge?: string;
    photos: PhotoItem[];
    couleur: "cyan" | "violet" | "emerald";
}

interface PhotoItem {
    url: string;
    filename: string;
}

interface Props {
    photos_pro: PhotoItem[];
    photos_ai: PhotoItem[];
    photos_detoure: PhotoItem[];
}

const couleurs = {
    cyan: {
        folder: "text-cyan-400",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        border: "border-cyan-500/30",
        overlay: "from-cyan-500/20",
    },
    violet: {
        folder: "text-violet-400",
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        border: "border-violet-500/30",
        overlay: "from-violet-500/20",
    },
    emerald: {
        folder: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        border: "border-emerald-500/30",
        overlay: "from-emerald-500/20",
    },
};

function Dossier({ titre, badge, photos, couleur }: DossierProps) {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [ouvert, setOuvert] = useState(true);
    const c = couleurs[couleur];

    return (
        <div className="mb-8">
            {/* Header dossier */}
            <button
                onClick={() => setOuvert(!ouvert)}
                className="w-full flex items-center justify-between mb-4 group"
            >
                <div className="flex items-center gap-3">
                    <FolderOpen size={20} className={c.folder} />
                    <h3 className="text-white font-semibold text-base">{titre}</h3>
                    {badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.badge}`}>
                            {badge}
                        </span>
                    )}
                    <span className="text-white/30 text-sm">
                        {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <span className={`text-white/30 text-xs transition-transform duration-200 ${ouvert ? "rotate-0" : "-rotate-90"}`}>
                    ▼
                </span>
            </button>

            {/* Grille photos */}
            {ouvert && (
                <>
                    {photos.length === 0 ? (
                        <div className="border border-dashed border-white/10 rounded-xl p-8 text-center">
                            <FolderOpen size={32} className="text-white/10 mx-auto mb-2" />
                            <p className="text-white/20 text-sm">Aucune photo dans ce dossier</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setLightbox(photo.url)}
                                    className={`group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:${c.border} transition-all duration-200`}
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.filename || `Photo ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {/* Overlay hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${c.overlay} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center`}>
                                        <ZoomIn size={24} className="text-white drop-shadow-lg" />
                                    </div>
                                    {/* Numéro */}
                                    <span className="absolute top-2 left-2 text-xs text-white/50 bg-black/40 px-1.5 py-0.5 rounded-md">
                                        {index + 1}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={lightbox}
                        alt="Photo agrandie"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

export default function GalerieSection({ photos_pro, photos_ai, photos_detoure }: Props) {
    const total = photos_pro.length + photos_ai.length + photos_detoure.length;

    return (
        <div>
            {/* Header galerie */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-white font-semibold text-lg">Galerie</h2>
                    <p className="text-white/30 text-sm mt-0.5">
                        {total} photo{total !== 1 ? "s" : ""} au total
                    </p>
                </div>
            </div>

            {/* Dossiers */}
            <Dossier
                titre="Photos Pro"
                photos={photos_pro}
                couleur="cyan"
            />
            <Dossier
                titre="Photos AI"
                badge="Généré par IA"
                photos={photos_ai}
                couleur="violet"
            />
            <Dossier
                titre="Photos Détourées"
                badge="PNG Transparent"
                photos={photos_detoure}
                couleur="emerald"
            />
        </div>
    );
}
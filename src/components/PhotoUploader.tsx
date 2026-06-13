// src/components/PhotoUploader.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FolderOpen, ZoomIn } from "lucide-react";

interface PhotoItem {
    url: string;
    filename: string;
}

interface Props {
    mandataireId: string;
    dossier: "photos_pro" | "photos_ai" | "photos_detoure";
    photos: PhotoItem[];
    titre: string;
    badge?: string;
    couleur: "cyan" | "violet" | "emerald";
    onUpdate: (newPhotos: PhotoItem[]) => void;
}

const couleurs = {
    cyan: {
        folder: "text-cyan-400",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        upload: "border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5",
        uploadText: "text-cyan-400",
    },
    violet: {
        folder: "text-violet-400",
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        upload: "border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5",
        uploadText: "text-violet-400",
    },
    emerald: {
        folder: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        upload: "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5",
        uploadText: "text-emerald-400",
    },
};

export default function PhotoUploader({
    mandataireId,
    dossier,
    photos,
    titre,
    badge,
    couleur,
    onUpdate,
}: Props) {
    const [ouvert, setOuvert] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const c = couleurs[couleur];

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);

        try {
            const newPhotos = [...photos];

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("dossier", dossier);
                formData.append("file", file);

                const res = await fetch(`/api/mandataires/${mandataireId}/photos`, {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error);

                // Ajouter la nouvelle photo localement
                newPhotos.push({ url: data.url, filename: file.name });
            }

            onUpdate(newPhotos);
        } catch (err: any) {
            setError("Erreur lors de l'upload : " + err.message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleDelete = async (photo: PhotoItem) => {
        if (!confirm("Supprimer cette photo ?")) return;
        setDeleting(photo.url);
        setError(null);

        try {
            const res = await fetch(`/api/mandataires/${mandataireId}/photos`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dossier, photoUrl: photo.url }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            onUpdate(photos.filter((p) => p.url !== photo.url));
        } catch (err: any) {
            setError("Erreur lors de la suppression : " + err.message);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="mb-8">
            {/* Header dossier */}
            <button onClick={() => setOuvert(!ouvert)} className="w-full flex items-center justify-between mb-4 group">
                <div className="flex items-center gap-3">
                    <FolderOpen size={20} className={c.folder} />
                    <h3 className="text-white font-semibold text-base">{titre}</h3>
                    {badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.badge}`}>{badge}</span>
                    )}
                    <span className="text-white/30 text-sm">
                        {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <span className={`text-white/30 text-xs transition-transform duration-200 ${ouvert ? "rotate-0" : "-rotate-90"}`}>▼</span>
            </button>

            {ouvert && (
                <>
                    {/* Message erreur */}
                    {error && (
                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Zone upload */}
                    <div onClick={() => inputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 flex items-center justify-center gap-3 ${c.upload}`}>
                        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                        {uploading ? (
                            <>
                                <Loader2 size={18} className={`${c.uploadText} animate-spin`} />
                                <span className={`text-sm ${c.uploadText}`}>Upload en cours...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={18} className={c.uploadText} />
                                <span className={`text-sm ${c.uploadText}`}>Cliquer pour ajouter des photos</span>
                            </>
                        )}
                    </div>

                    {/* Grille photos */}
                    {photos.length === 0 ? (
                        <div className="border border-dashed border-white/10 rounded-xl p-8 text-center">
                            <FolderOpen size={32} className="text-white/10 mx-auto mb-2" />
                            <p className="text-white/20 text-sm">Aucune photo dans ce dossier</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {photos.map((photo, index) => (
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-white/5">
                                    <img src={photo.url} alt={photo.filename} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                        <button onClick={() => setLightbox(photo.url)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                                            <ZoomIn size={16} className="text-white" />
                                        </button>
                                        <button onClick={() => handleDelete(photo)} disabled={deleting === photo.url} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-all disabled:opacity-50">
                                            {deleting === photo.url ? (
                                                <Loader2 size={16} className="text-red-400 animate-spin" />
                                            ) : (
                                                <X size={16} className="text-red-400" />
                                            )}
                                        </button>
                                    </div>
                                    <span className="absolute top-2 left-2 text-xs text-white/50 bg-black/40 px-1.5 py-0.5 rounded-md">{index + 1}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
                        <X size={20} />
                    </button>
                    <img src={lightbox} alt="Photo agrandie" className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
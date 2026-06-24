// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, Loader2, Trash2, Edit2, Check, X } from "lucide-react";

interface Mandataire {
    id: string;
    nom: string;
}

interface AppUser {
    id: string;
    email: string;
    nom: string;
    role: "admin" | "employe" | "mandataire";
    mandataire_id: string | null;
    actif: boolean;
    created_at: string;
}

const ROLE_LABELS = {
    admin: "Administrateur",
    employe: "Employé",
    mandataire: "Mandataire",
};

const ROLE_COLORS = {
    admin: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    employe: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    mandataire: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [mandataires, setMandataires] = useState<Mandataire[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [form, setForm] = useState({
        email: "",
        password: "",
        nom: "",
        role: "employe" as "admin" | "employe" | "mandataire",
        mandataire_id: "",
    });

    useEffect(() => {
        fetch("/api/admin/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });

        fetch("/api/mandataires/list")
            .then((res) => res.json())
            .then(setMandataires);
    }, []);

    const handleCreate = async () => {
        if (!form.email || !form.password || !form.nom) {
            setError("Veuillez remplir tous les champs obligatoires");
            return;
        }
        if (form.role === "mandataire" && !form.mandataire_id) {
            setError("Veuillez sélectionner un mandataire");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setSuccess("Utilisateur créé avec succès");
            setShowForm(false);
            setForm({ email: "", password: "", nom: "", role: "employe", mandataire_id: "" });

            // Recharger la liste
            fetch("/api/admin/users")
                .then((res) => res.json())
                .then(setUsers);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActif = async (user: AppUser) => {
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actif: !user.actif }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, actif: !u.actif } : u));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet utilisateur ?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen">

                {/* Header */}
                <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Gestion des Utilisateurs</h1>
                        <p className="text-white/40 text-sm mt-1">{users.length} utilisateur{users.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus size={14} />
                        Nouvel Utilisateur
                    </button>
                </div>

                <div className="px-8 py-6 space-y-6">

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">{success}</div>
                    )}

                    {/* Formulaire création */}
                    {showForm && (
                        <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-white font-semibold mb-5">Créer un utilisateur</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Nom complet *</label>
                                    <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email *</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mot de passe *</label>
                                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Rôle *</label>
                                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                        <option value="admin" className="bg-[#111118]">Administrateur</option>
                                        <option value="employe" className="bg-[#111118]">Employé</option>
                                        <option value="mandataire" className="bg-[#111118]">Mandataire</option>
                                    </select>
                                </div>
                                {form.role === "mandataire" && (
                                    <div className="col-span-2">
                                        <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mandataire associé *</label>
                                        <select value={form.mandataire_id} onChange={(e) => setForm({ ...form, mandataire_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors">
                                            <option value="" className="bg-[#111118]">— Sélectionner un mandataire —</option>
                                            {mandataires.map((m) => (
                                                <option key={m.id} value={m.id} className="bg-[#111118]">{m.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-5">
                                <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Créer
                                </button>
                                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tableau des utilisateurs */}
                    <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-wider font-medium">Utilisateur</th>
                                    <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-wider font-medium">Email</th>
                                    <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-wider font-medium">Rôle</th>
                                    <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-wider font-medium">Statut</th>
                                    <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-wider font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto" />
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-white/30 text-sm">
                                            Aucun utilisateur
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center text-white/70 text-xs font-semibold">
                                                        {user.nom.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                                                    </div>
                                                    <span className="text-white text-sm">{user.nom}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/60 text-sm">{user.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role]}`}>
                                                    {ROLE_LABELS[user.role]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${user.actif ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                    {user.actif ? "Actif" : "Inactif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleToggleActif(user)} className={`p-1.5 rounded-lg transition-all ${user.actif ? "hover:bg-red-500/10 text-white/40 hover:text-red-400" : "hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400"}`}>
                                                        {user.actif ? <X size={14} /> : <Check size={14} />}
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
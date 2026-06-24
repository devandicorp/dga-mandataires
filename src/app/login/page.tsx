"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw new Error(authError.message);

            const { data: appUser, error: userError } = await supabase
                .from("users")
                .select("role, actif")
                .eq("id", data.user.id)
                .single();

            if (userError || !appUser) {
                await supabase.auth.signOut();
                throw new Error("Compte non autorisé");
            }

            if (!appUser.actif) {
                await supabase.auth.signOut();
                throw new Error("Compte inactif");
            }


            if (appUser.role === "mandataire") {
                window.location.replace("/mon-espace");
            } else {
                window.location.replace("/");
            }

        } catch (err: any) {
            const msg = err.message;
            setError(
                msg === "Invalid login credentials"
                    ? "Email ou mot de passe incorrect"
                    : msg
            );
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="text-white font-bold text-xl tracking-wide">DGA Digital</p>
                    <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">Gestion Mandataires</p>
                </div>

                <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
                    <h1 className="text-white font-semibold text-lg mb-1">Connexion</h1>
                    <p className="text-white/40 text-sm mb-6">Accédez à votre espace DGA Digital Program</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="votre@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                        </div>
                        <div>
                            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mot de passe</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-white/20" />
                        </div>

                        <button onClick={handleLogin} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs mt-6">DGA Digital Program © 2026 — Devandi Corporation</p>
            </div>
        </div>
    );
}
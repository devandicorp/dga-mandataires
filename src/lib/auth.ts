// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type UserRole = "admin" | "employe" | "mandataire";

export interface AppUser {
    id: string;
    email: string;
    nom: string;
    role: UserRole;
    mandataire_id: string | null;
    actif: boolean;
}

// Client Supabase côté serveur avec cookies
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );
}

// Récupérer l'utilisateur connecté avec son rôle
export async function getAppUser(): Promise<AppUser | null> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: appUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!appUser || !appUser.actif) return null;
        return appUser as AppUser;
    } catch {
        return null;
    }
}

// Vérifier si l'utilisateur a accès à une route
export function canAccess(role: UserRole, path: string): boolean {
    if (role === "admin") return true;

    if (role === "employe") {
        const blocked = ["/facturation", "/admin", "/parametres"];
        return !blocked.some((b) => path.startsWith(b));
    }

    if (role === "mandataire") {
        const allowed = ["/mon-espace", "/login"];
        return allowed.some((a) => path.startsWith(a));
    }

    return false;
}
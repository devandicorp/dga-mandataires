// src/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // Routes publiques — toujours accessibles
    const publicRoutes = [
        "/login",
        "/politique-confidentialite",
        "/suppression-donnees",
        "/api",
    ];

    if (publicRoutes.some((r) => path.startsWith(r))) {
        return supabaseResponse;
    }

    // Pas connecté → login
    if (!user) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Lire le rôle depuis les métadonnées JWT (instantané, pas de requête DB)
    const role = user.app_metadata?.role as string;
    const actif = user.app_metadata?.actif;

    if (!role || !actif) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Admin → accès total
    if (role === "admin") {
        return supabaseResponse;
    }

    // Employé → bloqué sur certaines routes
    if (role === "employe") {
        const blocked = ["/facturation", "/admin", "/parametres"];
        if (blocked.some((b) => path.startsWith(b))) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return supabaseResponse;
    }

    // Mandataire → uniquement /mon-espace
    if (role === "mandataire") {
        if (!path.startsWith("/mon-espace")) {
            return NextResponse.redirect(new URL("/mon-espace", request.url));
        }
        return supabaseResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
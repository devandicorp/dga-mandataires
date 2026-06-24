// src/app/mon-espace/page.tsx
import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MandataireEspace from "@/components/MandataireEspace";

export default async function MonEspace() {
    const appUser = await getAppUser();

    if (!appUser) redirect("/login");
    if (appUser.role !== "mandataire") redirect("/");
    if (!appUser.mandataire_id) redirect("/login");

    // Récupérer la fiche du mandataire
    const { data: mandataire } = await supabase
        .from("mandataires")
        .select("*")
        .eq("id", appUser.mandataire_id)
        .single();

    if (!mandataire) redirect("/login");

    // Récupérer les publications planifiées
    const { data: publications } = await supabase
        .from("publications")
        .select("*")
        .eq("mandataire_id", appUser.mandataire_id)
        .in("statut", ["Planifiée", "Publiée"])
        .order("date_publication", { ascending: true });

    // Récupérer les ressources
    const { data: ressources } = await supabase
        .from("ressources")
        .select("*")
        .eq("mandataire_id", appUser.mandataire_id)
        .order("created_at", { ascending: false });

    // Récupérer les leads
    const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("mandataire_id", appUser.mandataire_id)
        .order("created_at", { ascending: false });

    return (
        <MandataireEspace
            mandataire={mandataire}
            publications={publications || []}
            ressources={ressources || []}
            leads={leads || []}
            userName={appUser.nom}
        />
    );
}
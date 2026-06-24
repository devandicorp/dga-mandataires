// scripts/create-admin.mjs
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Modifie ces valeurs
const ADMIN_EMAIL = "tiga.honba@gmail.com";
const ADMIN_PASSWORD = "ROgette@9266";
const ADMIN_NOM = "Tiga Honba";

console.log("🔐 Création du compte admin...");

const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
});

if (authError) {
    console.error("❌ Erreur Auth:", authError.message);
    process.exit(1);
}

console.log("✅ Utilisateur Auth créé:", authData.user.id);

const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: ADMIN_EMAIL,
    nom: ADMIN_NOM,
    role: "admin",
    mandataire_id: null,
    actif: true,
});

if (profileError) {
    console.error("❌ Erreur profil:", profileError.message);
    process.exit(1);
}

console.log("✅ Profil admin créé !");
console.log(`\n📧 Email: ${ADMIN_EMAIL}`);
console.log(`🔑 Mot de passe: ${ADMIN_PASSWORD}`);
console.log("\n🎉 Compte admin prêt !");
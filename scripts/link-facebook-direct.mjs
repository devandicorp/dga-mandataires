// scripts/link-facebook-direct.mjs
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Correspondances directes avec tokens frais
const liaisons = [
    { page_id: "1116751714860822", mandataire_nom: "Yameogo Odette", token: "EAAV7CO505wgBRtTBt13kQKzuRfU49fPWF82E6aNt1ipetseMiyVi0Q0nvigu1Kx4NbaTcgptjyHEFLrjFMKRnrNIU6ex02n1zr1PAkgqIfqoTNGHZCbRnO4GTs81nqId454W9niXNQihx5ev6ZCmBUo8P1jNEdCXigjI3Bv65cqot7a6BAUjjjimUWxpeydmTw" },
    { page_id: "1164349366764632", mandataire_nom: "Kouassi Epse Kesse Marie France", token: "EAAV7CO505wgBRj9diLD7nQAkQ0tfwfteZACeANfCc9KPSJFUuN0VMq4CudW7XEeLVRgl3HCUwFylgwuRXAUZBQr5IPZBqATNTnRchytsSZCoCX1Cxr3kxGFs9XHbdgsU0aCmdOdSmi9peTCm6dj3NaZBkDU32Cy2R6JXw8ZBP8L1KJH7VCNSEDZColhzLpLbOZAZASoWf" },
    { page_id: "1144488172085494", mandataire_nom: "Tiémoko Jean Ugues", token: "EAAV7CO505wgBRg9kbolZACcQu4zGoqBAx8Pht1I3BaaPOWZAb7dv51J57VqPZADhfVaPBoim1ddDhbCgDEcCf5sdF4mjKNowZAAUZCiqWUtUpdTzjCPEKQV3cWbmitSYP4yTBvYj3I7omQLfiihHImbmJMfAtlPrQT51fFZAL4fUZAQZAQy6MvsN3uIa90m7efZAw1VZAs" },
    { page_id: "1094763550395478", mandataire_nom: "ANTHONY Lébèné Hervé", token: "EAAV7CO505wgBRmsfcwAxAsHZAoMNv5vJ2pl3jUtHBKJkTU7wJ83N3vswMoCbYueOQPmQ8wCb59DIfVAF76CP62f9mhGBei1Nqkx9dFKvZBFtFfoQA2Acnz5UVDOAZAyCnwZAKPeUEqW23k0SlDDXYaM7jZA9YdXzZCdNK6jOO402zueFLWu0I9k7NxZC6B0vEOmzcHH" },
    { page_id: "1209353695587478", mandataire_nom: "N'TAYÉ N'TAYÉ MARDOCHÉE", token: "EAAV7CO505wgBRjvUNItoPZA5eYmpTkWaaJTVamOdr19Hgj5SzF7SZAkuYZBX0xIo0t488OmRmVy3J1Gd2QxZAl11R72GOQ2Vzy66RvobYNONU3zRaEkO3xoqRYWqgZAWklw6ilPXZBEW9d91ar0f7BQgIwxBYhwo2sNMixHslZBZCXOSVaIEmVGZAZCTKDhp3CjMLdmAE9" },
    { page_id: "1142739628926551", mandataire_nom: "Coulibaly Songoumonfolo Aïcha", token: "EAAV7CO505wgBRmOZC78PPXw8FtzoSbZAJ7hZBNiyN4tKPmpowmW55rGikSuVZCKI4sVpaTd9BH8LkN8pbXDtgCP7AGXBNzgro5Xb4R0ACUy98zpZCNIJ90ij79ipaTR1GszvA773IhBIEg0KOp5dAKbjV42fsDstERBr0OaCVQrCoGSeeyXTrBUXgZA2ZA1qqxC2DxF" },
    { page_id: "1197844993403376", mandataire_nom: "SORO NIKUNDIANHOUA REBECCA", token: "EAAV7CO505wgBRrvreu6XveavnmZBeP8dNZCT0Ut5QOcuEryQnvkc01ZA23GE4TqLD2uVgAszjgo9qzaW7btyICGGtdKbZAhmtpquX5Pg0mkReu8KOBdMDZAd6JJnXK1qvQaN4HeHGRBrA1wQuJPLru1gh4ZCm98xcZAMEG06qMqVPfi5h6SXIKUBsTQVfzbThlmVP8L" },
    { page_id: "1123795640821228", mandataire_nom: "SETCHI GUY-EMMANUEL BOUA", token: "EAAV7CO505wgBRqFm2NXUWB08IVpe50TJcA6RTIFCJWtB38cVcrbI9vyUxARanwbo3ibYYXY4ZBBZB8JW4DI6VkeAARm1LUKGZCUYfSEbiJh4jPzmnlsgvSWZBQ6ZB4c32bI900Kgt1sDsFbg2kx6lcOzuFpMzITvjbxavCLZBQDsDNIXvXHkhzLFmf7Oa2nDcq9ZCk0" },
    { page_id: "1133740659826940", mandataire_nom: "Meledje Agnimel Jean-Yves", token: "EAAV7CO505wgBRrdEAUITJbchJKcEe4SuAFDShiXLvapQ0ZAxukhkpqWaznhIspnBeNvm5YT3ZB1eX7hGYcV2RZCYl1zseg2VDNogVCd1KoJvY1QPmiUQEyznWB6Tpzox6oZASAt20OvotXRF66r8HntMOZCZCAEFicmpMC5afx9uJ3o5Q3SrVmhDXJNxChsn7Yp93r" },
    { page_id: "1145234995341484", mandataire_nom: "KANTE AIDA ADIOUA MARIAM", token: "EAAV7CO505wgBRtKEWjGl3biN7BTA6wI8AB45BZChoPpUaiTR4EpWO4T1d5ChNhIGrvr1dtKHV8A3N1VZC28D6SLIxQPh3jkpaKKEVqZB9eynpZCGDLmR7cf0Ut1aAvEGaIviUGgLBP5ZAhBQLiwJzZC2kdUlfMwbJL4so9HhKMwR6aY6XZCPqF1WOwnIzcaJFTVDWvd" },
    { page_id: "1200060439848309", mandataire_nom: "Ahondjon Affoua Léopoldine", token: "EAAV7CO505wgBRst0nt4Cu8ko3C8JW5NnG1mX9qu2ScoObplRZCskDbVt7LMiHbL86tMaFjeIAiMrVihU65ds4xPLs6I8ZBDLBTuYbp9cB7QQoMALV0KQcKwF3ClnpfNOy7ANolMnX5lmIziCDF5RtEBBofO8w545Ay2rBQLsLpZCZAKVujyzhprttOlhZAGR2o2ZCS" },
    { page_id: "1065294546676613", mandataire_nom: "AHON ADJE", token: "EAAV7CO505wgBRtild2k29ihPbocbA7XZBuEXkIUA9qkQVW5qI1Ebvk3siGtGMqXMFxABIedud4OHdV3jHkY4u4Qm9BusmcMRd1AUqLZCJiuDZBHd3gkcMBKEOWl3YLiz5pabWoaKEiDqnjGoDj1EOLjIH713WwG2VhhxjDCpwhIDtOrGv8sqhVhEjZAH10OZAjQoK" },
    { page_id: "1123874507481632", mandataire_nom: "Koffi kouassi Jean Roger", token: "EAAV7CO505wgBRle5aoT70C5fzXPiydp5A6xqbNdhmJ8Sb4qbtPxUAXHZCLsR1vTLzKUvbKjVEXPZBMZBCQzqZAL2azOq0wQKhllZAnlfqEjZBgTZB94WYBzxfVVX8GUZCSEHnjVVrrvDhyHywCdDgP2I4n4YSF5Xd4JPjkhhNtVeFT0GAlcOHo4WOscXnZBONVJ2pdgXX" },
    { page_id: "1123394427525985", mandataire_nom: "KACOU Angboman Germaine", token: "EAAV7CO505wgBRsmvL9cp88asw27V0CoHvkUb733O3LfRs1hbyKPgci1pF2pOtr5mlvTmQKOycjvnhWyZCMhgT9mWDN1cYlsGR3kbJ0eWvZCjd8KTwsp7T376i8mAGkDwyPrJIKVRIAqaMWzpp4rYraiHjzvZAckI5qfM9yQ1Qyl6dRn8SS77znktCzKR3ZCveERw" },
    { page_id: "1165010713358993", mandataire_nom: "BASSEBA SEKADA SERGE ROMARIC", token: "EAAV7CO505wgBRmgbacs0bN5VNqOIKTUJ0FZCXHp0U7ZAvmlUtLYSYhIiRpZAFc7KacZBZCMyZCQGlo6ehuCdHr07HA1FpkpmZBjvt1s7Qeyq6MufpWUL4lryvESiwjnZCxXPZCiJF9IaCNwLE6kUAo0ubb4Lcs3d3fPhnjZB10VszJyq5pHbX5vztdAbcyUUkZAQYc9wdqS" },
    { page_id: "102126055965816", mandataire_nom: "Diallo Abdoul Madjid", token: "EAAV7CO505wgBRkkQDMpZB1j9gPboWSVfD939bcC0AscO3DXM370WsiBcyRfcWOPF1ZArUjGZCRqYfBaWK7cBsDcoZBkKZAxBh0nvAewcjeo5MUDS7zw252h87xRLBdoZC1K3qBloOec0u7NO4DfjAClZANnFMoBMRk98fUhTR788TOIMlOAEAVW9YsfNQaFTZBMmtY0ZD" },
    { page_id: "110288278845092", mandataire_nom: "DROMBE BI NANTY SAMUEL NATHANAEL", token: "EAAV7CO505wgBRhee3KaROzafZAapdhcCR6pIVVuZBM2ZA7Q5YZBOLSZAxhZCDvkggXt19SH6dWDpqbc2kZCJnkYNgpQQxIhK7KR6tgChXyNWwjFln4tCXwx5lZAdSDlrcgwbVUn0htHpa0Xzbl7H58jCUcZBRV7hXiZAQXaYTQNCI2Kk4IxhkuRcN0lgGWRgvroOZC4ZC84ZD" },
    { page_id: "238095609389979", mandataire_nom: "Dago Gnakrou Saül", token: "EAAV7CO505wgBRnqJZCuqH89cth4BpSBx6ZB9i6vKlSy8OYMZC2LqElUx08WFZAofTDcz1aRXieeOgLqtPdZBXlYVqhzVjwfuX2FSNBhKKmFtYcTVrkWbZCamWxY0t1lQEkuTpCgK6ZAChpSb5S8wrcFLGCAQNbeVUZCXAjKDXW0yGZB8c8fuXpdaRtZAG5gZA5lqoZCo14YZD" },
    { page_id: "407331609124373", mandataire_nom: "Akossi Diedro Meledje Samuel Elfried", token: "EAAV7CO505wgBRtkmSzMc3G86fUDndzMqMcZBBoqEwwxePZBbQrYEjGzPJzWK6ra0eo6DIXlDFMq7R5l2R6qWVlWckxNU7m31G67qs94P3YfUTZAVN1rNyz7Ks706SgWhCHO12PZBjTaRyDGbvdkYnykI2zs4oBFowpCJEJW1JmNRbVBSSL5RZCO8U9jw1WZBNtKYje" },
    { page_id: "101258355996604", mandataire_nom: "Georges Kwamina", token: "EAAV7CO505wgBRh9BZAL6S8x9msSKT84ia4ovLf2DHa19HhLzkcZAsMSWZAX8UkmMSk5Ebyd8JjZCuimr7p20ZB93dKbltZCz5KSZB88UD9p5aKooV97VwcnB31mdu5BDQaWLPtZCfK1gDOOEFNBBueZCjlZALdrNV3PkObz5ZAAOjyDZBaWgaKPKCCTd9YfkGNpo19V0e3YZD" },
    { page_id: "748602898330073", mandataire_nom: "KONE MOUSSA", token: "EAAV7CO505wgBRjaUHvFTxmBZB7nEl20pFzZCCs89efImsGfj4b3jxeKV4CNYQdX5j0s22U2EAL6VEzshz3VRZC6RKTaHNu5uJZBG0bDCw2jnMjTPMsJBhXvfVQHnn1X8pyKLxM8ZBJMcmb0WARXqOOcHBUpwvJwmWrf6cTtEFlxEUZBzFNHdiO75nHJomlQdZCU5pCy" },
];

// Récupérer tous les mandataires
const { data: mandataires } = await supabase.from("mandataires").select("id, nom");

console.log("🔗 Liaison Pages Facebook → Mandataires...\n");

let success = 0;
let errors = 0;

for (const liaison of liaisons) {
    const mandataire = mandataires.find(m =>
        m.nom.toLowerCase().trim() === liaison.mandataire_nom.toLowerCase().trim()
    );

    if (!mandataire) {
        console.log(`⚠️ Mandataire non trouvé: "${liaison.mandataire_nom}"`);
        errors++;
        continue;
    }

    const { error } = await supabase
        .from("mandataires")
        .update({
            facebook_page_id: liaison.page_id,
            facebook_page_token: liaison.token,
        })
        .eq("id", mandataire.id);

    if (error) {
        console.error(`❌ Erreur pour ${mandataire.nom}: ${error.message}`);
        errors++;
    } else {
        console.log(`✅ ${mandataire.nom} → Page ${liaison.page_id}`);
        success++;
    }
}

console.log(`\n🎉 Terminé — ${success} liés, ${errors} erreurs`);
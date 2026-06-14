// scripts/save-facebook-pages.mjs
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pages = [
    { id: "1116751714860822", name: "Yameogo Odette Xpert Immobilier DGA", token: "EAAV7CO505wgBRiEMQ12VcQobqZBpQSgSqZBq5foR2egUXSSYZAmU9wFCDYw6ZCOg48N3Q5TUlk6MBoRQFMIX8dlc2oQ6eHYZAuBhAfYRfpc8pFCeUnZBqF5oIZBVQYwae6ZAuBQW11lumyjYmZBixLcwHVLlTb58CSEnAoxSzIFRwJWqLykg4gpYmg863Tcxo1hjCsNHc", category: "Agent immobilier" },
    { id: "1164349366764632", name: "kouassi epse kesse marie France xpert immobilier DGA", token: "EAAV7CO505wgBRvgAotLN8HJQFkmYhxIiuwIH2Sv8MYCYT6RDgNiAzvNTgTs7lW5FX3OAT9pSRKE574zidzsFbZCUWmmysMGZAZBt47p9KE8ACuO0S3sZCwhbcf9nTjcJszJCW7hTnYwdeyjZASgIijcLnklxYQPQQDmbPqhDCkMBS2igS6P35zT4rKDbWoFtTRWk7", category: "Agent immobilier" },
    { id: "1144488172085494", name: "Jean Ugues Tiémoko Xpert Immobilier DGA", token: "", category: "Agent immobilier" },
    { id: "1094763550395478", name: "Anthony Hervé Lébéné - Xpert Immobilier DGA", token: "EAAV7CO505wgBRrRJhwOmAocGJMhAfHobGFq0UXYRmmClfGh0zQY2RhZAgqbNb1WUsT69xVeNGZA6mGUaNqvyUKO9tw6IiwGbVJWbrOx9gjYtwEZBWGnSBeXUYOU6HRMFojg11XZCei1qq0hViylb7dZB1B8ZBdqdScnLj1WACpjt46RX7WfJZA0fPZBomJ0cSwO0y906", category: "Immobilier" },
    { id: "1209353695587478", name: "N'Tayé Mardochée Xpert Immobilier DGA", token: "EAAV7CO505wgBRgsV6TM5IdJAsrt1punneeEpJQWZB7VzqBJjDLRuCuVcuoiWOeIgEYAH4eQvJi8S8oX4UFWt5iQM4nAFBZCKv33ujJDNV2lelMbdPN2ZC4IWQurT3ruPaGf4O09JznNevONY8GD8UjDEaS18esX5w0lrSRTvUdxGpxO08nZAzvOqKQkKTI54DqYE", category: "Immobilier" },
    { id: "1142739628926551", name: "Coulibaly Aïcha DGAImmo360", token: "EAAV7CO505wgBRu8vZAFiQG6mFVlcyb5MXoRjz1IGpM7J3umoQIphgNZB4MUYJ30l8Jbc6jyUEKzB5LwafE18HAPJIQmoWLEVzfAnLmWEDyyjYgcKpnZAgvr4Ighh0zeHQaL0UJFO2mbfZBmZBoZAX9ZA4ZBK0jM8YxofMwcxAZBBDqm5J4VdAYh35ptSI6t5V0ZA4dS4VQ", category: "Agent immobilier" },
    { id: "1197844993403376", name: "Soro Rebecca DGAImmo360", token: "EAAV7CO505wgBRuQybUSeS78vMNjhtgzxD0ZACNZBl7UZC8WzfJfKhv0lQn0bM4tCvKM8iKNZAlprM1Ek29CMCmtMYJf6E6KM8We3sPCSBLTILwSmXcZAyAZBnkJgGA1A6QS2YW0lxr4fDogUOZCDst6qA9nSKZBZA2PBZCYaFXYuiGX7TYgVPlFEpbEgDtW1MSrEOC8s1W", category: "Agent immobilier" },
    { id: "1123795640821228", name: "Guy-Emmanuel Boua - Xpert Immobilier DGA", token: "EAAV7CO505wgBRkFFENCoZAjXhBpDooUZAKPckQJrCY8bpe4ZCbbKdKP7LEkaMyHW4pk73FRWRxi0LT8xAYWKjND1UZBH9JoQxhfIE0cs7p4juNOQsEn14CSooOGi4dLenWyCXo1jq2D7CgbqZCfZBR2GkYwr9RMo4tEIdSYQaqAY3l6rLVUYbH1MtCOtSB3gtki3Xk", category: "Agent immobilier" },
    { id: "1133740659826940", name: "meledje-expert immobilier", token: "EAAV7CO505wgBRvFydjd5PKQvULZBoIB5V9FDsQWMNMPtstZACkjYx8S1OTbhkxvIqGsBUJaETMQscu3MkBhaDP1uceNttSWZBTbcI4Uuq7XZAEXJR4qZAg5IWQe0p5zWH57szp8DM4TdARbLqyB3JWWZCim2lnW7A60sx882oG5k8z8LZBvIZAgClNGZAmZCWxAt6jCWKe", category: "Immobilier" },
    { id: "1145234995341484", name: "Mariam Kante- Xpert immobilier DGA", token: "", category: "Agent immobilier" },
    { id: "1200060439848309", name: "Léopoldine Affoua Ahondjon DGA", token: "EAAV7CO505wgBRpv0oEQbJtOuErZCAv5ZCBfuhlfnzrmvc55ZA9NFCBEkTR2hIixgUZBWLJmaaZBlOZBLbxO3nHfZBb6oWxjp7AMgQ8bZB9Y9eUVfDbteMCHifa96cwju2fMkjxRS9ECQ6XSWDivZCHFZBMa4F8urRe0XfKsLVEnndk64Pb8NrPMcJi5CcY4XJfdZB3aJEVj", category: "Immobilier" },
    { id: "1065294546676613", name: "Ahon Adjé Expert immobilier DGA", token: "EAAV7CO505wgBRoxWgLky7lDzERE2OeiSACPmhdpgucPcCv61ilegxXozkorRt4y526zdSR0lgwAD7mN6vffmftVeBeCVIZARRLZCXmEVDTqRtysokvp6ZBqDk9ZBKmNWJmLZBTwlGWZBnXVyzfNnngYdgH3YBpYiswXOUP7MbJuHknXCj3kgZATBPJmMfMyq1dMIUQ4", category: "Agent immobilier" },
    { id: "1123874507481632", name: "Koffi kouassi jean Roger Xpert immobilier DGA", token: "EAAV7CO505wgBRk3p2y0yJ9783odALxbXStOycAGm8k9ZA7apG3FYdqjokC0UhKcG8OpZBXheosIBoZC6q2ME0nBiLUBjR6iQczXScsSG4ZBZAPkoy8MMAYHI4H1n2zyHGwol3yOXXHkxZB4s99AN8udoouXLzyG3is5zpaW27kKIC3Gp38JoIgQLCLvdd8sXyeZAnZAX", category: "Agent immobilier" },
    { id: "1123394427525985", name: "Mandataire Immobilier", token: "EAAV7CO505wgBRnUHLlnp9m1ZBXf7DKZCvZC25XPCBgoxUrJx9enCLMzJ9HWF1JFKfTAGzfFRP0kPXClFRSBrIZBZCrtBYqwqqPrWnqNtlEk3oB7YcUhuqSvYdZCvHgHWDOPjqhofZBr3u9UbTZCQIpYkHdS0NOHGz0CWkgVbmfWd5ZCRuxegIBtZB8XokGQZAHyiNqsZBX0d", category: "Agent immobilier" },
    { id: "1165010713358993", name: "Basseba serge-Xpert Immobilier DGA", token: "", category: "Agent immobilier" },
    { id: "102126055965816", name: "Abdoul Madjid - Xperts Immobilier DGA", token: "EAAV7CO505wgBRussQ1YANsow0ehD5ZC0UtdfFN6vlfExwFbdciTTUXW3621akWA3f9ln2z3bqAiERqXRfI9KU6NNuljWCheEPku1SCk7uxfNqGLb3QZAWR6OXKxKyT2oVFy9WsdGvQj0BZABmGCXER38SpKCOxFVTsIVAYuI3i1gtTiCYOZCUuk8ZAf1CUzcZBGA0ZD", category: "Agent immobilier" },
    { id: "110288278845092", name: "Nanty Business Trade", token: "EAAV7CO505wgBRg2TlYd6mAoBCuJlR36tEYh6m5ynAfic0FVW5Xxe0WQy2Bdb3VIxid3hBsCCSWpJqO6GsRZB8KWWPDXyVfSsHI3mmGw8L6UPGuEaDvgmAoMWxafsvfWzZCYevlziCZAUOZBOahJy6vNM0NizMiiyCfv6s2piZBoo8bS6Iu28RPXHjmJdbNVpqg5kZD", category: "Immobilier" },
    { id: "238095609389979", name: "Xpert Immobilier DGA", token: "EAAV7CO505wgBRrZAstaDSNZCMnodKfZCIj5ZBMCkCJPEsM3Rn9sDZBeTxsb7mawHWpKB5xuEY4GAJCZBURs3c8KCZCJyyS4Y4rZBfXRFhc9mrtZA4is5B9gMcsNa0FncUcMasQZB4smHXR5Mt1AWj5pGS6OtOhLkSLWJZAvA8whZBXi48RtRcowZBaNLs2d4oV3uhzNeimMMZD", category: "Agent immobilier" },
    { id: "158171160722981", name: "Devandi Immobilier", token: "EAAV7CO505wgBRnmGoSSdTX4bdc8J30IMbYkBH0exTzwZBtGRwOSzVUZCFQq3dCawuxlvNE3FTFIuQQKHlOIkk7WiZAEDgUEtWYfyHIUW8VNystoVZAYJpmNWMXOzUqCNkeuuCRV0YjKLzrO97hjibDhCLecvZBL2bKSU8U9Uuw38bBhzalX6yyPmZAxK334L9EN8kZD", category: "Agence marketing" },
    { id: "407331609124373", name: "Best Deal", token: "EAAV7CO505wgBRjLih4utPQY0RKUNfOk4Jyeq9jui4EYy8G3mR0d6nZCgZCZChiZC0XcAR7cQlqRV2sGJY4FZAQBrz1avYv29SDyyzXT73AiaLM2ROUqznzZCjXBbLSr19C1sIV5a3Y0ch0WUzbV5IMDBaYhPyXDQnqrunIVljyjyV7dwaYt8UIiRHPPgPzXmjNveEC", category: "Immobilier" },
    { id: "556347024223399", name: "Be. Alter", token: "EAAV7CO505wgBRnkWQtWaZCSZCBtuZAbcgi2QubWGzsxYnmUVCAgSvGRGnxfN7DXxXL0xqsvDy5ojIZB0wHnIHlTd8OaKIoxALKbZAQTekuzHZAFnadXT6Yv512QPlZBwwrxnyu33bCSNUO8VoowdbRCuVHJz7jBikGfBNSmA5oUHFd8Tsjq9dMvWz0bgjuz8mpjHnKr", category: "Vêtements" },
    { id: "104912818678542", name: "DIAMA GROUP", token: "EAAV7CO505wgBRj4L1WIrhOYOuiDS6pOMxhYsJf8q8Xqa4VA8gNCXa6aUZCZCxFlB3RXADtYbQ3ipQU4EfqnDMgADRiVMY11Pk2YTlOMtnCgai9E19eXqfdPBpQWhQwLdoFYKDt2CgZAaRzrvQcgzGgkZBP4Lj4bJwYe6yf4eT2tbpM54Y8kV1ZBZCgXNLtvs1BV4QZD", category: "Promotion immobilière" },
    { id: "101258355996604", name: "Royal Immobilier", token: "EAAV7CO505wgBRpAUSXCurOjnKhhd59yHZAJLPy6k4U0V5mIis2ks3PI7fBZCUFaTXa8VNHWAXzsF9ughZCSthQfJmg81ZBTHrlTZBZBADIGNOV8FwXf7S5Kc7mWGpTyPfVFSU4dgYyCCeUBM7jKZAeJtWTX5hcpS1c8J3HwiZBPkxZCU59ez8ZCg5VlO8ECIdMS9yHoQgZD", category: "Agent immobilier" },
    { id: "1059937317199038", name: "Mardochée N'Tayé", token: "EAAV7CO505wgBRvZCWztosY1PhFJHItsNZCn1ZCX5qkQiZCVNZAyJ4kDGfzrpC1g1uWdDf5ydhYeLZC3TeZCUO0jhkmwC6msb1tZB0diDDmeQv9ydYEGSUp6iS5NmjmjTZCXcOQSE3MHF9H4lYyqh0o2SZCARfIKyPoEKnZAQp6zcs99HfKy0Y10DQZBN37zQ2SoyWQrzcQcv", category: "Service immobilier" },
];

console.log("📦 Sauvegarde des Pages Facebook...");

for (const page of pages) {
    const { error } = await supabase.from("facebook_pages").upsert(page, { onConflict: "id" });
    if (error) {
        console.error(`❌ Erreur pour ${page.name}: ${error.message}`);
    } else {
        console.log(`✅ ${page.name}`);
    }
}

console.log("🎉 Terminé !");
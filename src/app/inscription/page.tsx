// src/app/inscription/page.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";

export default function InscriptionPage() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://server.fillout.com/embed/v1/";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <Sidebar />
            <main className="ml-56 min-h-screen relative">
                <div className="border-b border-white/5 px-8 py-6">
                    <h1 className="text-xl font-semibold text-white">Inscription au Programme</h1>
                    <p className="text-white/40 text-sm mt-1">Formulaire d'inscription DGA Digital Program</p>
                </div>
                <div
                    data-fillout-id="e3211Lhkt9us"
                    data-fillout-embed-type="fullscreen"
                    style={{ width: "100%", height: "calc(100vh - 89px)" }}
                    data-fillout-inherit-parameters
                />
            </main>
        </div>
    );
}
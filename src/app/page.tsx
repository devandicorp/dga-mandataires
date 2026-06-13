// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import MandataireCard from "@/components/MandataireCard";
import Sidebar from "@/components/Sidebar";
import { Users, Building2, MapPin, TrendingUp, Search } from "lucide-react";
import { Mandataire } from "@/lib/supabase";

export default function Dashboard() {
  const [mandataires, setMandataires] = useState<Mandataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreForfait, setFiltreForfait] = useState("");

  useEffect(() => {
    fetch("/api/mandataires/list?full=true")
      .then((res) => res.json())
      .then((data) => {
        setMandataires(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const mandatairesFiltres = mandataires.filter((m) => {
    const matchSearch =
      search === "" ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.zone.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchForfait = filtreForfait === "" || m.forfait === filtreForfait;
    return matchSearch && matchForfait;
  });

  const totalActifs = mandataires.length;
  const totalPresence = mandataires.filter((m) => m.forfait === "PRESENCE").length;
  const totalProspection = mandataires.filter((m) => m.forfait === "PROSPECTION").length;
  const zones = new Set(mandataires.map((m) => m.zone).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="border-b border-white/5 px-8 py-6">
          <h1 className="text-xl font-semibold text-white">Tableau de Bord</h1>
          <p className="text-white/40 text-sm mt-1">Vue d'ensemble de votre réseau de mandataires</p>
        </div>

        <div className="px-8 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs uppercase tracking-wider">Mandataires Actifs</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users size={14} className="text-cyan-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalActifs}</p>
              <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                <TrendingUp size={10} />+12% ce mois
              </p>
            </div>

            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs uppercase tracking-wider">Forfait Présence</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Building2 size={14} className="text-cyan-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalPresence}</p>
              <p className="text-white/30 text-xs mt-1">
                {totalActifs > 0 ? Math.round((totalPresence / totalActifs) * 100) : 0}% du total
              </p>
            </div>

            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs uppercase tracking-wider">Forfait Prospection</span>
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <TrendingUp size={14} className="text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalProspection}</p>
              <p className="text-white/30 text-xs mt-1">
                {totalActifs > 0 ? Math.round((totalProspection / totalActifs) * 100) : 0}% du total
              </p>
            </div>

            <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs uppercase tracking-wider">Zones Couvertes</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MapPin size={14} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{zones}</p>
              <p className="text-white/30 text-xs mt-1">Régions actives</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold">
              Tous les Mandataires{" "}
              <span className="text-white/30 font-normal text-sm ml-1">
                ({mandatairesFiltres.length})
              </span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#111118] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 w-56"
                />
              </div>
              <select
                value={filtreForfait}
                onChange={(e) => setFiltreForfait(e.target.value)}
                className="bg-[#111118] border border-white/10 rounded-xl px-4 py-2 text-sm text-white/60 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Tous les forfaits</option>
                <option value="PRESENCE">Présence</option>
                <option value="PROSPECTION">Prospection</option>
              </select>
            </div>
          </div>

          {/* Grille */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : mandatairesFiltres.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              Aucun mandataire trouvé
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mandatairesFiltres.map((mandataire) => (
                <MandataireCard key={mandataire.id} mandataire={mandataire} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
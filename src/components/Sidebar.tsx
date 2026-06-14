// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, HelpCircle, LogOut, Plus, UserPlus, CalendarDays } from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mandataires", label: "Mandataires", icon: Users },
    { href: "/facturation", label: "Facturation", icon: FileText },
    { href: "/calendrier", label: "Calendrier", icon: CalendarDays },
    { href: "/inscription", label: "Inscription", icon: UserPlus },
    { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0D0D12] border-r border-white/5 flex flex-col z-50">

            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/5">
                <p className="text-white font-bold text-sm tracking-wide">DGA Digital</p>
                <p className="text-white/40 text-xs mt-0.5 tracking-widest uppercase">
                    Gestion Mandataires
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
                ${isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon
                                size={16}
                                className={`transition-colors ${isActive
                                    ? "text-cyan-400"
                                    : "text-white/30 group-hover:text-white/60"
                                    }`}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bouton Nouveau Mandat */}
            <div className="px-3 pb-4">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 transition-opacity">
                    <Plus size={16} />
                    Nouveau Mandat
                </button>
            </div>

            {/* Footer */}
            <div className="px-3 pb-6 space-y-1 border-t border-white/5 pt-4">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <HelpCircle size={16} />
                    Aide
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <LogOut size={16} />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
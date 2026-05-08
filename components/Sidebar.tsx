"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Kanban, Users, Upload, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/leads", label: "Clientes potenciais", icon: Users },
  { href: "/leads/import", label: "Importar", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-brand-black text-white flex flex-col border-r border-black/40">
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/pipeline" className="block">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            <Scale size={12} className="text-[var(--brand-gold)]" />
            <span>CRM</span>
          </div>
          <div className="brand-gradient-text text-2xl font-bold leading-tight tracking-tight">
            CRM Jurídico
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "gold-gradient text-black font-semibold"
                  : "text-white/80 hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-white/40 border-t border-white/10 leading-relaxed">
        Prospecção e gestão de carteira para advocacia.
      </div>
    </aside>
  );
}

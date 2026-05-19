"use client";
import { Users, Crown, Star, Sparkles, AlertCircle } from "lucide-react";
import ClientsTable from "@/components/clientes/ClientsTable";
import { CLIENTS } from "@/lib/data";
import { isInactive, formatCurrency } from "@/lib/utils";

export default function ClientesPage() {
  const vip = CLIENTS.filter(c => c.segment === "VIP");
  const regular = CLIENTS.filter(c => c.segment === "Regular");
  const nueva = CLIENTS.filter(c => c.segment === "Nueva");
  const inactive = CLIENTS.filter(c => isInactive(c.lastVisit));
  const totalRevenue = CLIENTS.reduce((s, c) => s + c.totalValue, 0);
  const avgValue = Math.round(totalRevenue / CLIENTS.length);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">CRM — Clientas</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{CLIENTS.length} clientas registradas en el sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Total clientas", value: CLIENTS.length, icon: Users, color: "text-zinc-300", bg: "bg-white/5" },
          { label: "VIP", value: vip.length, icon: Crown, color: "text-gold", bg: "bg-gold/8" },
          { label: "Regulares", value: regular.length, icon: Star, color: "text-blue-400", bg: "bg-blue-500/8" },
          { label: "Nuevas", value: nueva.length, icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/8" },
          { label: "Inactivas +60d", value: inactive.length, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/8" },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={17} className={k.color} />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-zinc-500 text-xs mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card-gold p-5">
          <p className="text-zinc-400 text-xs mb-1">Valor histórico total</p>
          <p className="text-2xl font-bold text-gradient-gold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card-gold p-5">
          <p className="text-zinc-400 text-xs mb-1">Valor promedio por clienta</p>
          <p className="text-2xl font-bold text-gradient-gold">{formatCurrency(avgValue)}</p>
        </div>
        <div className="glass-card border border-cavaliss-pink/20 bg-cavaliss-pink/5 p-5">
          <p className="text-zinc-400 text-xs mb-1">Valor promedio VIP</p>
          <p className="text-2xl font-bold text-cavaliss-pink">
            {formatCurrency(Math.round(vip.reduce((s, c) => s + c.totalValue, 0) / vip.length))}
          </p>
        </div>
      </div>

      <ClientsTable />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Activity, CheckCircle2, RefreshCw, DollarSign, Zap } from "lucide-react";
import { WORKFLOWS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { WorkflowStatusType } from "@/lib/types";

const STATUS_CONFIG: Record<WorkflowStatusType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  activo: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Activo" },
  error: { icon: CheckCircle2, color: "text-red-400", bg: "bg-red-500/10", label: "Error" },
  advertencia: { icon: CheckCircle2, color: "text-amber-400", bg: "bg-amber-500/10", label: "Advertencia" },
};

function WorkflowCard({ wf }: { wf: typeof WORKFLOWS[0] }) {
  const sc = STATUS_CONFIG[wf.status];
  const StatusIcon = sc.icon;
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }

  return (
    <div className="glass-card border border-white/7 p-5 glass-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", sc.bg)}>
            <StatusIcon size={16} className={sc.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-100 font-semibold text-sm truncate">{wf.name}</p>
            <p className="text-zinc-500 text-xs mt-0.5 leading-snug">{wf.description}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 shrink-0"
          title="Refrescar"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wide mb-0.5">Última ejecución</p>
          <p className="text-zinc-300 text-xs font-medium">{wf.lastRun}</p>
        </div>
        <div>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wide mb-0.5">Hoy</p>
          <p className="text-zinc-300 text-xs font-medium">{wf.executionsToday} veces</p>
        </div>
        <div>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wide mb-0.5">Éxito</p>
          <p className="text-emerald-400 text-xs font-bold">{wf.successRate}%</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-zinc-600 text-xs">
          {wf.nextRun ? `Próxima: ${wf.nextRun}` : "En espera de activación"}
        </p>
      </div>
    </div>
  );
}

export default function SistemaPage() {
  const active = WORKFLOWS.filter(w => w.status === "activo").length;
  const totalExec = WORKFLOWS.reduce((s, w) => s + w.executionsToday, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Estado del Sistema</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Automatizaciones n8n · Monitoreo en tiempo real</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Workflows activos", value: active, icon: Activity, color: "text-emerald-400" },
          { label: "Con errores", value: 0, icon: Activity, color: "text-zinc-500" },
          { label: "Ejecuciones hoy", value: totalExec, icon: Zap, color: "text-gold" },
          { label: "Costo sistema / mes", value: "$47 USD", icon: DollarSign, color: "text-gold" },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* All-green status banner */}
      <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
        <div>
          <p className="text-emerald-300 font-semibold text-sm">Todos los sistemas operando con normalidad</p>
          <p className="text-zinc-500 text-xs mt-0.5">{totalExec} ejecuciones exitosas hoy · {active} workflows activos</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-4 text-xs text-zinc-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Zap size={12} className="text-gold" />
          {totalExec} ejecuciones hoy
        </span>
        <span>·</span>
        <span>{WORKFLOWS.length} workflows configurados</span>
        <span>·</span>
        <span className="text-gold">Cava IA: activa 24/7</span>
        <span>·</span>
        <span className="text-emerald-400">Stripe: ✓ conectado</span>
        <span>·</span>
        <span className="text-emerald-400">Base44: ✓ sincronizado</span>
      </div>

      {/* Workflow cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {WORKFLOWS.map(wf => (
          <WorkflowCard key={wf.id} wf={wf} />
        ))}
      </div>

      {/* Cost section */}
      <div className="glass-card border border-white/7 p-6">
        <h3 className="text-zinc-100 font-semibold text-sm mb-4">Costos del sistema este mes</h3>
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <div>
            <p className="text-zinc-300 font-medium text-sm">n8n Cloud — Plan Starter</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {WORKFLOWS.length} workflows activos · Incluye todas las automatizaciones de Cavaliss
            </p>
          </div>
          <p className="text-gold font-bold text-sm">$47 USD/mes</p>
        </div>
        <div className="pt-3 flex justify-between items-center">
          <p className="text-zinc-600 text-xs">Plan renovable mensualmente</p>
          <p className="text-gold font-bold text-sm">Total: $47 USD/mes</p>
        </div>
      </div>
    </div>
  );
}

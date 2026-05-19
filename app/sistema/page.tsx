"use client";
import { useState } from "react";
import { Activity, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, DollarSign, Zap } from "lucide-react";
import { WORKFLOWS } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import type { WorkflowStatusType } from "@/lib/types";

const STATUS_CONFIG: Record<WorkflowStatusType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  activo: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Activo" },
  error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Error" },
  advertencia: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "Advertencia" },
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
    <div className={cn(
      "glass-card border p-5 glass-card-hover transition-all duration-200",
      wf.status === "error" ? "border-red-500/25" : wf.status === "advertencia" ? "border-amber-500/25" : "border-white/7"
    )}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", sc.bg)}>
            <div className={cn("w-4 h-4", sc.color)}>
              <StatusIcon size={16} className={cn(wf.status === "error" && "animate-pulse-gold")} />
            </div>
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

      {/* Error message */}
      {wf.lastError && (
        <div className={cn(
          "text-xs px-3 py-2 rounded-xl mb-3 border",
          wf.status === "error" ? "bg-red-500/8 border-red-500/20 text-red-300" : "bg-amber-500/8 border-amber-500/20 text-amber-300"
        )}>
          {wf.lastError}
        </div>
      )}

      {/* Stats */}
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
          <p className={cn("text-xs font-bold", wf.successRate >= 90 ? "text-emerald-400" : wf.successRate >= 50 ? "text-amber-400" : "text-red-400")}>
            {wf.successRate}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <p className="text-zinc-600 text-xs">
          {wf.nextRun ? `Próxima: ${wf.nextRun}` : "No programado"}
        </p>
        <p className="text-zinc-500 text-xs">${wf.monthlyCost}/mes</p>
      </div>
    </div>
  );
}

export default function SistemaPage() {
  const active = WORKFLOWS.filter(w => w.status === "activo").length;
  const errors = WORKFLOWS.filter(w => w.status === "error").length;
  const warnings = WORKFLOWS.filter(w => w.status === "advertencia").length;
  const totalCost = WORKFLOWS.reduce((s, w) => s + w.monthlyCost, 0);
  const totalExec = WORKFLOWS.reduce((s, w) => s + w.executionsToday, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Estado del Sistema</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Automatizaciones n8n · Monitoreo en tiempo real</p>
      </div>

      {/* System health */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Workflows activos", value: active, icon: Activity, color: "text-emerald-400" },
          { label: "Con errores", value: errors, icon: AlertCircle, color: errors > 0 ? "text-red-400" : "text-zinc-500" },
          { label: "Advertencias", value: warnings, icon: AlertTriangle, color: warnings > 0 ? "text-amber-400" : "text-zinc-500" },
          { label: "Costo sistema / mes", value: `$${totalCost}`, icon: DollarSign, color: "text-gold" },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Overall status banner */}
      <div className={cn(
        "p-4 rounded-xl border flex items-center gap-3",
        errors > 0 ? "border-red-500/25 bg-red-500/5" : warnings > 0 ? "border-amber-500/25 bg-amber-500/5" : "border-emerald-500/25 bg-emerald-500/5"
      )}>
        {errors > 0 ? (
          <>
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Sistema con {errors} error{errors > 1 ? "es" : ""} activo{errors > 1 ? "s" : ""}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Revisa los workflows en rojo y corrige antes de que afecte la operación</p>
            </div>
          </>
        ) : warnings > 0 ? (
          <>
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">{warnings} advertencia{warnings > 1 ? "s" : ""} en el sistema</p>
              <p className="text-zinc-500 text-xs mt-0.5">El sistema funciona pero hay items que merecen atención</p>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">Todos los sistemas operando con normalidad</p>
              <p className="text-zinc-500 text-xs mt-0.5">{totalExec} ejecuciones exitosas hoy</p>
            </div>
          </>
        )}
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
        <span>Base44: sincronizado</span>
        <span>·</span>
        <span className={errors > 0 ? "text-red-400" : "text-emerald-400"}>Stripe: {errors > 0 ? "⚠ revisar" : "✓ conectado"}</span>
      </div>

      {/* Workflow cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Errors first */}
        {[...WORKFLOWS].sort((a, b) => {
          const order = { error: 0, advertencia: 1, activo: 2 };
          return order[a.status] - order[b.status];
        }).map(wf => (
          <WorkflowCard key={wf.id} wf={wf} />
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="glass-card border border-white/7 p-6">
        <h3 className="text-zinc-100 font-semibold text-sm mb-4">Costos del sistema este mes</h3>
        <div className="space-y-2.5">
          {WORKFLOWS.map(wf => (
            <div key={wf.id} className="flex items-center gap-4">
              <p className="text-zinc-400 text-sm flex-1 truncate">{wf.name}</p>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/60"
                    style={{ width: `${(wf.monthlyCost / totalCost) * 100}%` }}
                  />
                </div>
                <span className="text-zinc-300 text-sm font-medium w-16 text-right">${wf.monthlyCost}/mes</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/5 flex justify-between">
            <p className="text-zinc-400 font-semibold text-sm">Total mensual</p>
            <p className="text-gold font-bold text-sm">${totalCost} MXN/mes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

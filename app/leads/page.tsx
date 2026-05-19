"use client";
import { useState, useEffect } from "react";
import { Target, TrendingUp, Clock, DollarSign } from "lucide-react";
import KanbanBoard from "@/components/leads/KanbanBoard";
import { LEADS } from "@/lib/data";
import { fetchLeads } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);

  useEffect(() => {
    fetchLeads().then(setLeads).catch(() => {});
  }, []);

  const total = leads.length;
  const converted = leads.filter(l => l.status === "Convertido").length;
  const convRate = total ? Math.round((converted / total) * 100) : 0;
  const avgDays = total ? Math.round(leads.reduce((s, l) => s + l.daysInPipeline, 0) / total) : 0;
  const pipeline = leads.filter(l => !["Convertido", "Perdido"].includes(l.status));
  const pipelineValue = pipeline.reduce((s, l) => s + l.estimatedValue, 0);
  const hot = leads.filter(l => l.temperature === "caliente" && !["Convertido", "Perdido"].includes(l.status));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Pipeline de Leads — Cava IA</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Arrastra los leads entre columnas para actualizar su estado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total leads activos", value: pipeline.length, suffix: "", icon: Target, color: "text-gold" },
          { label: "Tasa de conversión", value: convRate, suffix: "%", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Días promedio de cierre", value: avgDays, suffix: "d", icon: Clock, color: "text-blue-400" },
          { label: "Valor del pipeline", value: pipelineValue, prefix: "$", suffix: "", icon: DollarSign, color: "text-cavaliss-pink" },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className={`text-2xl font-bold ${k.color}`}>
              {k.prefix}{typeof k.value === "number" && k.label.includes("Valor")
                ? formatCurrency(k.value)
                : k.value.toLocaleString("es-MX")}{k.suffix}
            </p>
            <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Hot leads alert */}
      {hot.length > 0 && (
        <div className="glass-card border border-orange-500/25 bg-orange-500/5 p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-orange-300 font-semibold text-sm">
              {hot.length} lead{hot.length > 1 ? "s calientes" : " caliente"} esperando respuesta
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {hot.map(l => l.name.split(" ")[0]).join(", ")} — responde antes de que se enfríen
            </p>
          </div>
        </div>
      )}

      {/* Source breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { source: "Meta Ads", color: "border-blue-500/30 text-blue-400" },
          { source: "TikTok", color: "border-pink-500/30 text-pink-400" },
          { source: "Instagram", color: "border-purple-500/30 text-purple-400" },
          { source: "WhatsApp directo", color: "border-emerald-500/30 text-emerald-400" },
        ].map(s => {
          const count = leads.filter(l => l.source === s.source).length;
          const conv = leads.filter(l => l.source === s.source && l.status === "Convertido").length;
          return (
            <div key={s.source} className={`glass-card border p-4 ${s.color.split(" ")[0]}`}>
              <p className={`text-sm font-semibold ${s.color.split(" ")[1]}`}>{s.source}</p>
              <p className="text-2xl font-bold text-zinc-200 mt-1">{count}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{conv} convertidos ({count > 0 ? Math.round(conv / count * 100) : 0}%)</p>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div>
        <h2 className="text-zinc-300 font-semibold text-sm mb-4">Board de leads</h2>
        <KanbanBoard initialLeads={leads} />
      </div>
    </div>
  );
}

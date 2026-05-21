"use client";
import { useState, useEffect } from "react";
import { Target, TrendingUp, Clock, DollarSign } from "lucide-react";
import KanbanBoard from "@/components/leads/KanbanBoard";
import { fetchLeads } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmptyState from "@/components/EmptyState";
import type { Lead } from "@/lib/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pipeline = leads.filter(l => !["Convertido", "Perdido"].includes(l.status));
  const converted = leads.filter(l => l.status === "Convertido");
  const convRate = leads.length ? Math.round((converted.length / leads.length) * 100) : 0;
  const avgDays = pipeline.length ? Math.round(pipeline.reduce((s, l) => s + l.daysInPipeline, 0) / pipeline.length) : 0;
  const pipelineValue = pipeline.reduce((s, l) => s + l.estimatedValue, 0);
  const hot = leads.filter(l => l.temperature === "caliente" && !["Convertido", "Perdido"].includes(l.status));

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Pipeline de Leads — Cava IA</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {loading ? "Cargando leads..." : "Arrastra los leads entre columnas para actualizar su estado"}
        </p>
      </div>

      <ErrorBoundary label="KPIs de leads">
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
                {k.prefix}{k.label.includes("Valor") ? formatCurrency(k.value) : k.value.toLocaleString("es-MX")}{k.suffix}
              </p>
              <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {hot.length > 0 && (
        <div className="glass-card border border-orange-500/25 bg-orange-500/5 p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-orange-300 font-semibold text-sm">
              {hot.length} lead{hot.length > 1 ? "s calientes" : " caliente"} en el pipeline
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {hot.slice(0, 3).map(l => l.name.split(" ")[0]).join(", ")} — prioridad de seguimiento
            </p>
          </div>
        </div>
      )}

      <ErrorBoundary label="Fuentes de leads">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["Meta Ads", "TikTok", "Instagram", "WhatsApp directo"] as const).map((source, _i) => {
            const colorMap = {
              "Meta Ads": "border-blue-500/30 text-blue-400",
              TikTok: "border-pink-500/30 text-pink-400",
              Instagram: "border-purple-500/30 text-purple-400",
              "WhatsApp directo": "border-emerald-500/30 text-emerald-400",
            };
            const cls = colorMap[source];
            const count = leads.filter(l => l.source === source).length;
            const conv = leads.filter(l => l.source === source && l.status === "Convertido").length;
            return (
              <div key={source} className={`glass-card border p-4 ${cls.split(" ")[0]}`}>
                <p className={`text-sm font-semibold ${cls.split(" ")[1]}`}>{source}</p>
                <p className="text-2xl font-bold text-zinc-200 mt-1">{count}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {conv} convertidos ({count > 0 ? Math.round((conv / count) * 100) : 0}%)
                </p>
              </div>
            );
          })}
        </div>
      </ErrorBoundary>

      <ErrorBoundary label="Kanban de leads">
        {!loading && leads.length === 0 ? (
          <div className="glass-card border border-white/7 p-6">
            <EmptyState
              icon={Target}
              title="Sin leads registrados"
              description="Los leads se cargan desde la hoja 'Leads' de Google Sheets."
            />
          </div>
        ) : (
          <div>
            <h2 className="text-zinc-300 font-semibold text-sm mb-4">Board de leads</h2>
            <KanbanBoard initialLeads={leads} />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

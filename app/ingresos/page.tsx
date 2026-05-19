"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import { DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { MONTHLY_SUMMARY } from "@/lib/data";
import { fetchIngresos } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const SERVICE_COLORS = ["#D4A017", "#A855F7", "#F43F5E", "#3B82F6", "#14B8A6", "#8B5CF6", "#F97316", "#10B981", "#0EA5E9"];

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-gold/15 p-3 text-xs shadow-gold-lg">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-gold font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function IngresosPage() {
  const [summary, setSummary] = useState(MONTHLY_SUMMARY);

  useEffect(() => {
    fetchIngresos().then(d => setSummary(d.summary)).catch(() => {});
  }, []);

  const { currentMonth, previousMonth, target, weeklyData, byService, pendingDeposits } = summary;
  const growth = previousMonth ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) : 0;
  const targetPct = Math.round((currentMonth / target) * 100);
  const projectedEnd = Math.round(currentMonth * 1.18);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Ingresos y Finanzas</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Mayo 2026 · Cavaliss Spa Capilar</p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Ingresos del mes", value: formatCurrency(currentMonth), sub: `+${growth}% vs mes anterior`, color: "text-gold", icon: DollarSign },
          { label: "Meta del mes", value: `${targetPct}%`, sub: `Meta: ${formatCurrency(target)}`, color: "text-emerald-400", icon: TrendingUp },
          { label: "Mes anterior", value: formatCurrency(previousMonth), sub: "Abril 2026", color: "text-blue-400", icon: Calendar },
          { label: "Proyección fin de mes", value: formatCurrency(projectedEnd), sub: "Basado en tendencia", color: "text-cavaliss-pink", icon: TrendingUp },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar to target */}
      <div className="glass-card border border-white/7 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-zinc-300 font-semibold text-sm">Avance a meta de {formatCurrency(target)}</p>
          <span className="text-gold font-bold text-sm">{targetPct}%</span>
        </div>
        <div className="h-4 rounded-full bg-white/6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
            style={{ width: `${Math.min(targetPct, 100)}%`, background: "linear-gradient(90deg, #D4A017, #E8B94A)" }}
          >
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-zinc-500 text-xs">{formatCurrency(currentMonth)} alcanzados</p>
          <p className="text-zinc-500 text-xs">Faltan {formatCurrency(target - currentMonth)}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly */}
        <div className="glass-card border border-white/7 p-6">
          <h3 className="text-zinc-100 font-semibold text-sm mb-5">Ingresos por semana</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === 3 ? "rgba(212,160,23,0.5)" : "#D4A017"} opacity={i === 3 ? 0.7 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-zinc-600 text-xs text-center mt-2">* Sem 4 es proyección basada en citas confirmadas</p>
        </div>

        {/* Services breakdown */}
        <div className="glass-card border border-white/7 p-6">
          <h3 className="text-zinc-100 font-semibold text-sm mb-5">Ingresos por servicio</h3>
          <div className="space-y-3">
            {byService.map((s, i) => {
              const pct = Math.round((s.amount / currentMonth) * 100);
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SERVICE_COLORS[i] }} />
                      <span className="text-zinc-400 text-xs truncate max-w-[160px]">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-200 text-xs font-semibold">{formatCurrency(s.amount)}</span>
                      <span className="text-zinc-600 text-xs ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: SERVICE_COLORS[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending deposits */}
      <div className="glass-card border border-amber-500/20 bg-amber-500/4 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-amber-400" />
          <h3 className="text-zinc-100 font-semibold text-sm">Anticipos pendientes de cobrar</h3>
          <span className="text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
            {formatCurrency(pendingDeposits.reduce((s, d) => s + d.amount, 0))} total
          </span>
        </div>
        <div className="space-y-2">
          {pendingDeposits.map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="flex-1">
                <p className="text-zinc-200 text-sm font-medium">{d.client}</p>
                <p className="text-zinc-500 text-xs">{d.service} · {d.date}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-bold text-sm">{formatCurrency(d.amount)}</p>
                <p className="text-zinc-600 text-xs">pendiente</p>
              </div>
              <button className="text-xs text-gold border border-gold/25 hover:bg-gold/10 rounded-lg px-3 py-1.5 transition-all duration-200">
                Cobrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Month comparison */}
      <div className="glass-card border border-white/7 p-6">
        <h3 className="text-zinc-100 font-semibold text-sm mb-5">Comparativa mes actual vs anterior</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Mayo 2026 (actual)", value: currentMonth, color: "#D4A017" },
            { label: "Abril 2026", value: previousMonth, color: "#52525b" },
          ].map(m => (
            <div key={m.label} className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-zinc-400 text-xs mb-2">{m.label}</p>
                <div className="h-20 flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-1000"
                    style={{
                      height: `${Math.round((m.value / Math.max(currentMonth, previousMonth)) * 100)}%`,
                      background: m.color,
                      opacity: m.color === "#52525b" ? 0.5 : 1,
                    }}
                  />
                </div>
                <p className="font-bold mt-2" style={{ color: m.color }}>{formatCurrency(m.value)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className={`text-sm mt-4 ${growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}% vs mes anterior ({growth >= 0 ? "+" : ""}{formatCurrency(currentMonth - previousMonth)})
        </p>
      </div>
    </div>
  );
}

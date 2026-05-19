"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { REVENUE_DATA } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const SERVICES = [
  { key: "Luminoplastia", color: "#EC4899" },
  { key: "VIP Curly Experience", color: "#A855F7" },
  { key: "Mesoterapia con Exosomas", color: "#F43F5E" },
  { key: "Reconstrucción Molecular", color: "#3B82F6" },
  { key: "Nutrición Capilar", color: "#8B5CF6" },
  { key: "Ritual Detox", color: "#14B8A6" },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc, p) => acc + (p.value || 0), 0);
  return (
    <div className="glass-card border border-gold/15 p-4 text-xs shadow-gold-lg min-w-[200px]">
      <p className="text-zinc-400 font-medium mb-2">{label}</p>
      <p className="text-gold font-bold text-base mb-2">{formatCurrency(total)}</p>
      <div className="space-y-1">
        {payload.filter(p => p.value > 0).map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-zinc-400 truncate max-w-[120px]">{p.name}</span>
            </div>
            <span className="text-zinc-200 font-medium">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatXAxis(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function RevenueChart() {
  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-zinc-100 font-semibold text-base">Ingresos — Últimos 30 días</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Desglose por servicio</p>
        </div>
        <div className="flex gap-2">
          {["7d", "14d", "30d"].map((d) => (
            <button
              key={d}
              className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 ${d === "30d" ? "bg-gold/15 text-gold border border-gold/25" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            {SERVICES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          {SERVICES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stackId="1"
              stroke={s.color}
              strokeWidth={1.5}
              fill={`url(#grad-${s.key.replace(/\s/g, "")})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

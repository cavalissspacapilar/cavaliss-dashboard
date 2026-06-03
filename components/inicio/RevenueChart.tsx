"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchIngresos } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { DollarSign } from "lucide-react";
import type { RevenueDataPoint } from "@/lib/types";

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-gold/15 p-3 text-xs shadow-gold-lg">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-gold font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function formatXAxis(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchIngresos()
      .then(d => { setData(d.revenueData); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const hasData = data.some(d => d.amount > 0);

  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-zinc-100 font-semibold text-base">Ingresos — Últimos 30 días</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Pagos procesados por Stripe</p>
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

      {loaded && !hasData ? (
        <EmptyState
          icon={DollarSign}
          title="Sin ingresos registrados en los últimos 30 días"
          description="Los ingresos aparecerán aquí cuando se procesen pagos"
          className="py-12"
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="grad-ingresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A017" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#D4A017" stopOpacity={0.03} />
              </linearGradient>
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
            <Area
              type="monotone"
              dataKey="amount"
              name="Ingresos totales"
              stroke="#D4A017"
              strokeWidth={2}
              fill="url(#grad-ingresos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

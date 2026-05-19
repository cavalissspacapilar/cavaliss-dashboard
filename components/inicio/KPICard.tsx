"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color?: "gold" | "pink" | "emerald" | "blue";
  detail?: React.ReactNode;
}

const COLOR_MAP = {
  gold: {
    border: "border-gold/20 hover:border-gold/40",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    trendUp: "text-emerald-400",
    trendDown: "text-red-400",
    glow: "hover:shadow-gold",
  },
  pink: {
    border: "border-cavaliss-pink/20 hover:border-cavaliss-pink/40",
    iconBg: "bg-cavaliss-pink/10",
    iconColor: "text-cavaliss-pink",
    trendUp: "text-emerald-400",
    trendDown: "text-red-400",
    glow: "hover:shadow-pink",
  },
  emerald: {
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    trendUp: "text-emerald-400",
    trendDown: "text-red-400",
    glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    trendUp: "text-emerald-400",
    trendDown: "text-red-400",
    glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
};

export default function KPICard({
  label, value, prefix, suffix, decimals = 0,
  trend, trendLabel, icon, color = "gold", detail,
}: KPICardProps) {
  const [focused, setFocused] = useState(false);
  const c = COLOR_MAP[color];
  const isPositive = trend >= 0;

  return (
    <>
      <button
        className={cn(
          "glass-card border text-left p-5 cursor-pointer glass-card-hover transition-all duration-300 w-full",
          c.border, c.glow
        )}
        onClick={() => setFocused(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl", c.iconBg)}>
            <div className={cn("w-5 h-5", c.iconColor)}>{icon}</div>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
            isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? "+" : ""}{trend}%
          </div>
        </div>

        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className={cn("text-3xl font-bold tabular-nums block", color === "gold" ? "text-gradient-gold" : "text-zinc-100")}
        />

        <p className="text-zinc-500 text-sm mt-1.5 font-medium">{label}</p>
        {trendLabel && (
          <p className={cn("text-xs mt-1", isPositive ? "text-emerald-400/70" : "text-red-400/70")}>
            {trendLabel}
          </p>
        )}
      </button>

      {focused && (
        <div className="focus-overlay animate-fade-in" onClick={() => setFocused(false)}>
          <div
            className={cn("glass-card border p-8 w-full max-w-xl animate-scale-in", c.border)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-100">{label}</h2>
              <button onClick={() => setFocused(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className={cn("text-5xl font-black tabular-nums mb-4", color === "gold" ? "text-gradient-gold" : "text-zinc-100")}>
              {prefix}{value.toLocaleString("es-MX", { minimumFractionDigits: decimals })}{suffix}
            </div>
            <div className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg mb-6",
              isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? "+" : ""}{trend}% vs ayer
            </div>
            {detail && <div className="mt-4">{detail}</div>}
            {!detail && (
              <p className="text-zinc-500 text-sm">Análisis detallado disponible al conectar con el sistema Base44.</p>
            )}
            <button onClick={() => setFocused(false)} className="mt-6 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Presiona ESC o haz clic fuera para cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

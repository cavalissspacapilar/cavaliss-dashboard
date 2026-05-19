"use client";
import { useEffect, useState } from "react";
import { TODAY_KPIS } from "@/lib/data";

const METRICS = [
  { label: "Ocupación", value: 85, color: "#D4A017" },
  { label: "Conversión", value: 34, color: "#C2185B" },
  { label: "Retención", value: 78, color: "#10B981" },
  { label: "Ingresos vs meta", value: 67, color: "#3B82F6" },
];

function GaugeArc({ score, size = 160 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 56;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const circumference = Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = circumference * (1 - animated / 100);

  const color = score >= 75 ? "#10B981" : score >= 50 ? "#D4A017" : "#EF4444";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        className="gauge-bg"
        strokeWidth="12"
        fill="none"
      />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        stroke={color}
        strokeDasharray={`${dashArray}`}
        strokeDashoffset={`${dashOffset}`}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color}66)` }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="28" fontWeight="800" fontFamily="var(--font-inter)">
        {animated.toFixed(0)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#52525b" fontSize="11" fontFamily="var(--font-inter)">
        /100
      </text>
    </svg>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 300); }, [value]);
  return (
    <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function HealthScore() {
  const score = TODAY_KPIS.healthScore;
  const label = score >= 80 ? "Excelente" : score >= 65 ? "Bueno" : score >= 50 ? "Regular" : "Crítico";
  const labelColor = score >= 80 ? "text-emerald-400" : score >= 65 ? "text-gold" : score >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="glass-card border border-white/7 p-6">
      <h3 className="text-zinc-100 font-semibold text-base mb-1">Score de salud</h3>
      <p className="text-zinc-500 text-xs mb-4">Índice operativo del negocio</p>

      <div className="flex flex-col items-center">
        <GaugeArc score={score} />
        <p className={`text-sm font-bold -mt-1 ${labelColor}`}>{label}</p>
        <p className="text-zinc-600 text-xs mt-1">vs 68 ayer (+4 pts)</p>
      </div>

      <div className="mt-5 space-y-3">
        {METRICS.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-xs">{m.label}</span>
              <span className="text-xs font-semibold" style={{ color: m.color }}>{m.value}%</span>
            </div>
            <MiniBar value={m.value} color={m.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

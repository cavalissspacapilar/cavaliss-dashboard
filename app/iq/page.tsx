"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Camera,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmptyState from "@/components/EmptyState";
import type {
  IQDashboardData,
  IQClienteSummary,
  IQClienteDetail,
  PerfilCapilarV2,
} from "@/lib/iq-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_DASHBOARD: IQDashboardData = {
  total_clientes: 0,
  hair_score_promedio: 0,
  mejorando: 0,
  en_riesgo: 0,
  datos_completos: 0,
};

function scoreColor(score: number): string {
  if (score <= 40) return "bg-red-500";
  if (score <= 70) return "bg-amber-400";
  return "bg-emerald-400";
}

function scoreTextColor(score: number): string {
  if (score <= 40) return "text-red-400";
  if (score <= 70) return "text-amber-400";
  return "text-emerald-400";
}

function riskStyles(riesgo: string): string {
  const r = riesgo.toLowerCase();
  if (r === "alto" || r === "critico" || r === "crítico")
    return "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse-gold";
  if (r === "medio")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (r === "bajo")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

function TendenciaIcon({ tendencia }: { tendencia: string }) {
  const t = tendencia.toLowerCase();
  if (t.includes("sub") || t === "mejorando" || t === "positiva")
    return <TrendingUp size={14} className="text-emerald-400" />;
  if (t.includes("baj") || t === "empeorando" || t === "negativa")
    return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-zinc-500" />;
}

function formatDate(raw: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── HairScoreBar ─────────────────────────────────────────────────────────────
function HairScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2">
      <span className={cn("text-sm font-bold w-8 text-right tabular-nums", scoreTextColor(score))}>
        {score || "—"}
      </span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", scoreColor(score))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── RiskBadge ────────────────────────────────────────────────────────────────
function RiskBadge({ riesgo }: { riesgo: string }) {
  if (!riesgo) return <span className="text-zinc-600 text-xs">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize",
        riskStyles(riesgo)
      )}
    >
      {riesgo}
    </span>
  );
}

// ─── KPICard ──────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant: "gold" | "emerald" | "red" | "zinc";
  decimals?: number;
}

function IQKPICard({ label, value, icon, variant, decimals = 0 }: KPICardProps) {
  const variantCls = {
    gold: "border-gold-500/20 text-gold",
    emerald: "border-emerald-500/20 text-emerald-400",
    red: "border-red-500/20 text-red-400",
    zinc: "border-white/7 text-zinc-300",
  }[variant];

  const iconBg = {
    gold: "bg-gold-500/10",
    emerald: "bg-emerald-500/10",
    red: "bg-red-500/10",
    zinc: "bg-white/5",
  }[variant];

  const numDisplay =
    typeof value === "number"
      ? value.toLocaleString("es-MX", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : value;

  return (
    <div className={cn("glass-card border p-5 glass-card-hover", variantCls.split(" ")[0])}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", iconBg)}>
        {icon}
      </div>
      <p className={cn("text-3xl font-bold tabular-nums", variantCls.split(" ")[1])}>
        {numDisplay}
      </p>
      <p className="text-zinc-500 text-sm mt-1">{label}</p>
    </div>
  );
}

// ─── RadarChart component ─────────────────────────────────────────────────────
function HairRadarChart({ perfil }: { perfil: PerfilCapilarV2 }) {
  const data = [
    { metric: "Daño",        value: perfil.score_dano,         fullMark: 100 },
    { metric: "Hidratación", value: perfil.score_hidratacion,  fullMark: 100 },
    { metric: "Frizz",       value: perfil.score_frizz,        fullMark: 100 },
    { metric: "Rotura",      value: perfil.score_rotura,       fullMark: 100 },
    { metric: "Caída",       value: perfil.score_caida,        fullMark: 100 },
    { metric: "Brillo",      value: perfil.score_brillo,       fullMark: 100 },
    { metric: "Elasticidad", value: perfil.score_elasticidad,  fullMark: 100 },
  ];

  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
        Sin datos de scores individuales
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#a1a1aa", fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: "#71717a", fontSize: 8 }}
          axisLine={false}
          tickCount={4}
        />
        <Radar
          name="Hair Score"
          dataKey="value"
          stroke="#D4A017"
          fill="#D4A017"
          fillOpacity={0.22}
          strokeWidth={1.5}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0];
            return (
              <div className="glass-card border border-gold/20 px-3 py-2 text-xs">
                <p className="text-zinc-300 font-medium">{item.name}</p>
                <p className="text-gold font-bold">{String(item.value)}</p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── IQPanel (slide-in) ───────────────────────────────────────────────────────
interface IQPanelProps {
  clientProfileId: string;
  onClose: () => void;
}

function IQPanelInner({ clientProfileId, onClose }: IQPanelProps) {
  const [detail, setDetail] = useState<IQClienteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    fetch(`/api/iq/cliente/${encodeURIComponent(clientProfileId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<IQClienteDetail>) : null))
      .then((data) => {
        if (data) setDetail(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientProfileId]);

  const perfil = detail?.perfil ?? null;
  const snapshots = detail?.snapshots ?? [];

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Panel header */}
      <div className="flex items-start justify-between p-5 border-b border-white/7 shrink-0">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-zinc-100 font-bold text-base truncate">
                  {perfil?.nombre || clientProfileId}
                </p>
                {perfil?.tendencia && (
                  <TendenciaIcon tendencia={perfil.tendencia} />
                )}
              </div>
              {perfil ? (
                <div className="flex items-center gap-3">
                  <span className={cn("text-2xl font-black tabular-nums", scoreTextColor(perfil.score_general_capilar))}>
                    {perfil.score_general_capilar}
                  </span>
                  <span className="text-zinc-600 text-xs">Hair Score</span>
                  {perfil.riesgo_abandono && (
                    <RiskBadge riesgo={perfil.riesgo_abandono} />
                  )}
                </div>
              ) : (
                !loading && (
                  <p className="text-zinc-500 text-xs">Sin perfil IQ</p>
                )
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-3 shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !perfil ? (
          <div className="p-6">
            <EmptyState
              icon={Sparkles}
              title="Esta clienta aún no tiene diagnóstico IQ registrado"
              description="Los perfiles capilares aparecerán aquí cuando se registren los primeros diagnósticos."
            />
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Radar chart */}
            <section>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Análisis de 7 Dimensiones
              </h3>
              <div className="glass-card border border-white/7 p-3 rounded-xl">
                <HairRadarChart perfil={perfil} />
              </div>
            </section>

            {/* Objetivo + datos */}
            {perfil.objetivo_capilar && (
              <section>
                <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Objetivo Capilar
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed glass-card border border-white/7 px-4 py-3 rounded-xl">
                  {perfil.objetivo_capilar}
                </p>
              </section>
            )}

            {/* Before / After */}
            {(perfil.foto_antes_url || perfil.foto_despues_url) && (
              <section>
                <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Antes · Después
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Antes", url: perfil.foto_antes_url },
                    { label: "Después", url: perfil.foto_despues_url },
                  ].map(({ label, url }) => (
                    <div key={label} className="glass-card border border-white/7 rounded-xl overflow-hidden">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-zinc-700">
                          <Camera size={20} className="mb-1" />
                          <span className="text-xs">Sin foto</span>
                        </div>
                      )}
                      <p className="text-zinc-500 text-xs text-center py-1.5">{label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Snapshots timeline */}
            <section>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Historial de Diagnósticos
              </h3>
              {snapshots.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-4">
                  Sin historial registrado
                </p>
              ) : (
                <div className="space-y-2">
                  {snapshots.map((snap, idx) => (
                    <div
                      key={snap.id || idx}
                      className="flex items-start gap-3 glass-card border border-white/5 px-4 py-3 rounded-xl"
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-zinc-400 text-xs">
                            {formatDate(snap.fecha_snapshot)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-xs font-bold tabular-nums", scoreTextColor(snap.score_general))}>
                              {snap.score_general || "—"}
                            </span>
                            {snap.tendencia && (
                              <TendenciaIcon tendencia={snap.tendencia} />
                            )}
                          </div>
                        </div>
                        {snap.servicio_aplicado && (
                          <p className="text-zinc-500 text-xs mt-0.5 truncate">
                            {snap.servicio_aplicado}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IQPage() {
  const [dashboard, setDashboard] = useState<IQDashboardData>(EMPTY_DASHBOARD);
  const [clientes, setClientes] = useState<IQClienteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, clientesRes] = await Promise.allSettled([
        fetch("/api/iq/dashboard").then((r) =>
          r.ok ? (r.json() as Promise<IQDashboardData>) : null
        ),
        fetch("/api/iq/clientes").then((r) =>
          r.ok ? (r.json() as Promise<IQClienteSummary[]>) : null
        ),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value) {
        setDashboard(dashRes.value);
      }
      if (clientesRes.status === "fulfilled" && clientesRes.value) {
        setClientes(clientesRes.value);
      }
    } catch {
      // individual errors handled by Promise.allSettled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isEmpty = !loading && clientes.length === 0 && dashboard.total_clientes === 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <Sparkles size={20} className="text-gold" />
            <h1 className="text-2xl font-bold text-zinc-100">Cavaliss IQ</h1>
          </div>
          <p className="text-zinc-500 text-sm">
            {loading
              ? "Cargando perfiles capilares..."
              : isEmpty
              ? "Sin datos aún"
              : `Inteligencia capilar · ${dashboard.total_clientes} perfil${dashboard.total_clientes !== 1 ? "es" : ""} registrado${dashboard.total_clientes !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <ErrorBoundary label="KPIs Cavaliss IQ">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <IQKPICard
            label="Hair Score Promedio"
            value={dashboard.hair_score_promedio}
            decimals={1}
            icon={<Sparkles size={18} className="text-gold" />}
            variant="gold"
          />
          <IQKPICard
            label="Clientas con Perfil IQ"
            value={dashboard.total_clientes}
            icon={<Users size={18} className="text-zinc-400" />}
            variant="zinc"
          />
          <IQKPICard
            label="Clientas Mejorando"
            value={dashboard.mejorando}
            icon={<CheckCircle2 size={18} className="text-emerald-400" />}
            variant="emerald"
          />
          <IQKPICard
            label="En Riesgo de Abandono"
            value={dashboard.en_riesgo}
            icon={<AlertTriangle size={18} className="text-red-400" />}
            variant="red"
          />
        </div>
      </ErrorBoundary>

      {/* ── Clients table ─────────────────────────────────────────────────── */}
      <ErrorBoundary label="Tabla Clientas IQ">
        <div className="glass-card border border-white/7 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-zinc-100 font-semibold text-base">
              Perfiles Capilares
            </h3>
            {dashboard.datos_completos > 0 && (
              <span className="text-xs text-zinc-500">
                {dashboard.datos_completos} perfil{dashboard.datos_completos !== 1 ? "es" : ""} completo{dashboard.datos_completos !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/3 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={Sparkles}
              title="Cavaliss IQ está listo"
              description="Los perfiles capilares aparecerán aquí cuando se registren los primeros diagnósticos."
            />
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Clienta", "Hair Score", "Riesgo", "Objetivo", "Último diagnóstico", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-zinc-500 text-xs font-medium py-2 px-3 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => {
                    const panelId = c.client_profile_id || c.id;
                    const isSelected = selectedId === panelId;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(isSelected ? null : panelId)}
                        className={cn(
                          "border-b border-white/4 transition-all duration-150 cursor-pointer group",
                          isSelected
                            ? "bg-gold/5 border-gold/15"
                            : "hover:bg-white/3"
                        )}
                      >
                        {/* Clienta */}
                        <td className="py-3 px-3">
                          <p className="text-zinc-200 font-medium truncate max-w-[140px]">
                            {c.nombre || c.client_profile_id || "—"}
                          </p>
                        </td>

                        {/* Hair Score */}
                        <td className="py-3 px-3 w-36">
                          <HairScoreBar score={c.score_general_capilar} />
                        </td>

                        {/* Riesgo */}
                        <td className="py-3 px-3">
                          <RiskBadge riesgo={c.riesgo_abandono} />
                        </td>

                        {/* Objetivo */}
                        <td className="py-3 px-3 max-w-[160px]">
                          <p className="text-zinc-400 text-xs truncate">
                            {c.objetivo_capilar || "—"}
                          </p>
                        </td>

                        {/* Fecha */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="text-zinc-500 text-xs">
                            {formatDate(c.fecha_ultimo_diagnostico)}
                          </p>
                        </td>

                        {/* Arrow */}
                        <td className="py-3 px-3 w-8">
                          <ChevronRight
                            size={14}
                            className={cn(
                              "transition-all",
                              isSelected
                                ? "text-gold rotate-90"
                                : "text-zinc-700 group-hover:text-zinc-500"
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* ── Slide-in panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedId && (
          <>
            {/* Backdrop */}
            <motion.div
              key="iq-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setSelectedId(null)}
            />

            {/* Panel */}
            <motion.div
              key="iq-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[96vw] z-50 border-l border-white/7 shadow-2xl overflow-hidden"
            >
              <ErrorBoundary label="Panel IQ">
                <IQPanelInner
                  clientProfileId={selectedId}
                  onClose={() => setSelectedId(null)}
                />
              </ErrorBoundary>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

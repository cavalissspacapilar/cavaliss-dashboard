"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X, Copy, Check, Search, Zap, TrendingUp, Target,
  Clock, DollarSign, ExternalLink,
} from "lucide-react";
import { fetchLeads } from "@/lib/api-client";
import { cn, getInitials, getAvatarColor, formatCurrency } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmptyState from "@/components/EmptyState";
import type { Lead, LeadStatus, LeadTemperature, LeadSource } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const PIPELINE_COLS: {
  status: LeadStatus; label: string;
  accent: string; dimBg: string; countColor: string;
}[] = [
  { status: "Nuevo",          label: "Nuevo",         accent: "#3B82F6", dimBg: "rgba(59,130,246,0.07)",   countColor: "#93C5FD" },
  { status: "En conversación",label: "En conversación",accent: "#F59E0B", dimBg: "rgba(245,158,11,0.07)",  countColor: "#FCD34D" },
  { status: "Lead caliente",  label: "🔥 Caliente",   accent: "#EF4444", dimBg: "rgba(239,68,68,0.07)",    countColor: "#FCA5A5" },
  { status: "Reserva lista",  label: "Reserva lista", accent: "#10B981", dimBg: "rgba(16,185,129,0.07)",   countColor: "#6EE7B7" },
  { status: "Convertido",     label: "✓ Convertido",  accent: "#D4A017", dimBg: "rgba(212,160,23,0.07)",   countColor: "#E8B94A" },
  { status: "Perdido",        label: "Perdido",       accent: "#6B7280", dimBg: "rgba(107,114,128,0.04)",  countColor: "#9CA3AF" },
];

const SOURCE_CFG: Record<LeadSource, { emoji: string; color: string; bg: string }> = {
  "Meta Ads":        { emoji: "🎯", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"    },
  "WhatsApp directo":{ emoji: "📱", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "Instagram":       { emoji: "📸", color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  "TikTok":          { emoji: "🎵", color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20"    },
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  "Nuevo":           "text-zinc-400 border-zinc-500/30 bg-zinc-500/10",
  "En conversación": "text-blue-400 border-blue-500/25 bg-blue-500/10",
  "Lead caliente":   "text-red-400 border-red-500/25 bg-red-500/10",
  "Reserva lista":   "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  "Convertido":      "text-[#D4A017] border-[#D4A017]/25 bg-[#D4A017]/10",
  "Perdido":         "text-zinc-600 border-zinc-600/20 bg-zinc-600/5",
};

const CARD_CSS = `
  @keyframes pulse-red-glow {
    0%,100% { box-shadow: 0 0 6px rgba(239,68,68,.22), 0 0 0 1px rgba(239,68,68,.35); }
    50%      { box-shadow: 0 0 18px rgba(239,68,68,.44), 0 0 0 1px rgba(239,68,68,.60); }
  }
  .hot-glow { animation: pulse-red-glow 2s ease-in-out infinite; }

  @keyframes hud-scan {
    0%   { top: -80px; }
    100% { top: 100%;  }
  }
  .hud-scanline {
    position:absolute; left:0; right:0; height:80px; pointer-events:none; z-index:0;
    background: linear-gradient(to bottom, transparent, rgba(212,160,23,.045), transparent);
    animation: hud-scan 8s linear infinite;
  }

  @keyframes card-land {
    0%   { transform: translateY(-6px) scale(.97); opacity:.65; }
    60%  { transform: translateY(2px)  scale(1.01); }
    100% { transform: translateY(0)    scale(1);    opacity:1;  }
  }
  .card-land { animation: card-land .22s cubic-bezier(.34,1.56,.64,1) forwards; }

  @keyframes cnt-in {
    from { opacity:0; transform:translateY(7px); }
    to   { opacity:1; transform:translateY(0);   }
  }
  .cnt-in { animation: cnt-in .55s ease-out forwards; }
`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function relTime(d?: string): string {
  if (!d) return "—";
  try {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days <  0) return "reciente";
    if (days === 0) return "hoy";
    if (days === 1) return "hace 1 día";
    if (days <  7) return `hace ${days} días`;
    if (days < 14) return "hace 1 sem.";
    if (days < 30) return `hace ${Math.floor(days / 7)} sem.`;
    return `hace ${Math.floor(days / 30)} mes`;
  } catch { return "—"; }
}

function fmtDate(d?: string): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

function displayName(l: Lead): string {
  return l.name?.trim() || `Lead #${String(l.id).padStart(4, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────

function useAnimCounter(target: number, active: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setV(0); return; }
    const start = Date.now();
    const dur = 1100;
    let raf: number;
    const tick = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return v;
}

// ─────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = 420; c.height = 90;
    const pts = Array.from({ length: 24 }, () => ({
      x: Math.random() * 420, y: Math.random() * 90,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .22,
      r: Math.random() * 1.4 + .4, o: Math.random() * .32 + .06,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, 420, 90);
      pts.forEach(p => {
        p.x = (p.x + p.vx + 420) % 420;
        p.y = (p.y + p.vy + 90) % 90;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,23,${p.o})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-80" />;
}

// ─────────────────────────────────────────────────────────────
// COPY FIELD
// ─────────────────────────────────────────────────────────────

function CopyField({ value, mono = true }: { value?: string; mono?: boolean }) {
  const [ok, setOk] = useState(false);
  if (!value) return <span className="text-zinc-600 text-xs">—</span>;
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 group text-left">
      <span className={cn("text-zinc-300 text-xs leading-snug truncate max-w-[170px]", mono && "font-mono")}>
        {value}
      </span>
      <span className={cn("opacity-0 group-hover:opacity-100 transition-opacity shrink-0", ok ? "text-emerald-400" : "text-zinc-600")}>
        {ok ? <Check size={10} /> : <Copy size={10} />}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// INTEL SECTION / ROW
// ─────────────────────────────────────────────────────────────

function IntelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-px bg-[#D4A017]/40" />
        <p className="text-[9px] font-mono text-[#D4A017]/50 uppercase tracking-[.22em]">{title}</p>
        <div className="flex-1 h-px bg-[#D4A017]/10" />
      </div>
      <div className="rounded-xl border border-white/5 bg-white/2 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function IntelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider shrink-0">{label}</p>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────────────────────────

function LeadTimeline({ lead }: { lead: Lead }) {
  const ordered: LeadStatus[] = ["Nuevo", "En conversación", "Lead caliente", "Reserva lista", "Convertido"];
  const curIdx = ordered.indexOf(lead.status);
  const isLost = lead.status === "Perdido";

  return (
    <div className="rounded-xl border border-white/5 bg-white/2 px-3 py-2.5 space-y-0">
      {ordered.map((s, i) => {
        const done   = !isLost && i <= curIdx;
        const active = !isLost && i === curIdx;
        const date   = s === "Nuevo" ? lead.entryDate : s === "Convertido" ? lead.conversionDate : undefined;
        return (
          <div key={s} className="flex items-start gap-3 py-1">
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300",
                active ? "border-[#D4A017] bg-[#D4A017] shadow-[0_0_6px_rgba(212,160,23,.5)]"
                       : done ? "border-emerald-500 bg-emerald-500/80"
                               : "border-zinc-700 bg-transparent"
              )} />
              {i < ordered.length - 1 && (
                <div className={cn("w-px h-4 mt-0.5", done ? "bg-emerald-500/25" : "bg-zinc-800")} />
              )}
            </div>
            <div>
              <p className={cn("text-xs font-medium", active ? "text-[#D4A017]" : done ? "text-zinc-300" : "text-zinc-700")}>
                {s}
              </p>
              {date && <p className="text-[10px] text-zinc-600 font-mono">{fmtDate(date)}</p>}
            </div>
          </div>
        );
      })}
      {isLost && (
        <div className="flex items-center gap-3 py-1 border-t border-red-500/10 mt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 border-2 border-red-500 shrink-0" />
          <p className="text-xs text-red-400 font-medium">Perdido</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INTEL PANEL
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS: { label: string; status: LeadStatus; emoji: string; cls: string }[] = [
  { label: "Caliente",   status: "Lead caliente", emoji: "🔥", cls: "border-red-500/20 text-red-400 hover:bg-red-500/10"        },
  { label: "Convertido", status: "Convertido",    emoji: "✓",  cls: "border-[#D4A017]/20 text-[#D4A017] hover:bg-[#D4A017]/10" },
  { label: "Perdido",    status: "Perdido",       emoji: "✗",  cls: "border-zinc-600/20 text-zinc-500 hover:bg-zinc-600/10"    },
];

function IntelPanel({
  lead, onClose, onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (lead: Lead, s: LeadStatus) => void;
}) {
  const name = displayName(lead);
  const src  = SOURCE_CFG[lead.source] ?? SOURCE_CFG["WhatsApp directo"];
  const [busy, setBusy] = useState<string | null>(null);

  async function doStatus(s: LeadStatus) {
    setBusy(s);
    try {
      await fetch("/api/leads/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: lead.phone || undefined, leadId: lead.leadId || undefined, newStatus: s }),
      });
      onStatusChange(lead, s);
    } catch {}
    setBusy(null);
  }

  const wa = lead.phone ? `https://wa.me/52${lead.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="h-full flex flex-col bg-[#070707] relative overflow-hidden select-none">
      <div className="hud-scanline" />

      {/* ── HEADER ── */}
      <div className="relative shrink-0 border-b border-white/6 overflow-hidden" style={{ minHeight: 155 }}>
        <ParticleCanvas />
        <div className="relative z-10 p-5">
          {/* corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#D4A017]/30 pointer-events-none" />
          <div className="absolute top-0 right-10 w-5 h-5 border-t-2 border-r-2 border-[#D4A017]/30 pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono text-[#D4A017]/40 uppercase tracking-[.2em]">
              EXPEDIENTE · {lead.leadId || `LEAD-${String(lead.id).padStart(5, "0")}`}
            </p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-zinc-500 hover:text-zinc-100 transition-all"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-black shrink-0"
              style={{
                background: getAvatarColor(lead.phone || lead.name),
                boxShadow: `0 0 0 2px #070707, 0 0 0 3.5px ${getAvatarColor(lead.phone || lead.name)}55`,
              }}
            >
              {getInitials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-zinc-100 font-bold text-sm leading-tight truncate">{name}</h2>
              <p className="text-zinc-500 font-mono text-[11px] mt-0.5">{lead.phone || "Sin teléfono"}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md border font-medium", STATUS_STYLE[lead.status])}>
                  {lead.status}
                </span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md border font-medium", src.bg, src.color)}>
                  {src.emoji} {lead.source.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>

          {wa && (
            <a
              href={wa} target="_blank" rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all duration-200"
            >
              📱 Contactar por WhatsApp <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">

        <IntelSection title="Inteligencia">
          <IntelRow label="ID Lead"><CopyField value={lead.leadId || `#${String(lead.id).padStart(5, "0")}`} /></IntelRow>
          <IntelRow label="Teléfono"><CopyField value={lead.phone} /></IntelRow>
          <IntelRow label="Email"><CopyField value={lead.email} /></IntelRow>
          <IntelRow label="Fuente">
            <span className={cn("text-xs font-medium", src.color)}>{src.emoji} {lead.source}</span>
          </IntelRow>
          <IntelRow label="Fecha entrada">
            <span className="text-zinc-300 text-xs">{fmtDate(lead.entryDate)}</span>
          </IntelRow>
          <IntelRow label="Pipeline">
            <span className="text-zinc-300 text-xs font-mono">{lead.daysInPipeline}d · {relTime(lead.entryDate)}</span>
          </IntelRow>
        </IntelSection>

        <IntelSection title="Campaña">
          {(lead.campaign || lead.adSet || lead.ad || lead.utmSource) ? (
            <>
              <IntelRow label="Campaña"><CopyField value={lead.campaign} mono={false} /></IntelRow>
              <IntelRow label="Conjunto"><CopyField value={lead.adSet} mono={false} /></IntelRow>
              <IntelRow label="Anuncio"><CopyField value={lead.ad} mono={false} /></IntelRow>
              <IntelRow label="UTM"><CopyField value={lead.utmSource} /></IntelRow>
            </>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-zinc-600 text-xs font-mono">LEAD ORGÁNICO · Sin campaña</p>
            </div>
          )}
        </IntelSection>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-px bg-[#D4A017]/40" />
            <p className="text-[9px] font-mono text-[#D4A017]/50 uppercase tracking-[.22em]">Línea de tiempo</p>
            <div className="flex-1 h-px bg-[#D4A017]/10" />
          </div>
          <LeadTimeline lead={lead} />
        </div>

      </div>

      {/* ── ACCIONES RÁPIDAS ── */}
      <div className="relative z-10 shrink-0 p-4 border-t border-white/6">
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-2.5">Acciones rápidas</p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.status}
              disabled={lead.status === a.status || busy !== null}
              onClick={() => doStatus(a.status)}
              className={cn(
                "py-2 rounded-xl border text-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-1",
                a.cls,
                (lead.status === a.status || busy !== null) && "opacity-35 cursor-not-allowed"
              )}
            >
              {busy === a.status ? "···" : <>{a.emoji} {a.label}</>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-3.5 space-y-2.5 animate-pulse">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/6 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 bg-white/6 rounded w-3/4" />
          <div className="h-2 bg-white/4 rounded w-1/2" />
        </div>
        <div className="w-5 h-5 bg-white/5 rounded shrink-0" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-white/5 rounded-md w-14" />
        <div className="h-5 bg-white/4 rounded-md w-12" />
      </div>
      <div className="h-6 bg-white/3 rounded-lg w-full" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEAD CARD
// ─────────────────────────────────────────────────────────────

function LeadCard({ lead, isSelected, onClick, isDragging }: {
  lead: Lead; isSelected: boolean; onClick: () => void; isDragging: boolean;
}) {
  const name = displayName(lead);
  const src  = SOURCE_CFG[lead.source] ?? SOURCE_CFG["WhatsApp directo"];
  const isHot  = lead.temperature === "caliente";
  const isCold = lead.temperature === "frío";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-3.5 cursor-pointer group select-none",
        "bg-[rgba(9,9,9,.97)]",
        "transition-all duration-200",
        "hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,.6)]",
        isHot  ? "border-red-500/50 hot-glow" : isCold ? "border-blue-400/30" : "border-amber-400/20",
        isSelected
          ? "border-[#D4A017]/55 ring-1 ring-[#D4A017]/12 bg-[#D4A017]/4"
          : "hover:border-white/14 hover:bg-[rgba(13,13,13,.98)]",
        isDragging && "opacity-40 scale-95 cursor-grabbing"
      )}
    >
      {isHot && (
        <div className="absolute inset-0 rounded-xl border border-red-500/12 animate-pulse pointer-events-none" />
      )}

      {/* row 1 */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-black shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: getAvatarColor(lead.phone || lead.name) }}
        >
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 text-xs font-semibold truncate">{name}</p>
          <p className="text-zinc-600 text-[10px] font-mono mt-0.5">
            {lead.phone ? `···${lead.phone.slice(-6)}` : "—"}
          </p>
        </div>
        <span className="shrink-0 text-sm leading-none">
          {isHot ? "🔥" : isCold ? "❄️" : "🌡️"}
        </span>
      </div>

      {/* row 2 */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={cn(
          "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md border font-medium",
          src.bg, src.color
        )}>
          <span className="text-[9px]">{src.emoji}</span>
          <span>{lead.source.split(" ")[0]}</span>
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">
          {relTime(lead.entryDate || lead.lastMessageTime)}
        </span>
      </div>

      {/* campaign */}
      {lead.campaign && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white/2 rounded-lg border border-white/5 overflow-hidden">
          <span className="text-[9px] text-zinc-600 shrink-0">📢</span>
          <p className="text-[10px] text-zinc-500 truncate">{lead.campaign}</p>
        </div>
      )}

      {/* selected indicator */}
      {isSelected && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-[#D4A017]/60 pointer-events-none" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────────────────────────

function MetricCard({ label, num, display, prefix = "", suffix = "", icon: Icon, accent, sub, loaded }: {
  label: string; num: number; display?: string;
  prefix?: string; suffix?: string; icon: React.ElementType;
  accent: string; sub?: string; loaded: boolean;
}) {
  const animated = useAnimCounter(num, loaded && !display);
  return (
    <div className="glass-card border border-white/7 p-5 relative overflow-hidden glass-card-hover group">
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: accent }}
      />
      <Icon size={15} className="mb-3 transition-transform duration-200 group-hover:scale-110" style={{ color: accent }} />
      <p className="text-[22px] font-bold font-mono cnt-in leading-tight" style={{ color: accent }}>
        {display ?? (prefix + animated.toLocaleString("es-MX") + suffix)}
      </p>
      <p className="text-zinc-500 text-xs mt-1">{label}</p>
      {sub && <p className="text-zinc-700 text-[10px] mt-0.5 font-mono truncate">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

type SortKey = "reciente" | "antiguo" | "caliente";

const HUD_GRID = {
  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212,160,23,0.055) 1px, transparent 0)`,
  backgroundSize: "40px 40px",
};

export default function LeadsPage() {
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedLead, setSel]      = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [dragging, setDragging]     = useState<number | null>(null);
  const [dragOver, setDragOver]     = useState<LeadStatus | null>(null);
  const [search, setSearch]         = useState("");
  const [filterSrc, setFilterSrc]   = useState<LeadSource | "Todas">("Todas");
  const [filterTemp, setFilterTemp] = useState<LeadTemperature | "Todas">("Todas");
  const [sortKey, setSortKey]       = useState<SortKey>("reciente");

  useEffect(() => {
    fetchLeads()
      .then(data => { setLeads(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function openPanel(lead: Lead) { setSel(lead); setPanelOpen(true); }
  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSel(null), 290);
  }

  function handleStatusChange(lead: Lead, s: LeadStatus) {
    setLeads(p => p.map(l => l.id === lead.id ? { ...l, status: s } : l));
    setSel(p => p?.id === lead.id ? { ...p, status: s } : p);
  }

  function handleDrop(s: LeadStatus) {
    if (dragging == null) return;
    const lead = leads.find(l => l.id === dragging);
    if (lead && lead.status !== s) {
      handleStatusChange(lead, s);
      fetch("/api/leads/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: lead.phone || undefined, leadId: lead.leadId || undefined, newStatus: s }),
      }).catch(() => {});
    }
    setDragging(null); setDragOver(null);
  }

  const filtered = useMemo(() => {
    let list = leads;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.campaign?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
      );
    }
    if (filterSrc !== "Todas")  list = list.filter(l => l.source === filterSrc);
    if (filterTemp !== "Todas") list = list.filter(l => l.temperature === filterTemp);
    return [...list].sort((a, b) => {
      if (sortKey === "reciente")  return a.daysInPipeline - b.daysInPipeline;
      if (sortKey === "antiguo")   return b.daysInPipeline - a.daysInPipeline;
      const t: Record<LeadTemperature, number> = { caliente: 2, tibio: 1, frío: 0 };
      return t[b.temperature] - t[a.temperature];
    });
  }, [leads, search, filterSrc, filterTemp, sortKey]);

  // ── Metrics ──
  const active     = useMemo(() => leads.filter(l => !["Convertido","Perdido"].includes(l.status)), [leads]);
  const converted  = useMemo(() => leads.filter(l => l.status === "Convertido"), [leads]);
  const convRate   = leads.length ? Math.round((converted.length / leads.length) * 100) : 0;
  const pipelineVal = active.length * 1500;

  const bestSrc = useMemo(() => {
    const ranked = (["Meta Ads","TikTok","Instagram","WhatsApp directo"] as LeadSource[])
      .map(s => ({ s, c: leads.filter(l => l.source === s && l.status === "Convertido").length }))
      .sort((a, b) => b.c - a.c);
    return ranked[0]?.c > 0 ? ranked[0].s : null;
  }, [leads]);

  const avgClose = useMemo(() => {
    const done = leads.filter(l => l.status === "Convertido" && l.entryDate && l.conversionDate);
    if (!done.length) return 0;
    const sum = done.reduce((acc, l) => {
      const d = Math.max(0, Math.floor(
        (new Date(l.conversionDate!).getTime() - new Date(l.entryDate!).getTime()) / 86400000
      ));
      return acc + d;
    }, 0);
    return Math.round(sum / done.length);
  }, [leads]);

  const SOURCES_ALL = ["Todas", "Meta Ads", "WhatsApp directo", "Instagram", "TikTok"] as const;
  const TEMPS_ALL: [LeadTemperature | "Todas", string][] = [["Todas","ALL"],["caliente","🔥"],["tibio","🌡️"],["frío","❄️"]];

  return (
    <div className="flex flex-col gap-5 max-w-[1700px]" style={HUD_GRID}>
      <style>{CARD_CSS}</style>

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
            Pipeline de Leads
            <span className="text-[10px] font-mono text-[#D4A017]/55 bg-[#D4A017]/8 border border-[#D4A017]/15 px-2 py-0.5 rounded-full uppercase tracking-widest">
              CAVA IA
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {loading
              ? "Cargando expedientes de inteligencia…"
              : `${leads.length} leads registrados · ${active.length} activos en pipeline`}
          </p>
        </div>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="text-xs bg-white/4 border border-white/8 text-zinc-400 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-[#D4A017]/20 transition-colors font-mono"
        >
          <option value="reciente">Más reciente</option>
          <option value="antiguo">Más antiguo</option>
          <option value="caliente">Más caliente</option>
        </select>
      </div>

      {/* ── METRICS ── */}
      <ErrorBoundary label="Métricas">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 shrink-0">
          <MetricCard label="Leads activos"        num={active.length}   icon={Target}      accent="#D4A017" loaded={!loading} />
          <MetricCard label="Tasa de conversión"   num={convRate}        suffix="%" icon={TrendingUp} accent="#10B981" loaded={!loading} />
          <MetricCard
            label="Mejor fuente" num={0}
            display={bestSrc ? (SOURCE_CFG[bestSrc].emoji + " " + bestSrc.split(" ")[0]) : "—"}
            icon={Zap} accent="#A855F7" loaded={!loading}
          />
          <MetricCard label="Días prom. de cierre" num={avgClose}        suffix="d" icon={Clock}    accent="#3B82F6" loaded={!loading} />
          <MetricCard
            label="Valor del pipeline" num={pipelineVal} prefix="$"
            icon={DollarSign} accent="#C2185B" loaded={!loading}
            sub={`${active.length} leads × $1,500`}
          />
        </div>
      </ErrorBoundary>

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-2 flex-wrap shrink-0 glass-card border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-xl px-3 py-2 min-w-[200px] flex-1">
          <Search size={13} className="text-zinc-600 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nombre, teléfono, campaña…"
            className="bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none flex-1 font-mono"
          />
        </div>

        <div className="h-4 w-px bg-white/8 hidden lg:block" />

        <div className="flex items-center gap-1 flex-wrap">
          {SOURCES_ALL.map(s => (
            <button
              key={s}
              onClick={() => setFilterSrc(s as typeof filterSrc)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-lg border transition-all font-mono",
                filterSrc === s
                  ? "bg-[#D4A017]/12 text-[#D4A017] border-[#D4A017]/25"
                  : "text-zinc-600 border-white/5 hover:text-zinc-400 hover:border-white/10"
              )}
            >
              {s === "Todas" ? "TODAS" : (SOURCE_CFG[s as LeadSource]?.emoji + " " + s.split(" ")[0].toUpperCase())}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/8 hidden lg:block" />

        <div className="flex items-center gap-1">
          {TEMPS_ALL.map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setFilterTemp(k as typeof filterTemp)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-lg border transition-all font-mono",
                filterTemp === k
                  ? "bg-[#D4A017]/12 text-[#D4A017] border-[#D4A017]/25"
                  : "text-zinc-600 border-white/5 hover:text-zinc-400"
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── KANBAN + PANEL ── */}
      <ErrorBoundary label="Pipeline kanban">
        {!loading && leads.length === 0 ? (
          <div className="glass-card border border-white/7 p-10">
            <EmptyState icon={Target} title="Sin leads registrados" description="Los leads se cargan desde la hoja 'Leads' de Google Sheets." />
          </div>
        ) : (
          <div className="flex gap-0">

            {/* Kanban */}
            <div className="flex-1 overflow-x-auto min-w-0">
              <div className="flex gap-2.5 pb-4" style={{ minWidth: 1060 }}>
                {PIPELINE_COLS.map(col => {
                  const colLeads = filtered.filter(l => l.status === col.status);
                  const isOver   = dragOver === col.status;
                  const hotCnt   = colLeads.filter(l => l.temperature === "caliente").length;
                  return (
                    <div
                      key={col.status}
                      className="flex-1 flex flex-col min-w-[170px]"
                      onDragOver={e => { e.preventDefault(); setDragOver(col.status); }}
                      onDragLeave={e => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                      }}
                      onDrop={() => handleDrop(col.status)}
                    >
                      {/* column header */}
                      <div
                        className="rounded-xl border px-3 py-2.5 mb-2 shrink-0 transition-all duration-200"
                        style={{
                          background: isOver ? col.accent + "14" : col.dimBg,
                          borderColor: isOver ? col.accent + "70" : "rgba(255,255,255,0.06)",
                          transform: isOver ? "scale(1.01)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.accent }} />
                            <p className="text-xs font-semibold text-zinc-200 truncate">{col.label}</p>
                          </div>
                          <span
                            className="text-[11px] font-bold font-mono rounded-full px-1.5 py-0.5 shrink-0"
                            style={{ color: col.countColor, background: col.accent + "1e" }}
                          >
                            {colLeads.length}
                          </span>
                        </div>
                        {hotCnt > 0 && (
                          <p className="text-[10px] text-red-400/55 mt-1 font-mono">
                            🔥 {hotCnt}
                          </p>
                        )}
                      </div>

                      {/* cards */}
                      <div className="flex-1 space-y-2 min-h-[72px]" style={{ maxHeight: 520, overflowY: "auto" }}>
                        {loading
                          ? Array.from({ length: 2 }, (_, i) => <SkeletonCard key={i} />)
                          : colLeads.length === 0
                          ? (
                            <div className={cn(
                              "border-2 border-dashed rounded-xl h-16 flex items-center justify-center transition-all duration-200",
                              isOver ? "border-[#D4A017]/30 bg-[#D4A017]/3" : "border-white/5"
                            )}>
                              <p className="text-[10px] font-mono text-zinc-700">{isOver ? "SOLTAR AQUÍ" : "VACÍO"}</p>
                            </div>
                          )
                          : colLeads.map(lead => (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={() => setDragging(lead.id)}
                              onDragEnd={() => { setDragging(null); setDragOver(null); }}
                              className={dragging === lead.id && dragOver && dragOver !== col.status ? "card-land" : ""}
                            >
                              <LeadCard
                                lead={lead}
                                isSelected={selectedLead?.id === lead.id}
                                isDragging={dragging === lead.id}
                                onClick={() =>
                                  selectedLead?.id === lead.id ? closePanel() : openPanel(lead)
                                }
                              />
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intel Panel */}
            <div
              className="shrink-0 overflow-hidden"
              style={{
                width: panelOpen ? 415 : 0,
                transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div style={{ width: 415, minHeight: 520 }} className="pl-3 h-full">
                {selectedLead && (
                  <div className="h-full rounded-xl overflow-hidden border border-[#D4A017]/10">
                    <IntelPanel
                      lead={selectedLead}
                      onClose={closePanel}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

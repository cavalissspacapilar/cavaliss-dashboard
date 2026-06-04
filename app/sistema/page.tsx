"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, RefreshCw, Database,
  CreditCard, MessageSquare, Sparkles, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthData {
  env: {
    BASE44_FUNCTIONS_KEY: boolean;
    BASE44_API_KEY: boolean;
    STRIPE_SECRET_KEY: boolean;
    GOOGLE_SERVICE_ACCOUNT_KEY: boolean;
    GOOGLE_SHEETS_ID: boolean;
  };
  sheetsTest: { ok: boolean; rowCount?: number; error?: string } | null;
}

const EMPTY_HEALTH: HealthData = {
  env: {
    BASE44_FUNCTIONS_KEY: false,
    BASE44_API_KEY: false,
    STRIPE_SECRET_KEY: false,
    GOOGLE_SERVICE_ACCOUNT_KEY: false,
    GOOGLE_SHEETS_ID: false,
  },
  sheetsTest: null,
};

const INTEGRATIONS = [
  {
    icon: Database,
    name: "Base44",
    description: "Citas, clientes, leads y métricas",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: CreditCard,
    name: "Stripe",
    description: "Procesamiento de anticipos",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageSquare,
    name: "Green API WhatsApp",
    description: "WhatsApp Business (número 4432)",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Sparkles,
    name: "Cavaliss IQ",
    description: "Inteligencia capilar",
    color: "text-cavaliss-pink",
    bg: "bg-cavaliss-pink/10",
  },
];

interface ConnectionCardProps {
  label: string;
  connected: boolean;
  detail?: string;
}

function ConnectionCard({ label, connected, detail }: ConnectionCardProps) {
  return (
    <div className={cn(
      "glass-card border p-5 flex items-start gap-4 glass-card-hover",
      connected ? "border-emerald-500/20" : "border-red-500/20"
    )}>
      <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", connected ? "bg-emerald-500/10" : "bg-red-500/10")}>
        {connected
          ? <CheckCircle2 size={18} className="text-emerald-400" />
          : <XCircle size={18} className="text-red-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-200 font-semibold text-sm">{label}</p>
        <p className={cn("text-xs mt-0.5 font-medium", connected ? "text-emerald-400" : "text-red-400")}>
          {connected ? "Configurado" : "Sin configurar"}
        </p>
        {detail && <p className="text-zinc-600 text-xs mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

export default function SistemaPage() {
  const [health, setHealth] = useState<HealthData>(EMPTY_HEALTH);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) setHealth(await res.json() as HealthData);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  const { env, sheetsTest } = health;
  const connectedCount = [
    env.BASE44_FUNCTIONS_KEY,
    env.BASE44_API_KEY,
    env.STRIPE_SECRET_KEY,
  ].filter(Boolean).length;
  const totalChecks = 3;
  const allOk = connectedCount === totalChecks;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Estado del Sistema</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Centro de control Cavaliss · Base44 · Stripe · Green API · Cavaliss IQ
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 border border-white/8 hover:border-white/15 px-3 py-2 rounded-xl transition-all disabled:opacity-40"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Summary banner */}
      <div className={cn(
        "p-4 rounded-xl border flex items-center gap-3",
        loading
          ? "border-zinc-700/40 bg-zinc-800/20"
          : allOk
          ? "border-emerald-500/25 bg-emerald-500/5"
          : "border-amber-500/25 bg-amber-500/5"
      )}>
        {loading ? (
          <Activity size={18} className="text-zinc-600 shrink-0 animate-pulse" />
        ) : allOk ? (
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        ) : (
          <XCircle size={18} className="text-amber-400 shrink-0" />
        )}
        <div>
          <p className={cn(
            "font-semibold text-sm",
            loading ? "text-zinc-500" : allOk ? "text-emerald-300" : "text-amber-300"
          )}>
            {loading
              ? "Verificando conexiones..."
              : allOk
              ? "Todos los sistemas operando con normalidad"
              : `${connectedCount} de ${totalChecks} conexiones activas`}
          </p>
          {!loading && (
            <p className="text-zinc-500 text-xs mt-0.5">
              {allOk
                ? "Base44, Stripe y las integraciones están respondiendo correctamente"
                : "Revisa las variables de entorno faltantes en Vercel o .env.local"}
            </p>
          )}
        </div>
      </div>

      {/* Section 1: Connection status */}
      <div>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Estado de conexiones
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ConnectionCard
            label="Base44 — Functions Key"
            connected={env.BASE44_FUNCTIONS_KEY}
            detail="Clientes, leads y métricas vía REST functions"
          />
          <ConnectionCard
            label="Base44 — API Key"
            connected={env.BASE44_API_KEY}
            detail="Citas, perfiles capilares e historial IQ"
          />
          <ConnectionCard
            label="Stripe — Secret Key"
            connected={env.STRIPE_SECRET_KEY}
            detail="Lectura de payment_intents para ingresos"
          />
        </div>
      </div>

      {/* Section 2: Active integrations */}
      <div>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Integraciones activas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INTEGRATIONS.map((intg) => {
            const Icon = intg.icon;
            return (
              <div key={intg.name} className="glass-card border border-white/7 p-4 flex items-center gap-4 glass-card-hover">
                <div className={cn("p-2.5 rounded-xl shrink-0", intg.bg)}>
                  <Icon size={18} className={intg.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-zinc-200 font-semibold text-sm">{intg.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{intg.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Costs */}
      <div className="glass-card border border-white/7 p-6">
        <h3 className="text-zinc-100 font-semibold text-sm mb-4">Costos del sistema</h3>
        <div className="space-y-3">
          {[
            { name: "Base44", desc: "Plataforma de citas, clientes, leads y métricas", cost: "Ver plan activo" },
            { name: "Stripe", desc: "Procesamiento de pagos y anticipos", cost: "2.9% + $3 MXN por transacción" },
            { name: "Green API WhatsApp", desc: "WhatsApp Business número 4432", cost: "Ver desglose en configuración" },
            { name: "Cavaliss IQ", desc: "Inteligencia capilar y análisis de perfiles", cost: "Incluido en Base44" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-zinc-300 font-medium text-sm">{item.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
              </div>
              <p className="text-zinc-400 text-sm font-medium text-right">{item.cost}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

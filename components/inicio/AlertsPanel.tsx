"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Flame, CheckCircle2, XCircle } from "lucide-react";
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

const CONTEXTUAL_ALERTS = [
  {
    id: "anticipos",
    level: "warning" as const,
    title: "Citas pendientes de anticipo",
    desc: "Revisa la agenda de hoy para identificar citas sin pago de anticipo confirmado.",
    icon: AlertTriangle,
    action: "Ver citas",
    href: "/citas",
  },
  {
    id: "leads",
    level: "hot" as const,
    title: "Leads calientes en conversación",
    desc: "Cava está gestionando leads activos. Revisa el pipeline para dar seguimiento prioritario.",
    icon: Flame,
    action: "Ver leads",
    href: "/leads",
  },
];

const LEVEL_STYLES = {
  success: "border-emerald-500/25 bg-emerald-500/5 text-emerald-400",
  error:   "border-red-500/25 bg-red-500/5 text-red-400",
  warning: "border-amber-500/25 bg-amber-500/5 text-amber-400",
  hot:     "border-orange-500/25 bg-orange-500/5 text-orange-400",
};

export default function AlertsPanel() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(r => r.ok ? r.json() as Promise<HealthData> : null)
      .then(data => { if (data) setHealth(data); })
      .catch(() => {});
  }, []);

  const allOk = health
    ? health.env.BASE44_FUNCTIONS_KEY &&
      health.env.BASE44_API_KEY &&
      health.env.STRIPE_SECRET_KEY
    : null;

  const systemAlert = health
    ? allOk
      ? {
          id: "system-ok",
          level: "success" as const,
          title: "Sistema operando correctamente",
          desc: "Base44 y Stripe están configurados y respondiendo.",
          icon: CheckCircle2,
        }
      : {
          id: "system-error",
          level: "error" as const,
          title: "Configuración incompleta",
          desc: buildMissingDesc(health),
          icon: XCircle,
        }
    : null;

  const allAlerts = [
    ...(systemAlert ? [systemAlert] : []),
    ...CONTEXTUAL_ALERTS,
  ];

  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-zinc-100 font-semibold text-base">Alertas del sistema</h3>
        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
          {allAlerts.length} {allAlerts.length === 1 ? "activa" : "activas"}
        </span>
      </div>

      <div className="space-y-2.5">
        {allAlerts.map((alert) => {
          const Icon = alert.icon;
          const href = "href" in alert ? alert.href : undefined;
          const action = "action" in alert ? alert.action : undefined;
          return (
            <div key={alert.id} className={cn("border rounded-xl p-3.5", LEVEL_STYLES[alert.level])}>
              <div className="flex items-start gap-3">
                <Icon size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-zinc-200">{alert.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{alert.desc}</p>
                </div>
                {href && action && (
                  <a
                    href={href}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors whitespace-nowrap underline underline-offset-2"
                  >
                    {action}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildMissingDesc(health: HealthData): string {
  const missing: string[] = [];
  if (!health.env.BASE44_FUNCTIONS_KEY) missing.push("BASE44_FUNCTIONS_KEY");
  if (!health.env.BASE44_API_KEY) missing.push("BASE44_API_KEY");
  if (!health.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  return missing.length > 0
    ? `Variables faltantes: ${missing.join(", ")}. Configura en Vercel o .env.local.`
    : "Revisa /sistema para más detalles.";
}

"use client";
import { AlertTriangle, AlertCircle, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ALERTS = [
  {
    id: 1,
    level: "error" as const,
    title: "Integración Stripe→CRM con errores",
    desc: "El workflow de Stripe no ha sincronizado en las últimas horas. Revisar clave secreta en n8n.",
    icon: AlertCircle,
    action: "Ver sistema",
    href: "/sistema",
  },
  {
    id: 2,
    level: "warning" as const,
    title: "Citas pendientes de anticipo",
    desc: "Revisa la agenda de hoy para identificar citas sin pago de anticipo confirmado.",
    icon: AlertTriangle,
    action: "Ver citas",
    href: "/citas",
  },
  {
    id: 3,
    level: "hot" as const,
    title: "Leads calientes en conversación",
    desc: "Cava está gestionando leads activos. Revisa el pipeline para dar seguimiento prioritario.",
    icon: Flame,
    action: "Ver leads",
    href: "/leads",
  },
  {
    id: 4,
    level: "warning" as const,
    title: "Sincronización Base44 → Sheets",
    desc: "El workflow de exportación tiene latencia. Puede ser cuota de la API de Google Sheets.",
    icon: AlertTriangle,
    action: "Ver sistema",
    href: "/sistema",
  },
];

const LEVEL_STYLES = {
  error: "border-red-500/25 bg-red-500/5 text-red-400",
  warning: "border-amber-500/25 bg-amber-500/5 text-amber-400",
  hot: "border-orange-500/25 bg-orange-500/5 text-orange-400",
  info: "border-blue-500/25 bg-blue-500/5 text-blue-400",
};

export default function AlertsPanel() {
  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-zinc-100 font-semibold text-base">Alertas del sistema</h3>
        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
          {ALERTS.length} activas
        </span>
      </div>

      <div className="space-y-2.5">
        {ALERTS.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={cn("border rounded-xl p-3.5 glass-card-hover", LEVEL_STYLES[alert.level])}>
              <div className="flex items-start gap-3">
                <Icon size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-zinc-200">{alert.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{alert.desc}</p>
                </div>
                <a
                  href={alert.href}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors whitespace-nowrap underline underline-offset-2"
                >
                  {alert.action}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

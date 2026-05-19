"use client";
import { AlertTriangle, AlertCircle, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const ALERTS = [
  {
    id: 1,
    level: "error" as const,
    title: "Workflow Stripe→CRM caído",
    desc: "Llevas 3h sin sincronizar pagos con el CRM. Revisar clave Stripe.",
    icon: AlertCircle,
    action: "Ver sistema",
    href: "/sistema",
  },
  {
    id: 2,
    level: "warning" as const,
    title: "2 citas sin anticipo hoy",
    desc: "Natalia Sánchez (11am) y Andrea Ramos (4:30pm) no han pagado anticipo.",
    icon: Clock,
    action: "Ver citas",
    href: "/citas",
  },
  {
    id: 3,
    level: "hot" as const,
    title: "3 leads calientes sin respuesta +2h",
    desc: "Cava está esperando respuesta. Revisar: Tania, Paulina y Selene.",
    icon: Flame,
    action: "Ver leads",
    href: "/leads",
  },
  {
    id: 4,
    level: "warning" as const,
    title: "Workflow Sheets con latencia",
    desc: "Sincronización tardando 3x más de lo normal. Puede ser cuota de API.",
    icon: AlertTriangle,
    action: "Ver sistema",
    href: "/sistema",
  },
];

const LEVEL_STYLES = {
  error: "border-red-500/25 bg-red-500/5 text-red-400",
  warning: "border-amber-500/25 bg-amber-500/5 text-amber-400",
  hot: "border-orange-500/25 bg-orange-500/5 text-orange-400",
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
            <div
              key={alert.id}
              className={cn("border rounded-xl p-3.5 glass-card-hover", LEVEL_STYLES[alert.level])}
            >
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

"use client";
import { CalendarPlus, CreditCard, MessageSquare, AlertTriangle, UserPlus, CheckCircle2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const ICONS: Record<ActivityItem["type"], React.ElementType> = {
  reserva: CalendarPlus,
  pago: CreditCard,
  mensaje: MessageSquare,
  alerta: AlertTriangle,
  lead: UserPlus,
  completada: CheckCircle2,
};

const COLORS: Record<ActivityItem["type"], string> = {
  reserva: "text-blue-400 bg-blue-500/10",
  pago: "text-emerald-400 bg-emerald-500/10",
  mensaje: "text-gold bg-gold/10",
  alerta: "text-red-400 bg-red-500/10",
  lead: "text-cavaliss-pink bg-cavaliss-pink/10",
  completada: "text-teal-400 bg-teal-500/10",
};

interface Props {
  items?: ActivityItem[];
}

export default function ActivityFeed({ items = [] }: Props) {
  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-zinc-100 font-semibold text-base">Actividad en tiempo real</h3>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En vivo
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Radio size={32} className="text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">Sin actividad registrada</p>
          <p className="text-zinc-600 text-xs mt-1.5 max-w-xs">
            La actividad en tiempo real se populará cuando Base44 y Stripe estén sincronizando eventos.
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = ICONS[item.type];
            const color = COLORS[item.type];
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/3",
                  item.isNew && "bg-gold/4"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", color)}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-sm leading-snug">{item.description}</p>
                  {item.amount && (
                    <p className="text-emerald-400 text-xs font-semibold mt-0.5">
                      +${item.amount.toLocaleString("es-MX")} MXN
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-zinc-600 text-xs whitespace-nowrap">{item.time}</p>
                  {item.isNew && <span className="text-[10px] text-gold font-semibold">NUEVO</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";
import { APPOINTMENTS, SERVICES } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9);
const DAYS = ["Lun 19", "Mar 20", "Mié 21", "Jue 22", "Vie 23", "Sáb 24"];
const DATES = ["2026-05-19", "2026-05-20", "2026-05-21", "2026-05-22", "2026-05-23", "2026-05-24"];

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmada: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  pendiente: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  completada: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  cancelada: "bg-red-500/20 border-red-500/40 text-red-300 opacity-50",
};

function getServiceColor(serviceName: string) {
  return SERVICES.find(s => s.name === serviceName)?.colorHex ?? "#D4A017";
}

function timeToRow(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h - 9) * 4 + Math.floor(m / 15);
}

function durationToRows(duration: number) {
  return Math.max(1, Math.ceil(duration / 15));
}

export default function WeeklyCalendar() {
  const today = "2026-05-19";

  return (
    <div className="glass-card border border-white/7 p-6 overflow-x-auto">
      <h3 className="text-zinc-100 font-semibold text-base mb-5">Agenda Semanal</h3>
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: "52px repeat(6, 1fr)" }}>
          <div />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-semibold py-2 rounded-lg",
                DATES[i] === today ? "bg-gold/15 text-gold" : "text-zinc-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid gap-1 mb-1" style={{ gridTemplateColumns: "52px repeat(6, 1fr)" }}>
              <div className="text-zinc-600 text-xs text-right pr-2 pt-1 font-mono">
                {hour}:00
              </div>
              {DATES.map((date) => {
                const appts = APPOINTMENTS.filter(a => {
                  const [h] = a.time.split(":").map(Number);
                  return a.date === date && h === hour;
                });
                return (
                  <div key={date} className="min-h-[44px] rounded-lg border border-white/4 bg-white/2 relative overflow-visible">
                    {appts.map((appt) => (
                      <div
                        key={appt.id}
                        className={cn(
                          "absolute inset-x-0 top-0 rounded-lg border p-1.5 cursor-pointer transition-all duration-200 hover:z-10 hover:scale-105",
                          STATUS_COLORS[appt.status]
                        )}
                        style={{ borderLeftColor: getServiceColor(appt.service), borderLeftWidth: 3 }}
                        title={`${appt.clientName} · ${appt.service} · ${appt.duration}min`}
                      >
                        <p className="text-xs font-semibold truncate leading-tight">{appt.clientName.split(" ")[0]}</p>
                        <p className="text-[10px] opacity-70 truncate">{appt.service.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
          {(["confirmada", "pendiente", "completada", "cancelada"] as AppointmentStatus[]).map(s => (
            <div key={s} className={cn("text-xs px-2 py-1 rounded-lg border capitalize", STATUS_COLORS[s])}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

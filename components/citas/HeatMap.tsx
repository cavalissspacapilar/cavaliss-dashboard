"use client";
import { useMemo } from "react";
import { getWeekDates } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const HOUR_LABELS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 9);
const DAYS_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function fmtHour(h: number) {
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function getColor(v: number) {
  return `rgba(212, 160, 23, ${[0, 0.2, 0.5, 1][v] ?? 0})`;
}

function getBorder(v: number) {
  return v > 0 ? "rgba(212, 160, 23, 0.25)" : "rgba(255,255,255,0.05)";
}

export default function HeatMap({ appointments }: { appointments: Appointment[] }) {
  const weekDates = useMemo(getWeekDates, []);

  const heatData = useMemo(() =>
    HOURS.map(hour =>
      weekDates.map(({ date }) => {
        const count = appointments.filter(a => {
          const [h] = a.time.split(":").map(Number);
          return a.date === date && h === hour;
        }).length;
        return Math.min(count, 3);
      })
    ),
  [appointments, weekDates]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayIdx = weekDates.findIndex(w => w.date === todayStr);

    let maxHourTotal = 0, maxHourIdx = 0;
    heatData.forEach((row, hi) => {
      const total = row.reduce((s, v) => s + v, 0);
      if (total > maxHourTotal) { maxHourTotal = total; maxHourIdx = hi; }
    });

    let maxDayTotal = 0, maxDayIdx = 0;
    DAYS_LABEL.forEach((_, di) => {
      const total = heatData.reduce((s, row) => s + (row[di] ?? 0), 0);
      if (total > maxDayTotal) { maxDayTotal = total; maxDayIdx = di; }
    });

    const freeCount = todayIdx >= 0
      ? heatData.filter(row => row[todayIdx] === 0).length
      : 0;

    const h = HOURS[maxHourIdx];
    return {
      busiestHour: maxHourTotal > 0 ? `${fmtHour(h)}–${fmtHour(h + 1)}` : "Sin datos",
      busiestDay: maxDayTotal > 0 ? DAYS_LABEL[maxDayIdx] : "Sin datos",
      freeSlots: todayIdx >= 0 ? `${freeCount} libre${freeCount !== 1 ? "s" : ""}` : "—",
    };
  }, [heatData, weekDates]);

  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-zinc-100 font-semibold text-base">Mapa de calor — Horas más ocupadas</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Esta semana · citas por slot</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Libre</span>
          {[0, 1, 2, 3].map(v => (
            <div key={v} className="w-5 h-5 rounded" style={{ background: getColor(v), border: `1px solid ${getBorder(v)}` }} />
          ))}
          <span>Lleno</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[360px]">
          <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "44px repeat(6, 1fr)" }}>
            <div />
            {DAYS_LABEL.map(d => (
              <div key={d} className="text-center text-xs text-zinc-500 font-medium">{d}</div>
            ))}
          </div>

          {HOUR_LABELS.map((hour, hi) => (
            <div key={hour} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "44px repeat(6, 1fr)" }}>
              <div className="text-xs text-zinc-500 font-mono text-right pr-2 flex items-center justify-end">{hour}</div>
              {DAYS_LABEL.map((day, di) => {
                const v = heatData[hi]?.[di] ?? 0;
                return (
                  <div
                    key={day}
                    className="heatmap-cell h-9 rounded-md relative cursor-default"
                    style={{ background: getColor(v), border: `1px solid ${getBorder(v)}` }}
                    title={`${day} ${hour}: ${["Libre", "1 cita", "2 citas", "Completo"][v] ?? "Completo"}`}
                  >
                    {v === 3 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black/60">●●</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
        {[
          { label: "Hora más ocupada", value: stats.busiestHour },
          { label: "Día más ocupado", value: stats.busiestDay },
          { label: "Slots disponibles hoy", value: stats.freeSlots },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-gold font-bold text-sm">{s.value}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

const HOURS = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const HEAT_DATA = [
  [1, 2, 1, 0, 1, 0],
  [2, 3, 2, 1, 2, 0],
  [1, 2, 3, 2, 1, 0],
  [0, 1, 2, 3, 2, 0],
  [2, 2, 1, 2, 3, 0],
  [3, 2, 2, 1, 2, 0],
  [1, 3, 3, 2, 1, 0],
  [2, 2, 1, 2, 2, 0],
  [3, 1, 1, 1, 2, 0],
  [1, 0, 0, 1, 1, 0],
];

function getColor(v: number) {
  const alpha = [0, 0.2, 0.5, 1][v] ?? 0;
  return `rgba(212, 160, 23, ${alpha})`;
}

function getBorder(v: number) {
  return v > 0 ? "rgba(212, 160, 23, 0.25)" : "rgba(255,255,255,0.05)";
}

export default function HeatMap() {
  return (
    <div className="glass-card border border-white/7 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-zinc-100 font-semibold text-base">Mapa de calor — Horas más ocupadas</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Esta semana · promedio de citas por slot</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Libre</span>
          {[0, 1, 2, 3].map(v => (
            <div
              key={v}
              className="w-5 h-5 rounded"
              style={{ background: getColor(v), border: `1px solid ${getBorder(v)}` }}
            />
          ))}
          <span>Lleno</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[360px]">
          {/* Day labels */}
          <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "44px repeat(6, 1fr)" }}>
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-zinc-500 font-medium">{d}</div>
            ))}
          </div>

          {/* Rows */}
          {HOURS.map((hour, hi) => (
            <div key={hour} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "44px repeat(6, 1fr)" }}>
              <div className="text-xs text-zinc-500 font-mono text-right pr-2 flex items-center justify-end">
                {hour}
              </div>
              {DAYS.map((day, di) => {
                const v = HEAT_DATA[hi]?.[di] ?? 0;
                return (
                  <div
                    key={day}
                    className="heatmap-cell h-9 rounded-md relative cursor-default"
                    style={{
                      background: getColor(v),
                      border: `1px solid ${getBorder(v)}`,
                    }}
                    title={`${day} ${hour}: ${v === 0 ? "Libre" : v === 1 ? "1 cita" : v === 2 ? "2 citas" : "Completo"}`}
                  >
                    {v === 3 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black/60">
                        ●●
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
        {[
          { label: "Hora más ocupada", value: "9–11am" },
          { label: "Día más ocupado", value: "Miércoles" },
          { label: "Slots disponibles hoy", value: "3 libre" },
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

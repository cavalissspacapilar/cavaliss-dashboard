"use client";
import { useState, useEffect } from "react";
import { CalendarCheck, Clock, DollarSign, TrendingUp } from "lucide-react";
import WeeklyCalendar from "@/components/citas/WeeklyCalendar";
import HeatMap from "@/components/citas/HeatMap";
import { APPOINTMENTS, SERVICES } from "@/lib/data";
import { fetchCitas } from "@/lib/api-client";
import { cn, formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AppointmentStatus, Appointment } from "@/lib/types";

const TODAY = new Date().toISOString().split("T")[0];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmada: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pendiente: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  completada: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  cancelada: "bg-red-500/15 text-red-400 border-red-500/25",
};

function ServiceStats() {
  const counts = SERVICES.map(s => ({
    name: s.name.split(" ").slice(0, 2).join(" "),
    count: APPOINTMENTS.filter(a => a.service === s.name).length,
    color: s.colorHex,
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="glass-card border border-white/7 p-6">
      <h3 className="text-zinc-100 font-semibold text-base mb-5">Servicios más solicitados esta semana</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={counts} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
          <Tooltip
            contentStyle={{ background: "#0f0f0f", border: "1px solid rgba(212,160,23,0.15)", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {counts.map((c, i) => <Cell key={i} fill={c.color} opacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);

  useEffect(() => {
    fetchCitas().then(setAppointments).catch(() => {});
  }, []);

  const todayAppts = appointments.filter(a => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const totalToday = todayAppts.reduce((s, a) => s + a.price, 0);
  const confirmed = todayAppts.filter(a => a.status === "confirmada").length;
  const occupancy = Math.round((todayAppts.length / 10) * 100);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Agenda de Citas</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Lunes a Sábado 9am–7pm</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Citas hoy", value: todayAppts.length, icon: CalendarCheck, color: "text-gold" },
          { label: "Confirmadas", value: confirmed, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Ingresos proyectados hoy", value: formatCurrency(totalToday), icon: DollarSign, color: "text-gold" },
          { label: "Ocupación del día", value: `${occupancy}%`, icon: Clock, color: "text-cavaliss-pink" },
        ].map(k => (
          <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
            <k.icon size={18} className={`${k.color} mb-3`} />
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Occupation bar */}
      <div className="glass-card border border-white/7 p-4 flex items-center gap-4">
        <span className="text-zinc-400 text-sm shrink-0">Ocupación hoy</span>
        <div className="flex-1 h-3 bg-white/6 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-1000"
            style={{ width: `${occupancy}%` }}
          />
        </div>
        <span className="text-gold font-bold text-sm shrink-0">{occupancy}%</span>
      </div>

      {/* Today's appointments */}
      <div className="glass-card border border-white/7 p-6">
        <h3 className="text-zinc-100 font-semibold text-base mb-5">Citas de hoy — Lunes 19 May</h3>
        <div className="space-y-2.5">
          {todayAppts.map(appt => (
            <div
              key={appt.id}
              className="flex items-center gap-4 p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-gold/15 transition-all duration-200 group"
            >
              <div className="w-14 text-right shrink-0">
                <p className="text-gold font-bold text-sm">{appt.time}</p>
                <p className="text-zinc-600 text-xs">{appt.duration}min</p>
              </div>
              <div className="w-px h-10 bg-white/8" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 font-semibold text-sm">{appt.clientName}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{appt.service}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-zinc-300 font-semibold text-sm">{formatCurrency(appt.price)}</p>
                <p className={cn("text-xs mt-0.5", appt.depositPaid ? "text-emerald-400" : "text-amber-400")}>
                  {appt.depositPaid ? `Anticipo ✓ ${formatCurrency(appt.depositAmount)}` : "Sin anticipo"}
                </p>
              </div>
              <span className={cn("text-xs px-2.5 py-1 rounded-lg border capitalize shrink-0", STATUS_STYLES[appt.status])}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStats />
        <HeatMap />
      </div>

      <WeeklyCalendar />
    </div>
  );
}

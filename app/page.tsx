"use client";
import { CalendarCheck, DollarSign, Users, Percent } from "lucide-react";
import KPICard from "@/components/inicio/KPICard";
import RevenueChart from "@/components/inicio/RevenueChart";
import ActivityFeed from "@/components/inicio/ActivityFeed";
import AlertsPanel from "@/components/inicio/AlertsPanel";
import HealthScore from "@/components/inicio/HealthScore";
import { TODAY_KPIS } from "@/lib/data";

export default function InicioPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Vista General</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Centro de control Cavaliss · Cancún, Q. Roo</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Citas confirmadas hoy"
          value={TODAY_KPIS.citasConfirmadas}
          trend={TODAY_KPIS.citasTrend}
          trendLabel="+1 vs ayer"
          icon={<CalendarCheck size={20} />}
          color="gold"
          detail={
            <p className="text-zinc-400 text-sm">
              9 citas en agenda — 7 confirmadas, 2 pendientes de anticipo. Ocupación del día: 85%.
            </p>
          }
        />
        <KPICard
          label="Ingresos del día"
          value={TODAY_KPIS.ingresosDia}
          prefix="$"
          trend={TODAY_KPIS.ingresosTrend}
          trendLabel="+$2,050 vs ayer"
          icon={<DollarSign size={20} />}
          color="gold"
          detail={
            <p className="text-zinc-400 text-sm">
              Meta del día: $15,000 MXN — vas en $13,500. Faltan 2 servicios por completar.
            </p>
          }
        />
        <KPICard
          label="Leads activos"
          value={TODAY_KPIS.leadsActivos}
          trend={TODAY_KPIS.leadsTrend}
          trendLabel="-1 vs ayer"
          icon={<Users size={20} />}
          color="pink"
          detail={
            <div className="text-zinc-400 text-sm space-y-1">
              <p>🔥 Calientes: 7 · 🌡️ Tibios: 8 · ❄️ Fríos: 6</p>
              <p>4 listos para cerrar esta semana.</p>
            </div>
          }
        />
        <KPICard
          label="Tasa de conversión"
          value={TODAY_KPIS.tasaConversion}
          suffix="%"
          trend={TODAY_KPIS.conversionTrend}
          trendLabel="+1.7 pts vs semana pasada"
          icon={<Percent size={20} />}
          color="emerald"
          detail={
            <p className="text-zinc-400 text-sm">
              34 de cada 100 leads se convierten en clientas. Promedio industria: 18%.
            </p>
          }
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="space-y-4">
          <HealthScore />
        </div>
      </div>

      {/* Alerts */}
      <AlertsPanel />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { CalendarCheck, DollarSign, Users, Percent } from "lucide-react";
import KPICard from "@/components/inicio/KPICard";
import RevenueChart from "@/components/inicio/RevenueChart";
import ActivityFeed from "@/components/inicio/ActivityFeed";
import AlertsPanel from "@/components/inicio/AlertsPanel";
import HealthScore from "@/components/inicio/HealthScore";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { KPIData } from "@/app/api/kpis/route";

const EMPTY_KPIS: KPIData = {
  citasHoy: 0,
  ingresosDia: 0,
  leadsActivos: 0,
  totalLeads: 0,
  convertidos: 0,
  tasaConversion: 0,
};

export default function InicioPage() {
  const [kpis, setKpis] = useState<KPIData>(EMPTY_KPIS);

  useEffect(() => {
    fetch("/api/kpis")
      .then(r => r.ok ? r.json() as Promise<KPIData> : null)
      .then(data => { if (data) setKpis(data); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Vista General</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Centro de control Cavaliss · Cancún, Q. Roo</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <ErrorBoundary label="Citas KPI">
          <KPICard
            label="Citas confirmadas hoy"
            value={kpis.citasHoy}
            trend={0}
            icon={<CalendarCheck size={20} />}
            color="gold"
          />
        </ErrorBoundary>
        <ErrorBoundary label="Ingresos KPI">
          <KPICard
            label="Ingresos del día"
            value={kpis.ingresosDia}
            prefix="$"
            trend={0}
            icon={<DollarSign size={20} />}
            color="gold"
          />
        </ErrorBoundary>
        <ErrorBoundary label="Leads KPI">
          <KPICard
            label="Leads activos"
            value={kpis.leadsActivos}
            trend={0}
            icon={<Users size={20} />}
            color="pink"
          />
        </ErrorBoundary>
        <ErrorBoundary label="Conversión KPI">
          <KPICard
            label="Tasa de conversión"
            value={kpis.tasaConversion}
            suffix="%"
            trend={0}
            icon={<Percent size={20} />}
            color="emerald"
          />
        </ErrorBoundary>
      </div>

      <ErrorBoundary label="Gráfica de ingresos">
        <RevenueChart />
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundary label="Actividad">
            <ActivityFeed />
          </ErrorBoundary>
        </div>
        <div className="space-y-4">
          <ErrorBoundary label="Health Score">
            <HealthScore
              occupancy={Math.min(100, (kpis.citasHoy / 10) * 100)}
              conversion={kpis.tasaConversion}
              retention={75}
              revenueVsTarget={kpis.ingresosDia > 0 ? 100 : 0}
            />
          </ErrorBoundary>
        </div>
      </div>

      <ErrorBoundary label="Alertas">
        <AlertsPanel />
      </ErrorBoundary>
    </div>
  );
}

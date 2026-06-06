// Static reference data only — NO fake client/lead/appointment/revenue data.
// All live data comes from Base44 and Stripe via API routes.
import type { ServiceData, RevenueDataPoint, CavaConversation } from "./types";

// Service catalog — used for color/price/duration lookups in UI components.
export const SERVICES: ServiceData[] = [
  { name: "Diagnóstico Capilar", price: 600, duration: 60, color: "bg-sky-500", colorHex: "#0EA5E9" },
  { name: "Exfoliación Capilar", price: 1200, duration: 75, color: "bg-emerald-500", colorHex: "#10B981" },
  { name: "Nutrición Capilar", price: 1500, duration: 90, color: "bg-violet-500", colorHex: "#8B5CF6" },
  { name: "Ritual Detox", price: 1800, duration: 90, color: "bg-teal-500", colorHex: "#14B8A6" },
  { name: "Reconstrucción Molecular", price: 2400, duration: 120, color: "bg-blue-500", colorHex: "#3B82F6" },
  { name: "Luminoplastia", price: 3000, duration: 120, color: "bg-pink-500", colorHex: "#EC4899" },
  { name: "VIP Curly Experience", price: 3600, duration: 150, color: "bg-purple-500", colorHex: "#A855F7" },
  { name: "Electroestimulación", price: 1500, duration: 60, color: "bg-orange-500", colorHex: "#F97316" },
  { name: "Mesoterapia con Exosomas", price: 2800, duration: 90, color: "bg-rose-500", colorHex: "#F43F5E" },
];

// Empty fallback values — used as React initial state only.
// Real data replaces these via useEffect/API calls.
export const CLIENTS = [] as import("./types").Client[];
export const APPOINTMENTS = [] as import("./types").Appointment[];
export const LEADS = [] as import("./types").Lead[];
export const CAVA_CONVERSATIONS: CavaConversation[] = [];
export const REVENUE_DATA: RevenueDataPoint[] = [];

export const MONTHLY_SUMMARY = {
  currentMonth: 0,
  previousMonth: 0,
  target: 0,
  weeklyData: [] as { week: string; amount: number }[],
  byService: [] as { name: string; amount: number; count: number }[],
  pendingDeposits: [] as { client: string; service: string; amount: number; date: string }[],
};

export const TODAY_KPIS = {
  citasConfirmadas: 0,
  citasTrend: 0,
  ingresosDia: 0,
  ingresosTrend: 0,
  leadsActivos: 0,
  leadsTrend: 0,
  tasaConversion: 0,
  conversionTrend: 0,
  ocupacion: 0,
  healthScore: 0,
};

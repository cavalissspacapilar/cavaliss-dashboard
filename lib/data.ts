// Static reference data only — NO fake client/lead/appointment/revenue data.
// All live data comes from Base44, Google Sheets, and Stripe via API routes.
import type { ServiceData, Workflow, RevenueDataPoint, CavaConversation } from "./types";

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

// n8n workflow definitions — static reference data for /sistema page.
export const WORKFLOWS: Workflow[] = [
  { id: 1, name: "IA Cavaliss Vendedora", description: "Agente de IA que responde leads y agenda citas automáticamente", status: "activo", lastRun: "hace 12 seg", nextRun: "continuo", executionsToday: 83, successRate: 100, monthlyCost: 0 },
  { id: 2, name: "M1.1 Nueva Reserva", description: "Confirmación automática de cita al momento de agendar", status: "activo", lastRun: "hace 4 min", nextRun: "en espera", executionsToday: 9, successRate: 100, monthlyCost: 0 },
  { id: 3, name: "M1.2 Recordatorio 24h", description: "WhatsApp de recordatorio 24 horas antes de la cita", status: "activo", lastRun: "hoy 9:00am", nextRun: "mañana 9am", executionsToday: 6, successRate: 100, monthlyCost: 0 },
  { id: 4, name: "M1.3 Recordatorio 2h", description: "WhatsApp de recordatorio 2 horas antes de la cita", status: "activo", lastRun: "hace 1h 48min", nextRun: "en 12 min", executionsToday: 4, successRate: 100, monthlyCost: 0 },
  { id: 5, name: "M2.1 CRM Clasificación", description: "Clasifica y etiqueta leads automáticamente en el CRM", status: "activo", lastRun: "hace 23 min", nextRun: "en espera", executionsToday: 14, successRate: 100, monthlyCost: 0 },
  { id: 6, name: "M2.2 Reporte Diario", description: "Envía resumen diario de citas e ingresos a Angee vía WhatsApp", status: "activo", lastRun: "hoy 8:00am", nextRun: "mañana 8am", executionsToday: 1, successRate: 100, monthlyCost: 0 },
  { id: 7, name: "M3.1 Retención Día 3", description: "Mensaje de seguimiento 3 días después del servicio", status: "activo", lastRun: "hoy 10:00am", nextRun: "mañana 10am", executionsToday: 2, successRate: 100, monthlyCost: 0 },
  { id: 8, name: "M3.2 Retención Día 7", description: "Mensaje de reactivación 7 días post-servicio", status: "activo", lastRun: "hoy 10:05am", nextRun: "mañana 10am", executionsToday: 3, successRate: 100, monthlyCost: 0 },
  { id: 9, name: "M3.3 Retención Día 15", description: "Oferta especial para clientas sin visita en 15 días", status: "activo", lastRun: "hoy 10:10am", nextRun: "mañana 10am", executionsToday: 1, successRate: 100, monthlyCost: 0 },
  { id: 10, name: "Reserva Automática", description: "Crea reserva en Base44 cuando lead confirma interés", status: "activo", lastRun: "hace 33 min", nextRun: "en espera", executionsToday: 2, successRate: 100, monthlyCost: 0 },
  { id: 11, name: "Stripe Pago Confirmado", description: "Registra pagos confirmados en Google Sheets CRM", status: "activo", lastRun: "hace 18 min", nextRun: "en espera", executionsToday: 5, successRate: 100, monthlyCost: 0 },
  { id: 12, name: "Secuencia Cierre Leads", description: "Secuencia de mensajes para convertir leads calientes en reservas", status: "activo", lastRun: "hace 8 min", nextRun: "en espera", executionsToday: 7, successRate: 100, monthlyCost: 0 },
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

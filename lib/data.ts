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

// n8n workflow definitions — static is acceptable per spec (Sistema page).
export const WORKFLOWS: Workflow[] = [
  { id: 1, name: "Confirmación de Citas", description: "Envía WhatsApp de confirmación 24h antes de la cita", status: "activo", lastRun: "hace 2 min", nextRun: "en 58 min", executionsToday: 9, successRate: 100, monthlyCost: 120 },
  { id: 2, name: "Seguimiento de Leads", description: "Cava IA responde y nutre leads de Meta Ads", status: "activo", lastRun: "hace 30 seg", nextRun: "continuo", executionsToday: 47, successRate: 98, monthlyCost: 380 },
  { id: 3, name: "Recordatorio de Anticipo", description: "Alerta a clientes con reserva sin pago de anticipo", status: "activo", lastRun: "hace 15 min", nextRun: "en 45 min", executionsToday: 5, successRate: 100, monthlyCost: 60 },
  { id: 4, name: "Sincronización Base44→Sheets", description: "Exporta citas confirmadas a Google Sheets CRM", status: "advertencia", lastRun: "hace 1h 20min", nextRun: "en 10 min", executionsToday: 3, successRate: 75, monthlyCost: 90, lastError: "Timeout al escribir en Sheets. Reintentando..." },
  { id: 5, name: "Reactivación de Clientas", description: "Contacta clientas inactivas más de 45 días", status: "activo", lastRun: "hace 6h", nextRun: "mañana 9am", executionsToday: 1, successRate: 100, monthlyCost: 45 },
  { id: 6, name: "Reporte Diario de Ingresos", description: "Genera resumen de ingresos y lo envía por WhatsApp a Angee", status: "activo", lastRun: "hoy 8:00am", nextRun: "mañana 8am", executionsToday: 1, successRate: 100, monthlyCost: 30 },
  { id: 7, name: "Post-Servicio Review", description: "Solicita reseña de Google a clientas 2h después del servicio", status: "activo", lastRun: "hace 45 min", nextRun: "en 1h 15min", executionsToday: 4, successRate: 100, monthlyCost: 55 },
  { id: 8, name: "Integración Stripe→CRM", description: "Registra pagos de Stripe en Google Sheets automáticamente", status: "error", lastRun: "hace 3h 10min", nextRun: "—", executionsToday: 0, successRate: 0, monthlyCost: 70, lastError: "API Stripe webhook 401 Unauthorized. Revisar clave secreta." },
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

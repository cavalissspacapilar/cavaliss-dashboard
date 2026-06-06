import type { Appointment, Client, Lead, CavaConversation, RevenueDataPoint } from "./types";
import type { MONTHLY_SUMMARY } from "./data";
import type { KPIData } from "@/app/api/kpis/route";
import type { PaymentRow } from "@/app/api/ingresos/route";

type MonthlySummary = typeof MONTHLY_SUMMARY;

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchCitas = () => apiFetch<Appointment[]>("/api/citas");
export const fetchClientes = () => apiFetch<Client[]>("/api/clientes");
export const fetchLeads = () => apiFetch<Lead[]>("/api/leads");
export const fetchConversaciones = () => apiFetch<CavaConversation[]>("/api/conversaciones");
export const fetchIngresos = () =>
  apiFetch<{ revenueData: RevenueDataPoint[]; payments: PaymentRow[]; summary: MonthlySummary }>("/api/ingresos");
export const fetchKPIs = () => apiFetch<KPIData>("/api/kpis");

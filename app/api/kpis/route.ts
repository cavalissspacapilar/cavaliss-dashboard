import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";

export interface KPIData {
  citasHoy: number;
  ingresosDia: number;
  leadsActivos: number;
  totalLeads: number;
  convertidos: number;
  tasaConversion: number;
}

const EMPTY: KPIData = { citasHoy: 0, ingresosDia: 0, leadsActivos: 0, totalLeads: 0, convertidos: 0, tasaConversion: 0 };

export async function GET() {
  const result = { ...EMPTY };
  const today = new Date().toISOString().split("T")[0];

  // 1. Citas confirmadas hoy — Base44
  try {
    const res = await fetch(`${process.env.BASE44_API_URL}/Appointment`, {
      headers: { api_key: process.env.BASE44_API_KEY! },
      next: { revalidate: 120 },
    });
    if (res.ok) {
      const json = await res.json();
      const items: Record<string, unknown>[] = Array.isArray(json) ? json
        : Array.isArray(json?.data) ? json.data
        : Array.isArray(json?.items) ? json.items : [];

      result.citasHoy = items.filter(a => {
        const date = String(a.date ?? a.fecha ?? a.Date ?? a.appointment_date ?? "");
        const status = String(a.status ?? a.estado ?? "").toLowerCase();
        return date === today && !status.includes("cancel");
      }).length;
    }
  } catch (e) {
    console.error("[kpis/citas]", e);
  }

  // 2. Ingresos hoy — Stripe PaymentIntents
  try {
    const startOfDay = Math.floor(new Date(today + "T00:00:00").getTime() / 1000);
    const endOfDay = startOfDay + 86400;
    const res = await fetch(
      `https://api.stripe.com/v1/payment_intents?limit=100&created[gte]=${startOfDay}&created[lt]=${endOfDay}`,
      { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
    );
    if (res.ok) {
      const json = await res.json();
      result.ingresosDia = (json.data ?? [])
        .filter((pi: { status: string }) => pi.status === "succeeded")
        .reduce((s: number, pi: { amount: number }) => s + pi.amount / 100, 0);
    }
  } catch (e) {
    console.error("[kpis/stripe]", e);
  }

  // 3. Leads — Google Sheets (TODO: migrar a Base44 getLeadsForDashboard)
  try {
    const rows = await fetchSheet("Leads");
    result.totalLeads = rows.length;

    const activeStatuses = ["nuevo", "en conversaci", "caliente", "reserva", "lista", "listo"];
    result.leadsActivos = rows.filter(r =>
      activeStatuses.some(s => (r.estado ?? "").toLowerCase().includes(s))
    ).length;

    result.convertidos = rows.filter(r =>
      (r.estado ?? "").toLowerCase().includes("convert")
    ).length;

    result.tasaConversion = result.totalLeads > 0
      ? Math.round((result.convertidos / result.totalLeads) * 100)
      : 0;
  } catch (e) {
    console.error("[kpis/leads]", e);
  }

  return NextResponse.json(result);
}

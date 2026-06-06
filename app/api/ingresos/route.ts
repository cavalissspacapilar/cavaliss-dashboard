import { NextResponse } from "next/server";
import type { RevenueDataPoint } from "@/lib/types";

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  created: number;
  status: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentRow {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "deposito" | "pago_completo" | "pago";
}

interface StripeList {
  data: PaymentIntent[];
  has_more: boolean;
}

function toDateStr(ts: number): string {
  return new Date(ts * 1000).toISOString().split("T")[0];
}

async function fetchPaymentIntents(createdGte: number): Promise<PaymentIntent[]> {
  const url = `https://api.stripe.com/v1/payment_intents?limit=100&created[gte]=${createdGte}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  const json: StripeList = await res.json();
  return json.data.filter(pi => pi.status === "succeeded");
}

export async function GET() {
  const emptyResponse = {
    revenueData: [] as RevenueDataPoint[],
    payments: [] as PaymentRow[],
    summary: {
      currentMonth: 0,
      previousMonth: 0,
      target: 0,
      weeklyData: [] as { week: string; amount: number }[],
      byService: [] as { name: string; amount: number; count: number }[],
      pendingDeposits: [] as { client: string; service: string; amount: number; date: string }[],
      totalHistorico: 0,
      depositos: 0,
      pagosCompletos: 0,
    },
  };

  try {
    const now = new Date();
    const nowSec = Math.floor(now.getTime() / 1000);
    const last30Start = nowSec - 30 * 24 * 60 * 60;
    const last60Start = nowSec - 60 * 24 * 60 * 60;

    // Single fetch covers both 30-day windows
    const allPIs = await fetchPaymentIntents(last60Start);

    const currentPIs = allPIs.filter(pi => pi.created >= last30Start);
    const prevPIs    = allPIs.filter(pi => pi.created < last30Start);

    // 30-day daily series for chart
    const byDate: Record<string, number> = {};
    currentPIs.forEach(pi => {
      const d = toDateStr(pi.created);
      byDate[d] = (byDate[d] ?? 0) + pi.amount / 100;
    });

    const points: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      return { date: dateStr, amount: byDate[dateStr] ?? 0, appointments: 0 };
    });

    // Rolling window totals
    const currentMonth  = currentPIs.reduce((s, pi) => s + pi.amount / 100, 0);
    const previousMonth = prevPIs.reduce((s, pi) => s + pi.amount / 100, 0);
    const totalHistorico = allPIs.reduce((s, pi) => s + pi.amount / 100, 0);

    // Type counts (last 30 days)
    const depositos     = currentPIs.filter(pi => pi.metadata?.type === "deposito").length;
    const pagosCompletos = currentPIs.filter(pi => pi.metadata?.type === "pago_completo").length;

    // Weekly breakdown — 4 buckets of 7 days within last 30
    const weeklyData = [0, 1, 2, 3].map(wi => {
      const wStart = last30Start + wi * 7 * 24 * 60 * 60;
      const wEnd   = wStart + 7 * 24 * 60 * 60;
      const amount = currentPIs
        .filter(pi => pi.created >= wStart && pi.created < wEnd)
        .reduce((s, pi) => s + pi.amount / 100, 0);
      return { week: `Sem ${wi + 1}`, amount };
    });

    // Service breakdown from metadata/description (last 30 days)
    const byServiceMap: Record<string, { amount: number; count: number }> = {};
    currentPIs.forEach(pi => {
      const svc = pi.metadata?.service ?? pi.description ?? "Sin categoría";
      const ex = byServiceMap[svc] ?? { amount: 0, count: 0 };
      byServiceMap[svc] = { amount: ex.amount + pi.amount / 100, count: ex.count + 1 };
    });

    const byService = Object.entries(byServiceMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 9);

    // Individual payments table (last 30 days)
    const payments: PaymentRow[] = currentPIs.map(pi => {
      const metaType = pi.metadata?.type ?? "";
      const type: PaymentRow["type"] =
        metaType === "deposito"     ? "deposito"
        : metaType === "pago_completo" ? "pago_completo"
        : "pago";
      return {
        id: pi.id,
        date: toDateStr(pi.created),
        amount: pi.amount / 100,
        description: pi.description ?? pi.metadata?.service ?? pi.metadata?.description ?? "Anticipo de reserva",
        type,
      };
    }).sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      revenueData: points,
      payments,
      summary: {
        currentMonth,
        previousMonth,
        target: 0,
        weeklyData,
        byService,
        pendingDeposits: [],
        totalHistorico,
        depositos,
        pagosCompletos,
      },
    }, { headers: { "X-Data-Source": "stripe" } });
  } catch (err) {
    console.error("[/api/ingresos]", err);
    return NextResponse.json(emptyResponse, {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

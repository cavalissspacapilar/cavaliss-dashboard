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
    summary: {
      currentMonth: 0,
      previousMonth: 0,
      target: 0,
      weeklyData: [] as { week: string; amount: number }[],
      byService: [] as { name: string; amount: number; count: number }[],
      pendingDeposits: [] as { client: string; service: string; amount: number; date: string }[],
    },
  };

  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const prevMonthStart = Math.floor(startOfPrevMonth.getTime() / 1000);
    const currentMonthStart = Math.floor(startOfCurrentMonth.getTime() / 1000);

    // Current month + 30-day window
    const [currentPIs, prevPIs] = await Promise.all([
      fetchPaymentIntents(Math.min(thirtyDaysAgo, currentMonthStart)),
      fetchPaymentIntents(prevMonthStart).then(all =>
        all.filter(pi => pi.created >= prevMonthStart && pi.created < currentMonthStart)
      ),
    ]);

    // 30-day daily series
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

    // Monthly totals
    const currentMonth = currentPIs
      .filter(pi => pi.created >= currentMonthStart)
      .reduce((s, pi) => s + pi.amount / 100, 0);

    const previousMonth = prevPIs.reduce((s, pi) => s + pi.amount / 100, 0);

    // Weekly breakdown for current month
    const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
    const weeklyData = weeks.map((week, wi) => {
      const wStart = new Date(startOfCurrentMonth);
      wStart.setDate(1 + wi * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 7);
      const amount = currentPIs
        .filter(pi => {
          const d = new Date(pi.created * 1000);
          return d >= wStart && d < wEnd && pi.created >= currentMonthStart;
        })
        .reduce((s, pi) => s + pi.amount / 100, 0);
      return { week, amount };
    });

    // Service breakdown from metadata/description
    const byServiceMap: Record<string, { amount: number; count: number }> = {};
    currentPIs
      .filter(pi => pi.created >= currentMonthStart)
      .forEach(pi => {
        const svc = pi.metadata?.service ?? pi.description ?? "Sin categoría";
        const existing = byServiceMap[svc] ?? { amount: 0, count: 0 };
        byServiceMap[svc] = { amount: existing.amount + pi.amount / 100, count: existing.count + 1 };
      });

    const byService = Object.entries(byServiceMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 9);

    return NextResponse.json({
      revenueData: points,
      summary: { currentMonth, previousMonth, target: 0, weeklyData, byService, pendingDeposits: [] },
    }, { headers: { "X-Data-Source": "stripe" } });
  } catch (err) {
    console.error("[/api/ingresos]", err);
    return NextResponse.json(emptyResponse, {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

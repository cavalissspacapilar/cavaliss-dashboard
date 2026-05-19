import { NextResponse } from "next/server";
import { REVENUE_DATA, MONTHLY_SUMMARY } from "@/lib/data";
import type { RevenueDataPoint } from "@/lib/types";

interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  created: number;
  status: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripeList {
  data: StripeCharge[];
  has_more: boolean;
}

function toDateStr(ts: number): string {
  return new Date(ts * 1000).toISOString().split("T")[0];
}

async function fetchAllCharges(): Promise<StripeCharge[]> {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const url = `https://api.stripe.com/v1/charges?limit=100&created[gte]=${thirtyDaysAgo}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  const json: StripeList = await res.json();
  return json.data.filter(c => c.status === "succeeded");
}

export async function GET() {
  try {
    const charges = await fetchAllCharges();

    // Group by date
    const byDate: Record<string, number> = {};
    charges.forEach(c => {
      const d = toDateStr(c.created);
      // Stripe amounts are in centavos for MXN → divide by 100
      byDate[d] = (byDate[d] ?? 0) + c.amount / 100;
    });

    // Build 30-day series (fill missing days with 0)
    const today = new Date();
    const points: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      return { date: dateStr, amount: byDate[dateStr] ?? 0, appointments: 0 };
    });

    // Monthly totals
    const currentMonth = points.reduce((s, p) => s + p.amount, 0);
    const prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Build service breakdown from charge descriptions / metadata
    const byService: Record<string, number> = {};
    charges.forEach(c => {
      const svc = c.metadata?.service ?? c.description ?? "Servicio";
      byService[svc] = (byService[svc] ?? 0) + c.amount / 100;
    });

    const serviceBreakdown = Object.entries(byService)
      .map(([name, amount]) => ({ name, amount, count: 1 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 9);

    return NextResponse.json({
      revenueData: points,
      summary: {
        currentMonth,
        previousMonth: MONTHLY_SUMMARY.previousMonth,
        target: MONTHLY_SUMMARY.target,
        weeklyData: MONTHLY_SUMMARY.weeklyData,
        byService: serviceBreakdown.length ? serviceBreakdown : MONTHLY_SUMMARY.byService,
        pendingDeposits: MONTHLY_SUMMARY.pendingDeposits,
      },
    });
  } catch (err) {
    console.error("[/api/ingresos] fallback:", err);
    return NextResponse.json({
      revenueData: REVENUE_DATA,
      summary: MONTHLY_SUMMARY,
    });
  }
}

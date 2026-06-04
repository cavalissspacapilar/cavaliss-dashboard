import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";

export async function GET() {
  try {
    const data = await fetchBase44Function('getMetricsForDashboard');
    return NextResponse.json(data.metricas ?? []);
  } catch (err) {
    console.error("[/api/metricas]", err);
    return NextResponse.json([], { status: 200 });
  }
}

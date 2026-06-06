import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { IQDashboardData } from "@/lib/iq-types";

export async function GET() {
  const result: IQDashboardData = {
    total_clientes: 0,
    hair_score_promedio: 0,
    mejorando: 0,
    en_riesgo: 0,
    datos_completos: 0,
  };

  try {
    const data = await fetchBase44Function('getIQProfiles');
    const profiles: Record<string, unknown>[] = data.profiles ?? [];

    if (profiles.length === 0) return NextResponse.json(result);

    result.total_clientes = profiles.length;

    const scores = profiles
      .map(p => Number(p.score_general_capilar ?? 0))
      .filter(s => s > 0);

    result.hair_score_promedio =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;

    result.mejorando = profiles.filter(p => {
      const r = String(p.riesgo_abandono ?? "").toLowerCase();
      return r === "bajo" || r === "ninguno" || r === "";
    }).length;

    result.en_riesgo = profiles.filter(p => {
      const r = String(p.riesgo_abandono ?? "").toLowerCase();
      return r === "alto" || r === "critico" || r === "crítico";
    }).length;

    result.datos_completos = profiles.filter(
      p => Number(p.score_general_capilar ?? 0) > 0
    ).length;
  } catch (e) {
    console.error("[iq/dashboard]", e);
  }

  return NextResponse.json(result);
}

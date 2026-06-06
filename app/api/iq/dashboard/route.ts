import { NextResponse } from "next/server";
import type { IQDashboardData } from "@/lib/iq-types";


function parseItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown> | null;
  if (j && Array.isArray(j.data)) return j.data as Record<string, unknown>[];
  if (j && Array.isArray(j.items)) return j.items as Record<string, unknown>[];
  return [];
}

export async function GET() {
  const result: IQDashboardData = {
    total_clientes: 0,
    hair_score_promedio: 0,
    mejorando: 0,
    en_riesgo: 0,
    datos_completos: 0,
  };

  try {
    const res = await fetch(`${process.env.BASE44_API_URL}/PerfilCapilarV2`, {
      headers: { api_key: process.env.BASE44_API_KEY! },
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const json: unknown = await res.json();
      const items = parseItems(json);

      if (items.length === 0) return NextResponse.json(result);

      result.total_clientes = items.length;

      const scores = items
        .map((i) => Number(i.score_general_capilar ?? 0))
        .filter((s) => s > 0);

      result.hair_score_promedio =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
            ) / 10
          : 0;

      result.mejorando = items.filter((i) => {
        const r = String(i.riesgo_abandono ?? "").toLowerCase();
        return r === "bajo" || r === "ninguno" || r === "";
      }).length;

      result.en_riesgo = items.filter((i) => {
        const r = String(i.riesgo_abandono ?? "").toLowerCase();
        return r === "alto" || r === "critico" || r === "crítico";
      }).length;

      result.datos_completos = items.filter(
        (i) => i.datos_completos === true
      ).length;
    }
  } catch (e) {
    console.error("[iq/dashboard]", e);
  }

  return NextResponse.json(result);
}

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
    let profiles: Record<string, unknown>[] = [];

    // Try getIQProfiles function first
    try {
      const data = await fetchBase44Function('getIQProfiles');
      if (data.profiles?.length > 0) {
        profiles = data.profiles;
      }
    } catch {}

    // Fallback: read PerfilCapilarV2 entity directly
    if (profiles.length === 0) {
      const res = await fetch(`${process.env.BASE44_API_URL}/PerfilCapilarV2`, {
        headers: { api_key: process.env.BASE44_API_KEY! },
        next: { revalidate: 120 },
      });
      if (res.ok) {
        const json: unknown = await res.json();
        profiles = Array.isArray(json) ? json as Record<string, unknown>[] : [];
      }
    }

    // Filter out orphaned records
    const valid = profiles.filter(p => p.client_profile_id);

    if (valid.length === 0) return NextResponse.json(result);

    result.total_clientes = valid.length;

    const scores = valid
      .map(p => Number(p.score_general_capilar ?? 0))
      .filter(s => s > 0);

    result.hair_score_promedio =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;

    result.mejorando = valid.filter(p => {
      const r = String(p.riesgo_abandono ?? "").toLowerCase();
      return r === "bajo" || r === "ninguno" || r === "";
    }).length;

    result.en_riesgo = valid.filter(p => {
      const r = String(p.riesgo_abandono ?? "").toLowerCase();
      return r === "alto" || r === "critico" || r === "crítico";
    }).length;

    result.datos_completos = valid.filter(
      p => Number(p.score_general_capilar ?? 0) > 0
    ).length;
  } catch (e) {
    console.error("[iq/dashboard]", e);
  }

  return NextResponse.json(result);
}

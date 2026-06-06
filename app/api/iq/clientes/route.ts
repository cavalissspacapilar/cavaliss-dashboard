import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { IQClienteSummary } from "@/lib/iq-types";

// null → 5 (neutral midpoint on 0-10 scale)
function n10(v: unknown): number {
  const n = Number(v ?? null);
  return isNaN(n) || v === null || v === undefined ? 5 : n;
}

export async function GET() {
  try {
    const data = await fetchBase44Function('getIQProfiles');
    const profiles: Record<string, unknown>[] = data.profiles ?? [];

    const clientes: IQClienteSummary[] = profiles.map(p => ({
      id: String(p.id ?? ""),
      client_profile_id: String(p.client_profile_id ?? p.id ?? ""),
      nombre: String(p.nombre ?? p.name ?? "Sin nombre"),
      telefono: String(p.telefono ?? ""),
      score_general_capilar: Number(p.score_general_capilar ?? 0),
      riesgo_abandono: String(p.riesgo_abandono ?? ""),
      objetivo_capilar: String(p.objetivo_capilar ?? ""),
      tendencia: String(p.tendencia ?? ""),
      fecha_ultimo_diagnostico: String(p.fecha_ultimo_diagnostico ?? ""),
      nivel_daño_actual: n10(p.nivel_daño_actual),
      hidratacion_actual: n10(p.hidratacion_actual),
      frizz_actual: n10(p.frizz_actual),
      rotura_actual: n10(p.rotura_actual),
      caida_actual: n10(p.caida_actual),
      brillo_actual: n10(p.brillo_actual),
      elasticidad_actual: n10(p.elasticidad_actual),
      problema_alopecia: p.problema_alopecia === true,
      problema_dermatitis: p.problema_dermatitis === true,
      problema_caspa: p.problema_caspa === true,
      problema_seborrea: p.problema_seborrea === true,
      sesiones_recomendadas: String(p.sesiones_recomendadas ?? ""),
      procedimiento_a_realizar: String(p.procedimiento_a_realizar ?? ""),
      visit_count: Number(p.visit_count ?? 0),
      total_spent: Number(p.total_spent ?? 0),
      loyalty_tier: String(p.loyalty_tier ?? ""),
    }));

    // Worst scores first (needs most attention)
    clientes.sort((a, b) => a.score_general_capilar - b.score_general_capilar);

    return NextResponse.json(clientes);
  } catch (e) {
    console.error("[iq/clientes]", e);
    return NextResponse.json([]);
  }
}

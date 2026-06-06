import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { IQClienteSummary } from "@/lib/iq-types";

// null → 5 (neutral midpoint on 0-10 scale)
function n10(v: unknown): number {
  const n = Number(v ?? null);
  return isNaN(n) || v === null || v === undefined ? 5 : n;
}

function mapProfile(p: Record<string, unknown>, nameMap: Map<string, string>, i: number): IQClienteSummary {
  const cpId = String(p.client_profile_id ?? "");
  return {
    id: String(p.id ?? i),
    client_profile_id: cpId,
    nombre: nameMap.get(cpId) ?? String(p.nombre ?? p.name ?? "Sin nombre"),
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
  };
}

async function fetchClientNames(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const data = await fetchBase44Function('getClientsForDashboard');
    const clients: Record<string, unknown>[] = data.clients ?? [];
    clients.forEach(c => {
      const id = String(c.id ?? "");
      if (id) map.set(id, String(c.name ?? ""));
    });
  } catch {}
  return map;
}

export async function GET() {
  try {
    let profiles: Record<string, unknown>[] = [];
    let nameMap = new Map<string, string>();

    // Try getIQProfiles function first
    try {
      const data = await fetchBase44Function('getIQProfiles');
      if (data.profiles?.length > 0) {
        profiles = data.profiles;
      }
    } catch {}

    // Fallback: read PerfilCapilarV2 entity directly
    if (profiles.length === 0) {
      const [res, names] = await Promise.all([
        fetch(`${process.env.BASE44_API_URL}/PerfilCapilarV2`, {
          headers: { api_key: process.env.BASE44_API_KEY! },
          next: { revalidate: 120 },
        }),
        fetchClientNames(),
      ]);
      nameMap = names;
      if (res.ok) {
        const json: unknown = await res.json();
        profiles = Array.isArray(json) ? json as Record<string, unknown>[] : [];
      }
    }

    // Filter out orphaned records (no client_profile_id)
    const valid = profiles.filter(p => p.client_profile_id);

    const clientes: IQClienteSummary[] = valid.map((p, i) => mapProfile(p, nameMap, i));
    clientes.sort((a, b) => a.score_general_capilar - b.score_general_capilar);

    return NextResponse.json(clientes);
  } catch (e) {
    console.error("[iq/clientes]", e);
    return NextResponse.json([]);
  }
}

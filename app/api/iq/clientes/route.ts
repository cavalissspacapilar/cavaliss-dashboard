import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { IQClienteSummary } from "@/lib/iq-types";

function n10(v: unknown): number {
  const n = Number(v ?? null);
  return isNaN(n) || v === null || v === undefined ? 5 : n;
}

interface ClientData { name: string; phone: string }

async function fetchClientData(): Promise<Map<string, ClientData>> {
  const map = new Map<string, ClientData>();
  try {
    const data = await fetchBase44Function('getClientsForDashboard');
    const clients: Record<string, unknown>[] = data.clients ?? [];
    clients.forEach(c => {
      const id = String(c.id ?? "");
      if (id) map.set(id, {
        name: String(c.name ?? ""),
        phone: String(c.phone ?? c.telefono ?? ""),
      });
    });
  } catch {}
  return map;
}

function mapProfile(p: Record<string, unknown>, clientMap: Map<string, ClientData>, i: number): IQClienteSummary {
  const cpId = String(p.client_profile_id ?? "");
  const cd = clientMap.get(cpId);
  return {
    id: String(p.id ?? i),
    client_profile_id: cpId,
    nombre: cd?.name ?? String(p.nombre ?? p.name ?? "Sin nombre"),
    telefono: cd?.phone ?? String(p.telefono ?? ""),
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
    firma_cliente_timestamp: p.firma_cliente_timestamp ? String(p.firma_cliente_timestamp) : undefined,
    firma_especialista_nombre: p.firma_especialista_nombre ? String(p.firma_especialista_nombre) : undefined,
    visit_count: Number(p.visit_count ?? 0),
    total_spent: Number(p.total_spent ?? 0),
    loyalty_tier: String(p.loyalty_tier ?? ""),
  };
}

export async function GET() {
  try {
    let profiles: Record<string, unknown>[] = [];

    // Try getIQProfiles + client data in parallel
    const [iqResult, clientMap] = await Promise.all([
      fetchBase44Function('getIQProfiles').catch(() => null),
      fetchClientData(),
    ]);

    if (iqResult?.profiles?.length > 0) {
      profiles = iqResult.profiles as Record<string, unknown>[];
    }

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

    // Filter out orphaned records (no client_profile_id)
    const valid = profiles.filter(p => p.client_profile_id);
    const clientes: IQClienteSummary[] = valid.map((p, i) => mapProfile(p, clientMap, i));
    clientes.sort((a, b) => a.score_general_capilar - b.score_general_capilar);

    return NextResponse.json(clientes);
  } catch (e) {
    console.error("[iq/clientes]", e);
    return NextResponse.json([]);
  }
}

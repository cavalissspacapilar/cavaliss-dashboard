import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type {
  PerfilCapilarV2,
  HistorialCapilarSnapshot,
  IQClienteDetail,
} from "@/lib/iq-types";

function n10(v: unknown): number {
  const n = Number(v ?? null);
  return isNaN(n) || v === null || v === undefined ? 5 : n;
}

function parseItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown> | null;
  if (j && Array.isArray(j.data)) return j.data as Record<string, unknown>[];
  if (j && Array.isArray(j.items)) return j.items as Record<string, unknown>[];
  return [];
}

function buildQuery(clientProfileId: string) {
  return encodeURIComponent(JSON.stringify({ client_profile_id: clientProfileId }));
}

function rawToPerfil(raw: Record<string, unknown>, nombre = ""): PerfilCapilarV2 {
  return {
    id: String(raw.id ?? ""),
    client_profile_id: String(raw.client_profile_id ?? raw.id ?? ""),
    nombre: String(raw.nombre ?? raw.name ?? (nombre || "Sin nombre")),
    score_general_capilar: Number(raw.score_general_capilar ?? 0),
    riesgo_abandono: String(raw.riesgo_abandono ?? ""),
    objetivo_capilar: String(raw.objetivo_capilar ?? ""),
    tendencia: String(raw.tendencia ?? ""),
    fecha_ultimo_diagnostico: String(raw.fecha_ultimo_diagnostico ?? ""),
    datos_completos: Number(raw.score_general_capilar ?? 0) > 0,
    nivel_daño_actual: n10(raw.nivel_daño_actual),
    hidratacion_actual: n10(raw.hidratacion_actual),
    frizz_actual: n10(raw.frizz_actual),
    rotura_actual: n10(raw.rotura_actual),
    caida_actual: n10(raw.caida_actual),
    brillo_actual: n10(raw.brillo_actual),
    elasticidad_actual: n10(raw.elasticidad_actual),
    score_dano: Number(raw.score_dano ?? 0),
    score_hidratacion: Number(raw.score_hidratacion ?? 0),
    score_frizz: Number(raw.score_frizz ?? 0),
    score_rotura: Number(raw.score_rotura ?? 0),
    score_caida: Number(raw.score_caida ?? 0),
    score_brillo: Number(raw.score_brillo ?? 0),
    score_elasticidad: Number(raw.score_elasticidad ?? 0),
    problema_alopecia: raw.problema_alopecia === true,
    problema_dermatitis: raw.problema_dermatitis === true,
    problema_caspa: raw.problema_caspa === true,
    problema_seborrea: raw.problema_seborrea === true,
    sesiones_recomendadas: String(raw.sesiones_recomendadas ?? ""),
    procedimiento_a_realizar: String(raw.procedimiento_a_realizar ?? ""),
    foto_antes_url: raw.foto_antes_url ? String(raw.foto_antes_url) : undefined,
    foto_despues_url: raw.foto_despues_url ? String(raw.foto_despues_url) : undefined,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result: IQClienteDetail = { perfil: null, snapshots: [] };

  // ── 1. Fetch perfil ───────────────────────────────────────────────────────
  try {
    let raw: Record<string, unknown> | null = null;
    let clientName = "";

    // Try getIQProfiles function first
    try {
      const data = await fetchBase44Function('getIQProfiles');
      const profiles: Record<string, unknown>[] = data.profiles ?? [];
      raw = profiles.find(p =>
        String(p.id ?? "") === id || String(p.client_profile_id ?? "") === id
      ) ?? null;
    } catch {}

    // Fallback: query PerfilCapilarV2 entity by client_profile_id
    if (!raw) {
      const [perfilRes, clientsData] = await Promise.all([
        fetch(`${process.env.BASE44_API_URL}/PerfilCapilarV2?query=${buildQuery(id)}`, {
          headers: { api_key: process.env.BASE44_API_KEY! },
          next: { revalidate: 60 },
        }),
        fetchBase44Function('getClientsForDashboard').catch(() => ({ clients: [] })),
      ]);

      // Get client name from clients list
      const clients: Record<string, unknown>[] = clientsData.clients ?? [];
      const client = clients.find(c => String(c.id ?? "") === id);
      clientName = String(client?.name ?? "");

      if (perfilRes.ok) {
        const json: unknown = await perfilRes.json();
        const items = parseItems(json);
        if (items.length > 0) raw = items[0];
      }
    }

    if (raw) {
      result.perfil = rawToPerfil(raw, clientName);
    }
  } catch (e) {
    console.error("[iq/cliente/perfil]", e);
  }

  // ── 2. Fetch HistorialCapilarSnapshot ─────────────────────────────────────
  try {
    const res = await fetch(
      `${process.env.BASE44_API_URL}/HistorialCapilarSnapshot?query=${buildQuery(id)}`,
      {
        headers: { api_key: process.env.BASE44_API_KEY! },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const json: unknown = await res.json();
      const items = parseItems(json);

      const snapshots: HistorialCapilarSnapshot[] = items.map(i => ({
        id: String(i.id ?? i._id ?? ""),
        client_profile_id: String(i.client_profile_id ?? ""),
        fecha_snapshot: String(i.fecha_snapshot ?? ""),
        score_general: Number(i.score_general ?? 0),
        tendencia: String(i.tendencia ?? ""),
        servicio_aplicado: String(i.servicio_aplicado ?? ""),
      }));

      snapshots.sort((a, b) => {
        const da = new Date(a.fecha_snapshot).getTime();
        const db = new Date(b.fecha_snapshot).getTime();
        return isNaN(db) || isNaN(da) ? 0 : db - da;
      });

      result.snapshots = snapshots;
    }
  } catch (e) {
    console.error("[iq/cliente/historial]", e);
  }

  return NextResponse.json(result);
}

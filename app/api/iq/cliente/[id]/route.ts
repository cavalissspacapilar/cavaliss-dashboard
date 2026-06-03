import { NextResponse } from "next/server";
import type {
  PerfilCapilarV2,
  HistorialCapilarSnapshot,
  IQClienteDetail,
} from "@/lib/iq-types";


function parseItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown> | null;
  if (j && Array.isArray(j.data)) return j.data as Record<string, unknown>[];
  if (j && Array.isArray(j.items)) return j.items as Record<string, unknown>[];
  return [];
}

function buildQuery(clientProfileId: string) {
  return encodeURIComponent(
    JSON.stringify({ client_profile_id: clientProfileId })
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result: IQClienteDetail = { perfil: null, snapshots: [] };

  // ── 1. Fetch PerfilCapilarV2 ──────────────────────────────────────────────
  try {
    const res = await fetch(
      `${process.env.BASE44_API_URL}/PerfilCapilarV2?query=${buildQuery(id)}`,
      {
        headers: { api_key: process.env.BASE44_API_KEY! },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const json: unknown = await res.json();
      const items = parseItems(json);

      if (items.length > 0) {
        const raw = items[0];
        const perfil: PerfilCapilarV2 = {
          id: String(raw.id ?? raw._id ?? ""),
          client_profile_id: String(raw.client_profile_id ?? ""),
          nombre: String(
            raw.nombre ??
              raw.name ??
              raw.client_name ??
              raw.client_profile_id ??
              "Sin nombre"
          ),
          score_general_capilar: Number(raw.score_general_capilar ?? 0),
          riesgo_abandono: String(raw.riesgo_abandono ?? ""),
          objetivo_capilar: String(raw.objetivo_capilar ?? ""),
          tendencia: String(raw.tendencia ?? ""),
          fecha_ultimo_diagnostico: String(raw.fecha_ultimo_diagnostico ?? ""),
          datos_completos: raw.datos_completos === true,
          score_dano: Number(raw.score_dano ?? 0),
          score_hidratacion: Number(raw.score_hidratacion ?? 0),
          score_frizz: Number(raw.score_frizz ?? 0),
          score_rotura: Number(raw.score_rotura ?? 0),
          score_caida: Number(raw.score_caida ?? 0),
          score_brillo: Number(raw.score_brillo ?? 0),
          score_elasticidad: Number(raw.score_elasticidad ?? 0),
          foto_antes_url: raw.foto_antes_url
            ? String(raw.foto_antes_url)
            : undefined,
          foto_despues_url: raw.foto_despues_url
            ? String(raw.foto_despues_url)
            : undefined,
        };
        result.perfil = perfil;
      }
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

      const snapshots: HistorialCapilarSnapshot[] = items.map((i) => ({
        id: String(i.id ?? i._id ?? ""),
        client_profile_id: String(i.client_profile_id ?? ""),
        fecha_snapshot: String(i.fecha_snapshot ?? ""),
        score_general: Number(i.score_general ?? 0),
        tendencia: String(i.tendencia ?? ""),
        servicio_aplicado: String(i.servicio_aplicado ?? ""),
      }));

      // Sort descending by fecha_snapshot
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

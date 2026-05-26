import { NextResponse } from "next/server";
import type { IQClienteSummary } from "@/lib/iq-types";

const BASE44_BASE =
  "https://cavaliss-spa-capilar.base44.app/api/apps/69bcfa4ccfa83545153ba491";
const BASE44_TOKEN = "71cf179e00514bbda1ab089a5729c4b9";

function parseItems(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown> | null;
  if (j && Array.isArray(j.data)) return j.data as Record<string, unknown>[];
  if (j && Array.isArray(j.items)) return j.items as Record<string, unknown>[];
  return [];
}

export async function GET() {
  const result: IQClienteSummary[] = [];

  try {
    const res = await fetch(`${BASE44_BASE}/entities/PerfilCapilarV2`, {
      headers: { Authorization: `Bearer ${BASE44_TOKEN}` },
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const json: unknown = await res.json();
      const items = parseItems(json);

      const clientes: IQClienteSummary[] = items.map((i) => ({
        id: String(i.id ?? i._id ?? ""),
        client_profile_id: String(i.client_profile_id ?? ""),
        nombre: String(
          i.nombre ??
            i.name ??
            i.client_name ??
            i.client_profile_id ??
            "Sin nombre"
        ),
        score_general_capilar: Number(i.score_general_capilar ?? 0),
        riesgo_abandono: String(i.riesgo_abandono ?? ""),
        objetivo_capilar: String(i.objetivo_capilar ?? ""),
        tendencia: String(i.tendencia ?? ""),
        fecha_ultimo_diagnostico: String(i.fecha_ultimo_diagnostico ?? ""),
      }));

      // Ordered by score ascending (worst first)
      clientes.sort((a, b) => a.score_general_capilar - b.score_general_capilar);
      result.push(...clientes);
    }
  } catch (e) {
    console.error("[iq/clientes]", e);
  }

  return NextResponse.json(result);
}

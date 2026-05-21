import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";
import type { Client, ClientSegment, ServiceName } from "@/lib/types";

// Exact columns: ID_Cliente, Nombre, Telefono, Email, Primera_Visita,
// Ultima_Visita, Total_Visitas, Servicio_Favorito, Gasto_Total,
// Segmento, Canal_Origen, Etiqueta_WATI
// fetchSheet returns keys in lowercase with underscores preserved.

function deriveSegment(gasto: number, visitas: number): ClientSegment {
  if (gasto >= 5000) return "VIP";
  if (visitas >= 2) return "Regular";
  return "Nueva";
}

export async function GET() {
  try {
    const rows = await fetchSheet("Clientes");

    if (!rows.length) {
      return NextResponse.json([], { headers: { "X-Data-Source": "sheets-empty" } });
    }

    const clients: Client[] = rows
      .filter(r => r.nombre)
      .map((r, i) => {
        const gasto = Number(r.gasto_total ?? 0) || 0;
        const visitas = Number(r.total_visitas ?? 0) || 0;
        const segmento = (r.segmento as ClientSegment) || deriveSegment(gasto, visitas);

        return {
          id: Number(r.id_cliente ?? i + 1) || i + 1,
          name: r.nombre ?? `Clienta ${i + 1}`,
          phone: r.telefono ?? "",
          email: r.email ?? "",
          lastService: (r.servicio_favorito as ServiceName) ?? "Diagnóstico Capilar",
          lastVisit: r.ultima_visita ?? r.primera_visita ?? "",
          nextAppointment: undefined,
          totalValue: gasto,
          segment: segmento,
          visits: visitas,
        };
      });

    return NextResponse.json(clients, { headers: { "X-Data-Source": "sheets" } });
  } catch (err) {
    console.error("[/api/clientes]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

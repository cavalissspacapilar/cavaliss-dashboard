import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";
import type { Client, ClientSegment, ServiceName } from "@/lib/types";

// Exact columns: ID_Cliente, Nombre, Telefono, Email, Primera_Visita,
// Ultima_Visita, Total_Visitas, Servicio_Favorito, Gasto_Total,
// Segmento, Canal_Origen, Etiqueta_WATI

const VALID_SERVICES: ServiceName[] = [
  "Diagnóstico Capilar", "Exfoliación Capilar", "Nutrición Capilar",
  "Ritual Detox", "Reconstrucción Molecular", "Luminoplastia",
  "VIP Curly Experience", "Electroestimulación", "Mesoterapia con Exosomas",
];

function normalizeSegment(raw: string, gasto: number, visitas: number): ClientSegment {
  const lower = raw.trim().toLowerCase();
  if (lower === "vip") return "VIP";
  if (lower === "regular") return "Regular";
  if (lower === "nueva" || lower === "nuevo") return "Nueva";
  // Derive from spend/visits if not explicitly set
  if (gasto >= 5000) return "VIP";
  if (visitas >= 2) return "Regular";
  return "Nueva";
}

function normalizeService(raw: string): ServiceName {
  const match = VALID_SERVICES.find(s =>
    s.toLowerCase() === raw.trim().toLowerCase()
  );
  return match ?? "Diagnóstico Capilar";
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
        const gasto = parseFloat(r.gasto_total ?? "0") || 0;
        const visitas = parseInt(r.total_visitas ?? "0", 10) || 0;
        const segment = normalizeSegment(r.segmento ?? "", gasto, visitas);
        const lastVisit = r.ultima_visita || r.primera_visita || "2020-01-01";

        return {
          id: parseInt(r.id_cliente ?? String(i + 1), 10) || i + 1,
          name: r.nombre,
          phone: r.telefono ?? "",
          email: r.email ?? "",
          lastService: normalizeService(r.servicio_favorito ?? ""),
          lastVisit,
          nextAppointment: undefined,
          totalValue: gasto,
          segment,
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

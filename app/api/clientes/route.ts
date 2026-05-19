import { NextResponse } from "next/server";
import { CLIENTS } from "@/lib/data";
import { fetchSheet } from "@/lib/sheets";
import type { Client, ClientSegment, ServiceName } from "@/lib/types";

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const val = row[k] ?? row[k.toLowerCase()] ?? "";
    if (val) return val;
  }
  return "";
}

function segment(totalValue: number, visits: number): ClientSegment {
  if (totalValue >= 5000) return "VIP";
  if (visits >= 2) return "Regular";
  return "Nueva";
}

export async function GET() {
  try {
    const rows = await fetchSheet("Clientes");

    const clients: Client[] = rows.map((row, i) => {
      const total = Number(pick(row, "valor total", "total", "valor_total", "totalvalue") || 0);
      const visits = Number(pick(row, "visitas", "visits", "total visitas") || 1);
      return {
        id: i + 1,
        name: pick(row, "nombre", "name", "cliente", "clienta") || `Clienta ${i + 1}`,
        phone: pick(row, "teléfono", "telefono", "phone", "tel"),
        email: pick(row, "email", "correo"),
        lastService: (pick(row, "último servicio", "ultimo servicio", "servicio", "service") || "Diagnóstico Capilar") as ServiceName,
        lastVisit: pick(row, "última visita", "ultima visita", "fecha visita", "last visit") || new Date().toISOString().split("T")[0],
        nextAppointment: pick(row, "próxima cita", "proxima cita", "next appointment") || undefined,
        totalValue: total,
        segment: (pick(row, "segmento", "segment") as ClientSegment) || segment(total, visits),
        visits,
      };
    });

    return NextResponse.json(clients.length ? clients : CLIENTS);
  } catch (err) {
    console.error("[/api/clientes] fallback:", err);
    return NextResponse.json(CLIENTS);
  }
}

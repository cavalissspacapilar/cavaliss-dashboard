import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";

interface StatsResponse {
  citasBadge: number;
  leadsBadge: number;
  cavaBadge: number;
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const todayMX = today.split("-").reverse().join("/");
  const result: StatsResponse = { citasBadge: 0, leadsBadge: 0, cavaBadge: 0 };

  // Badge 1: Citas today from Base44 (non-cancelled)
  try {
    const res = await fetch(`${process.env.BASE44_API_URL}/Appointment`, {
      headers: { api_key: process.env.BASE44_API_KEY! },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items: Record<string, unknown>[] = Array.isArray(json) ? json
        : Array.isArray(json?.data) ? json.data
        : Array.isArray(json?.items) ? json.items : [];
      result.citasBadge = items.filter(a => {
        const date = String(a.date ?? a.fecha ?? a.Date ?? a.appointment_date ?? "");
        const status = String(a.status ?? a.estado ?? "").toLowerCase();
        return (date === today || date.startsWith(today)) && !status.includes("cancel");
      }).length;
    }
  } catch {}

  // Badge 2: Leads with Estado="Nuevo" from Sheets (skip empty rows)
  try {
    const rows = await fetchSheet("Leads");
    result.leadsBadge = rows.filter(r =>
      (r.telefono || r.nombre || "").trim().length > 0 &&
      (r.estado ?? "").toLowerCase() === "nuevo"
    ).length;
  } catch {}

  // Badge 3: Unique phones with Fecha=today in Conversaciones
  try {
    const rows = await fetchSheet("Conversaciones");
    const phones = new Set(
      rows
        .filter(r => {
          const f = r.fecha ?? "";
          return r.telefono && (f === today || f === todayMX || f.startsWith(today));
        })
        .map(r => r.telefono)
    );
    result.cavaBadge = phones.size;
  } catch {}

  return NextResponse.json(result);
}

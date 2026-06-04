import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { Client, ClientSegment, ServiceName } from "@/lib/types";

// Base44 getClientsForDashboard response shape
interface Base44Client {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  last_visit_date?: string | null;
  visit_count?: number;
  total_spent?: number;
  loyalty_tier?: string;
  estado_crm?: string;
  created_date?: string;
}

function normalizeSegment(tier: string, spent: number, visits: number): ClientSegment {
  const t = (tier ?? "").toLowerCase();
  if (t === "vip") return "VIP";
  if (t === "premium" || t === "regular") return "Regular";
  if (spent >= 5000) return "VIP";
  if (visits >= 2) return "Regular";
  return "Nueva";
}

export async function GET() {
  try {
    const data = await fetchBase44Function('getClientsForDashboard');
    const raw: Base44Client[] = data.clients ?? [];

    const clients: Client[] = raw.map((c, i) => {
      const visits = c.visit_count ?? 0;
      const spent = c.total_spent ?? 0;
      const lastVisit =
        c.last_visit_date ??
        (c.created_date ? c.created_date.split("T")[0] : "2020-01-01");

      return {
        id: i + 1,
        name: c.name ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        lastService: "Diagnóstico Capilar" as ServiceName,
        lastVisit,
        nextAppointment: undefined,
        totalValue: spent,
        segment: normalizeSegment(c.loyalty_tier ?? "", spent, visits),
        visits,
      };
    });

    return NextResponse.json(clients, { headers: { "X-Data-Source": "base44" } });
  } catch (err) {
    console.error("[/api/clientes]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

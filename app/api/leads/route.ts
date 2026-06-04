import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";
import type { Lead, LeadStatus, LeadSource, LeadTemperature, ServiceName } from "@/lib/types";

// Base44 getLeadsForDashboard response shape
interface Base44Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  problem?: string;
  urgency?: string;
  conversion_status?: string;
  lead_score?: number;
  created_date?: string;
  description?: string | null;
}

function mapStatus(s: string): LeadStatus {
  const v = (s ?? "").toLowerCase();
  if (v.includes("convert")) return "Convertido";
  if (v.includes("reserva")) return "Reserva lista";
  if (v.includes("contactado") || v.includes("conversacion") || v.includes("conversación")) return "En conversación";
  if (v.includes("perdido")) return "Perdido";
  if (v.includes("caliente")) return "Lead caliente";
  return "Nuevo";
}

function mapTemperature(urgency: string): LeadTemperature {
  const v = (urgency ?? "").toLowerCase();
  if (v.includes("muy_urgente") || v.includes("urgente")) return "caliente";
  if (v.includes("explorando")) return "frío";
  return "tibio";
}

function mapService(problem: string): ServiceName {
  const v = (problem ?? "").toLowerCase();
  if (v.includes("caida")) return "Mesoterapia con Exosomas";
  if (v.includes("dano") || v.includes("daño") || v.includes("quimico") || v.includes("químico")) return "Reconstrucción Molecular";
  if (v.includes("frizz")) return "Ritual Detox";
  if (v.includes("resequedad")) return "Nutrición Capilar";
  if (v.includes("brillo")) return "Luminoplastia";
  return "Diagnóstico Capilar";
}

function daysAgo(dateStr?: string): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

export async function GET() {
  try {
    const data = await fetchBase44Function('getLeadsForDashboard');
    const raw: Base44Lead[] = data.leads ?? [];

    const leads: Lead[] = raw.map((l, i) => {
      const status = mapStatus(l.conversion_status ?? "");
      const temperature = mapTemperature(l.urgency ?? "");

      return {
        id: i + 1,
        name: l.name ?? "",
        phone: l.phone ?? "",
        email: l.email ?? undefined,
        serviceInterest: mapService(l.problem ?? ""),
        source: "WhatsApp directo" as LeadSource,
        status,
        temperature,
        daysInPipeline: daysAgo(l.created_date),
        lastMessage: l.problem ?? "",
        lastMessageTime: l.created_date ? l.created_date.split("T")[0] : "",
        estimatedValue: 0,
        leadId: l.id,
        entryDate: l.created_date ? l.created_date.split("T")[0] : undefined,
      };
    });

    return NextResponse.json(leads, { headers: { "X-Data-Source": "base44" } });
  } catch (err) {
    console.error("[/api/leads]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

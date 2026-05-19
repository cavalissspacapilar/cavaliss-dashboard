import { NextResponse } from "next/server";
import { LEADS } from "@/lib/data";
import { fetchSheet } from "@/lib/sheets";
import type { Lead, LeadStatus, LeadSource, LeadTemperature, ServiceName } from "@/lib/types";

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k]) return row[k];
  }
  return "";
}

function normalizeStatus(s: string): LeadStatus {
  const v = s.toLowerCase();
  if (v.includes("nuevo") || v.includes("new")) return "Nuevo";
  if (v.includes("caliente") || v.includes("hot")) return "Lead caliente";
  if (v.includes("reserva") || v.includes("ready")) return "Reserva lista";
  if (v.includes("convert")) return "Convertido";
  if (v.includes("perdido") || v.includes("lost")) return "Perdido";
  return "En conversación";
}

function normalizeSource(s: string): LeadSource {
  const v = s.toLowerCase();
  if (v.includes("meta") || v.includes("facebook") || v.includes("fb")) return "Meta Ads";
  if (v.includes("tiktok") || v.includes("tik tok")) return "TikTok";
  if (v.includes("instagram") || v.includes("ig")) return "Instagram";
  return "WhatsApp directo";
}

function normalizeTemp(s: string): LeadTemperature {
  const v = s.toLowerCase();
  if (v.includes("caliente") || v.includes("hot") || v === "🔥") return "caliente";
  if (v.includes("frío") || v.includes("frio") || v.includes("cold") || v === "❄️") return "frío";
  return "tibio";
}

export async function GET() {
  try {
    const rows = await fetchSheet("Leads");

    const leads: Lead[] = rows.map((row, i) => {
      const statusRaw = pick(row, "estado", "status", "etapa", "stage");
      const sourceRaw = pick(row, "fuente", "source", "origen");
      const tempRaw = pick(row, "temperatura", "temperature", "temp");
      const value = Number(pick(row, "valor", "value", "precio estimado", "monto") || 0);
      return {
        id: i + 1,
        name: pick(row, "nombre", "name", "lead") || `Lead ${i + 1}`,
        phone: pick(row, "teléfono", "telefono", "phone", "tel"),
        serviceInterest: (pick(row, "servicio", "service", "interés", "interes") || "Diagnóstico Capilar") as ServiceName,
        source: normalizeSource(sourceRaw),
        status: normalizeStatus(statusRaw),
        temperature: normalizeTemp(tempRaw),
        daysInPipeline: Number(pick(row, "días", "dias", "days") || 0),
        lastMessage: pick(row, "último mensaje", "ultimo mensaje", "mensaje", "message") || "Sin mensajes",
        lastMessageTime: pick(row, "fecha mensaje", "time", "fecha") || "reciente",
        estimatedValue: value,
      };
    });

    return NextResponse.json(leads.length ? leads : LEADS);
  } catch (err) {
    console.error("[/api/leads] fallback:", err);
    return NextResponse.json(LEADS);
  }
}

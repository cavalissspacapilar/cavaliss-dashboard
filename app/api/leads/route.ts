import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";
import type { Lead, LeadStatus, LeadSource, LeadTemperature, ServiceName } from "@/lib/types";

// Exact columns: Nombre, telefono, Fuente, UTM, Fecha_Entrada, Estado,
// Fecha_Conversion, Campana, Conjunto_Anuncios, Anuncio, Email, ID_Lead

function normalizeStatus(s: string): LeadStatus {
  const v = s.toLowerCase().trim();
  if (v.includes("nuevo") || v === "") return "Nuevo";
  if (v.includes("caliente") || v.includes("hot")) return "Lead caliente";
  if (v.includes("reserva") || v.includes("listo") || v.includes("lista")) return "Reserva lista";
  if (v.includes("convert")) return "Convertido";
  if (v.includes("perdido") || v.includes("lost") || v.includes("no")) return "Perdido";
  return "En conversación";
}

function normalizeSource(s: string): LeadSource {
  const v = s.toLowerCase().trim();
  if (v.includes("meta") || v.includes("facebook") || v.includes("fb")) return "Meta Ads";
  if (v.includes("tiktok") || v.includes("tik")) return "TikTok";
  if (v.includes("instagram") || v.includes("ig")) return "Instagram";
  return "WhatsApp directo";
}

function daysFromDate(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const rows = await fetchSheet("Leads");

    if (!rows.length) {
      return NextResponse.json([], { headers: { "X-Data-Source": "sheets-empty" } });
    }

    const leads: Lead[] = rows
      .filter(r => r.nombre)
      .map((r, i) => ({
        id: Number(r.id_lead ?? i + 1) || i + 1,
        name: r.nombre ?? `Lead ${i + 1}`,
        phone: r.telefono ?? "",
        serviceInterest: "Diagnóstico Capilar" as ServiceName,
        source: normalizeSource(r.fuente ?? ""),
        status: normalizeStatus(r.estado ?? ""),
        temperature: "tibio" as LeadTemperature,
        daysInPipeline: daysFromDate(r.fecha_entrada),
        lastMessage: r.utm ?? r.campana ?? "",
        lastMessageTime: r.fecha_entrada ?? "",
        estimatedValue: 0,
      }));

    return NextResponse.json(leads, { headers: { "X-Data-Source": "sheets" } });
  } catch (err) {
    console.error("[/api/leads]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

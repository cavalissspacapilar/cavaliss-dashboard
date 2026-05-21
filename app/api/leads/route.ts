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
  if (v.includes("perdido") || v.includes("lost")) return "Perdido";
  return "En conversación";
}

function normalizeSource(s: string): LeadSource {
  const v = s.toLowerCase().trim();
  if (v.includes("meta") || v.includes("facebook") || v.includes("fb")) return "Meta Ads";
  if (v.includes("tiktok") || v.includes("tik")) return "TikTok";
  if (v.includes("instagram") || v.includes("ig")) return "Instagram";
  return "WhatsApp directo";
}

function deriveTemperature(status: LeadStatus): LeadTemperature {
  if (status === "Lead caliente") return "caliente";
  if (status === "Perdido") return "frío";
  return "tibio";
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

function looksLikePhone(s: string): boolean {
  const digits = s.replace(/[\s+\-()]/g, "");
  return digits.length > 8 && /^\d+$/.test(digits);
}

export async function GET() {
  try {
    const rows = await fetchSheet("Leads");

    if (!rows.length) {
      return NextResponse.json([], { headers: { "X-Data-Source": "sheets-empty" } });
    }

    const leads: Lead[] = rows
      .filter(r => r.nombre || r.telefono)
      .map((r, i) => {
        // Swap if Sheets columns are inverted (nombre contains the phone number)
        let nombre   = r.nombre   ?? "";
        let telefono = r.telefono ?? "";
        if (looksLikePhone(nombre)) {
          [nombre, telefono] = [telefono, nombre];
        }

        const status = normalizeStatus(r.estado ?? "");
        const source = normalizeSource(r.fuente ?? "");
        const temperature = deriveTemperature(status);
        const entryDate = r.fecha_entrada || undefined;

        return {
          id: parseInt(r.id_lead ?? String(i + 1), 10) || i + 1,
          name: nombre,
          phone: telefono,
          email: r.email || undefined,
          serviceInterest: "Diagnóstico Capilar" as ServiceName,
          source,
          status,
          temperature,
          daysInPipeline: daysFromDate(r.fecha_entrada),
          lastMessage: r.campana ?? r.utm ?? "",
          lastMessageTime: entryDate ?? "",
          estimatedValue: 0,
          // Extended fields
          leadId: r.id_lead || undefined,
          entryDate,
          conversionDate: r.fecha_conversion || undefined,
          utmSource: r.utm || undefined,
          campaign: r.campana || undefined,
          adSet: r.conjunto_anuncios || undefined,
          ad: r.anuncio || undefined,
        };
      });

    return NextResponse.json(leads, { headers: { "X-Data-Source": "sheets" } });
  } catch (err) {
    console.error("[/api/leads]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

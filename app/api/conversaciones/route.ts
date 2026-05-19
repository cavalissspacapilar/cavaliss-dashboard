import { NextResponse } from "next/server";
import { CAVA_CONVERSATIONS } from "@/lib/data";
import { fetchSheet } from "@/lib/sheets";
import type { CavaConversation, ServiceName } from "@/lib/types";

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k]) return row[k];
  }
  return "";
}

export async function GET() {
  try {
    const rows = await fetchSheet("Conversaciones");

    const convs: CavaConversation[] = rows.map((row, i) => {
      const statusRaw = pick(row, "estado", "status").toLowerCase();
      const status: CavaConversation["status"] =
        statusRaw.includes("resuelta") || statusRaw.includes("resolved") ? "resuelta"
        : statusRaw.includes("esper") || statusRaw.includes("wait") ? "esperando"
        : "activa";

      return {
        id: i + 1,
        name: pick(row, "nombre", "name", "lead") || `Lead ${i + 1}`,
        phone: pick(row, "teléfono", "telefono", "phone"),
        lastMessage: pick(row, "último mensaje", "mensaje", "message") || "...",
        lastMessageTime: pick(row, "tiempo", "time", "fecha") || "reciente",
        serviceInterest: (pick(row, "servicio", "service") || "Diagnóstico Capilar") as ServiceName,
        status,
        isTyping: false,
        messagesCount: Number(pick(row, "mensajes", "messages", "total mensajes") || 0),
        responseTime: Number(pick(row, "tiempo respuesta", "response time") || 45),
      };
    });

    return NextResponse.json(convs.length ? convs : CAVA_CONVERSATIONS);
  } catch (err) {
    console.error("[/api/conversaciones] fallback:", err);
    return NextResponse.json(CAVA_CONVERSATIONS);
  }
}

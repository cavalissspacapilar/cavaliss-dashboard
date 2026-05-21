import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";
import type { CavaConversation, ServiceName } from "@/lib/types";

// Exact columns: Fecha, Hora, Telefono, Nombre, Mensaje_Cliente,
// Respuesta_Cava, Servicio_Interes, Lead_Caliente, Seguimiento, operador_activo

export async function GET() {
  try {
    const rows = await fetchSheet("Conversaciones");

    if (!rows.length) {
      return NextResponse.json([], { headers: { "X-Data-Source": "sheets-empty" } });
    }

    const convs: CavaConversation[] = rows
      .filter(r => r.nombre || r.telefono)
      .map((r, i) => {
        const operadorActivo = (r.operador_activo ?? "").toLowerCase();
        const isAgentActive = operadorActivo === "true" || operadorActivo === "1" || operadorActivo === "sí" || operadorActivo === "si";

        const status: CavaConversation["status"] =
          isAgentActive ? "activa"
          : (r.seguimiento ?? "").toLowerCase().includes("resuel") ? "resuelta"
          : "esperando";

        const timeLabel = r.hora
          ? `${r.fecha ?? ""} ${r.hora}`.trim()
          : r.fecha ?? "reciente";

        return {
          id: i + 1,
          name: r.nombre ?? `Lead ${i + 1}`,
          phone: r.telefono ?? "",
          lastMessage: r.mensaje_cliente ?? "",
          lastMessageTime: timeLabel,
          serviceInterest: (r.servicio_interes as ServiceName) ?? "Diagnóstico Capilar",
          status,
          isTyping: false,
          messagesCount: 0,
          responseTime: 0,
        };
      });

    return NextResponse.json(convs, { headers: { "X-Data-Source": "sheets" } });
  } catch (err) {
    console.error("[/api/conversaciones]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

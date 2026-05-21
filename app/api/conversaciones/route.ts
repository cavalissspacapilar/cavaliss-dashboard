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

    const today = new Date().toISOString().split("T")[0];
    const todayMX = today.split("-").reverse().join("/");

    // Group rows by phone number (1 phone = 1 conversation)
    const byPhone = new Map<string, typeof rows[number][]>();
    for (const r of rows.filter(r => r.nombre || r.telefono)) {
      const key = r.telefono || r.nombre || `anon_${Math.random()}`;
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key)!.push(r);
    }

    const convs: CavaConversation[] = Array.from(byPhone.entries())
      .map(([phone, msgs], idx) => {
        // Sort messages by fecha+hora descending (most recent first)
        const sorted = [...msgs].sort((a, b) => {
          const da = `${a.fecha ?? ""}T${a.hora ?? "00:00"}`;
          const db = `${b.fecha ?? ""}T${b.hora ?? "00:00"}`;
          return db.localeCompare(da);
        });

        const latest = sorted[0];
        const isHot = msgs.some(m => (m.lead_caliente ?? "").toLowerCase() === "true");
        const isResolved = msgs.some(m =>
          (m.seguimiento ?? "").toLowerCase().includes("resuel")
        );
        const operadorActivo = (latest.operador_activo ?? "").toLowerCase();
        const isAgentActive = ["true", "1", "sí", "si"].includes(operadorActivo);

        const latestFecha = latest.fecha ?? "";
        const isToday = latestFecha === today || latestFecha === todayMX || latestFecha.startsWith(today);

        const status: CavaConversation["status"] = isResolved
          ? "resuelta"
          : isAgentActive || isToday
          ? "activa"
          : "esperando";

        const timeLabel = latest.hora
          ? `${latest.fecha ?? ""} ${latest.hora}`.trim()
          : latest.fecha ?? "reciente";

        return {
          id: idx + 1,
          name: latest.nombre ?? `Lead ${idx + 1}`,
          phone,
          lastMessage: latest.mensaje_cliente ?? "",
          lastResponseCava: latest.respuesta_cava ?? "",
          lastMessageTime: timeLabel,
          serviceInterest: (latest.servicio_interes as ServiceName) ?? "Diagnóstico Capilar",
          status,
          isHot,
          isTyping: false,
          messagesCount: msgs.length,
          responseTime: 0,
        };
      })
      // Most recent conversations first
      .sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime));

    return NextResponse.json(convs, { headers: { "X-Data-Source": "sheets" } });
  } catch (err) {
    console.error("[/api/conversaciones]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

import { NextResponse } from "next/server";
import type { CavaConversation, ServiceName } from "@/lib/types";

interface Base44Conv {
  id?: string;
  client_name?: string;
  client_phone?: string;
  mensaje_content?: string;
  respuesta_cava?: string;
  timestamp_enviado?: string;
  servicio_interes?: string;
  status?: string;
  lead_caliente?: boolean;
  mensajes_count?: number;
}

function mapStatus(s: string): CavaConversation["status"] {
  const v = (s ?? "").toLowerCase();
  if (v.includes("resuel")) return "resuelta";
  if (v.includes("activ")) return "activa";
  return "esperando";
}

export async function GET() {
  try {
    const res = await fetch(`${process.env.BASE44_API_URL}/ConversacionWhatsApp`, {
      headers: { api_key: process.env.BASE44_API_KEY! },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Base44 ${res.status}`);

    const json: unknown = await res.json();
    const items: Base44Conv[] = Array.isArray(json) ? json
      : Array.isArray((json as Record<string, unknown>)?.data) ? (json as Record<string, unknown[]>).data as Base44Conv[]
      : [];

    const convs: CavaConversation[] = items.map((c, i) => ({
      id: i + 1,
      name: c.client_name ?? `Contacto ${i + 1}`,
      phone: c.client_phone ?? "",
      lastMessage: c.mensaje_content ?? "",
      lastResponseCava: c.respuesta_cava ?? "",
      lastMessageTime: c.timestamp_enviado ?? "",
      serviceInterest: (c.servicio_interes as ServiceName) ?? "Diagnóstico Capilar",
      status: mapStatus(c.status ?? ""),
      isHot: c.lead_caliente === true,
      isTyping: false,
      messagesCount: c.mensajes_count ?? 1,
      responseTime: 0,
    }));

    return NextResponse.json(convs, { headers: { "X-Data-Source": "base44" } });
  } catch (err) {
    console.error("[/api/conversaciones]", err);
    return NextResponse.json([], { status: 200, headers: { "X-Data-Source": "error" } });
  }
}

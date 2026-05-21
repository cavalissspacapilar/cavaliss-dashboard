import { NextResponse } from "next/server";
import type { Appointment, AppointmentStatus, ServiceName } from "@/lib/types";

const SERVICE_NAMES: ServiceName[] = [
  "Diagnóstico Capilar", "Exfoliación Capilar", "Nutrición Capilar",
  "Ritual Detox", "Reconstrucción Molecular", "Luminoplastia",
  "VIP Curly Experience", "Electroestimulación", "Mesoterapia con Exosomas",
];

function normalizeStatus(s: string): AppointmentStatus {
  const v = s.toLowerCase();
  if (v.includes("confirm")) return "confirmada";
  if (v.includes("complet") || v.includes("done") || v.includes("finish")) return "completada";
  if (v.includes("cancel")) return "cancelada";
  return "pendiente";
}

function normalizeService(s: string): ServiceName {
  const match = SERVICE_NAMES.find(n =>
    n.toLowerCase().includes(s.toLowerCase()) ||
    s.toLowerCase().includes(n.toLowerCase().split(" ")[0])
  );
  return match ?? "Diagnóstico Capilar";
}

function transform(item: Record<string, unknown>, idx: number): Appointment {
  const date = String(item.date ?? item.fecha ?? item.Date ?? item.appointment_date ?? new Date().toISOString().split("T")[0]);
  const time = String(item.time ?? item.hora ?? item.Time ?? item.start_time ?? "09:00").slice(0, 5);
  const service = String(item.service ?? item.servicio ?? item.Service ?? item.treatment ?? "Diagnóstico Capilar");
  const client = String(item.clientName ?? item.client_name ?? item.cliente ?? item.name ?? item.Name ?? "Clienta");
  const status = String(item.status ?? item.estado ?? item.Status ?? "pendiente");
  const price = Number(item.price ?? item.precio ?? item.amount ?? item.Price ?? 0);
  const deposit = Number(item.depositAmount ?? item.anticipo ?? item.deposit ?? 0);

  return {
    id: Number(item._id ?? item.id ?? idx + 1),
    clientName: client,
    service: normalizeService(service),
    time,
    duration: Number(item.duration ?? item.duracion ?? 60),
    status: normalizeStatus(status),
    depositPaid: deposit > 0 || Boolean(item.depositPaid ?? item.anticipo_pagado),
    depositAmount: deposit,
    price,
    date,
    clientPhone: String(item.clientPhone ?? item.phone ?? item.telefono ?? ""),
    notes: item.notes ? String(item.notes) : undefined,
  };
}

export async function GET() {
  try {
    const url = `${process.env.BASE44_API_URL}/Appointment`;
    const res = await fetch(url, {
      headers: { api_key: process.env.BASE44_API_KEY! },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Base44 ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const items: Record<string, unknown>[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data) ? json.data
      : Array.isArray(json?.items) ? json.items
      : [];

    const appointments = items.map(transform);
    return NextResponse.json(appointments, { headers: { "X-Data-Source": "base44" } });
  } catch (err) {
    console.error("[/api/citas]", err);
    // Return empty array — pages show "Sin citas registradas"
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

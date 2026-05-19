import { NextResponse } from "next/server";
import { APPOINTMENTS } from "@/lib/data";
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
    n.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(n.toLowerCase().split(" ")[0])
  );
  return match ?? "Diagnóstico Capilar";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transform(item: Record<string, any>, idx: number): Appointment {
  const raw = item as Record<string, unknown>;
  const dateVal = String(raw.date ?? raw.fecha ?? raw.Date ?? raw.appointment_date ?? new Date().toISOString().split("T")[0]);
  const timeVal = String(raw.time ?? raw.hora ?? raw.Time ?? raw.start_time ?? "09:00").slice(0, 5);
  const serviceRaw = String(raw.service ?? raw.servicio ?? raw.Service ?? raw.treatment ?? "Diagnóstico Capilar");
  const clientRaw = String(raw.clientName ?? raw.client_name ?? raw.cliente ?? raw.name ?? raw.Name ?? "Clienta");
  const statusRaw = String(raw.status ?? raw.estado ?? raw.Status ?? "pendiente");
  const price = Number(raw.price ?? raw.precio ?? raw.amount ?? raw.Price ?? 0);
  const deposit = Number(raw.depositAmount ?? raw.anticipo ?? raw.deposit ?? 0);

  return {
    id: Number(raw._id ?? raw.id ?? idx + 1),
    clientName: clientRaw,
    service: normalizeService(serviceRaw),
    time: timeVal,
    duration: Number(raw.duration ?? raw.duracion ?? 60),
    status: normalizeStatus(statusRaw),
    depositPaid: deposit > 0 || Boolean(raw.depositPaid ?? raw.anticipo_pagado),
    depositAmount: deposit,
    price,
    date: dateVal,
    clientPhone: String(raw.clientPhone ?? raw.phone ?? raw.telefono ?? ""),
    notes: raw.notes ? String(raw.notes) : undefined,
  };
}

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.BASE44_API_URL}/Appointment`,
      {
        headers: { api_key: process.env.BASE44_API_KEY! },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`Base44 ${res.status}`);

    const json = await res.json();
    const items: Record<string, unknown>[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.items)
      ? json.items
      : [];

    const appointments: Appointment[] = items.map(transform);
    return NextResponse.json(appointments);
  } catch (err) {
    console.error("[/api/citas] fallback:", err);
    return NextResponse.json(APPOINTMENTS);
  }
}

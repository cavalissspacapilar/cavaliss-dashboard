import { NextResponse } from "next/server";
import { findAndUpdateSheetRow } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { phone?: string; leadId?: string; newStatus?: string };
    const { phone, leadId, newStatus } = body;

    if (!newStatus) {
      return NextResponse.json({ error: "newStatus is required" }, { status: 400 });
    }

    // Prefer leadId lookup, fall back to phone
    let updated = false;
    if (leadId) {
      updated = await findAndUpdateSheetRow("Leads", "id_lead", leadId.trim(), "estado", newStatus);
    }
    if (!updated && phone) {
      updated = await findAndUpdateSheetRow("Leads", "telefono", phone.trim(), "estado", newStatus);
    }

    if (!updated) {
      return NextResponse.json({ error: "Row not found in sheet" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/leads/status]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

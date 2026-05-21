import { NextResponse } from "next/server";
import { findAndUpdateSheetRow } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { phone?: string };
    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const updated = await findAndUpdateSheetRow(
      "Conversaciones",
      "telefono",
      phone,
      "operador_activo",
      "true"
    );

    if (!updated) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/conversaciones/takeover]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

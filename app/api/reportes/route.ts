import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";
import type { SheetRow } from "@/lib/sheets";

export async function GET() {
  try {
    const rows = await fetchSheet("Reportes");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[/api/reportes] error:", err);
    return NextResponse.json([] as SheetRow[], { status: 500 });
  }
}

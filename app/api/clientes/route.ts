import { NextResponse } from "next/server";
import { fetchBase44Function } from "@/lib/base44-client";

export async function GET() {
  try {
    const data = await fetchBase44Function('getClientsForDashboard');
    return NextResponse.json(data.clients ?? [], { headers: { "X-Data-Source": "base44" } });
  } catch (err) {
    console.error("[/api/clientes]", err);
    return NextResponse.json([], {
      status: 200,
      headers: { "X-Data-Source": "error", "X-Error": String(err) },
    });
  }
}

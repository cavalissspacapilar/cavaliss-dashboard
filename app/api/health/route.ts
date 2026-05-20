import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/sheets";

export async function GET() {
  const env = {
    GOOGLE_SERVICE_ACCOUNT_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
    BASE44_API_KEY: !!process.env.BASE44_API_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
  };

  let sheetsTest: { ok: boolean; rowCount?: number; error?: string } | null = null;

  if (env.GOOGLE_SERVICE_ACCOUNT_KEY && env.GOOGLE_SHEETS_ID) {
    try {
      const rows = await fetchSheet("Clientes");
      sheetsTest = { ok: true, rowCount: rows.length };
    } catch (err) {
      sheetsTest = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  } else {
    sheetsTest = { ok: false, error: "Missing env vars — set GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEETS_ID in Vercel" };
  }

  return NextResponse.json({ env, sheetsTest });
}

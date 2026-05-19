export type SheetRow = Record<string, string>;

export async function fetchSheet(sheetName: string): Promise<SheetRow[]> {
  const id = process.env.GOOGLE_SHEETS_ID;
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`Sheets ${res.status} for tab "${sheetName}"`);

  const text = await res.text();

  // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStr = text.replace(/^[^{]*/, "").replace(/\s*\);\s*$/, "");
  const parsed = JSON.parse(jsonStr);

  if (parsed.status === "error") {
    throw new Error(`Sheets error: ${parsed.errors?.[0]?.detailed_message ?? "unknown"}`);
  }

  const cols: string[] = (parsed.table?.cols ?? []).map(
    (c: { label?: string; id?: string }) => (c.label?.trim() || c.id || "").toLowerCase()
  );

  const rows: SheetRow[] = (parsed.table?.rows ?? [])
    .filter((r: { c: unknown[] }) => r?.c?.some(Boolean))
    .map((r: { c: ({ v?: unknown } | null)[] }) => {
      const obj: SheetRow = {};
      r.c.forEach((cell, i) => {
        obj[cols[i]] = cell?.v != null ? String(cell.v) : "";
      });
      return obj;
    });

  return rows;
}

import { google } from "googleapis";

export type SheetRow = Record<string, string>;

function getAuth(write = false) {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const key = JSON.parse(keyJson) as { client_email: string; private_key: string };
  const privateKey = key.private_key.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: key.client_email,
    key: privateKey,
    scopes: write
      ? ["https://www.googleapis.com/auth/spreadsheets"]
      : ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export async function fetchSheet(sheetName: string): Promise<SheetRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID not set");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const values = res.data.values ?? [];
  if (values.length < 2) return [];

  const headers = (values[0] as string[]).map((h) => String(h ?? "").trim().toLowerCase());

  return (values.slice(1) as string[][])
    .filter((row) => row.some(Boolean))
    .map((row) => {
      const obj: SheetRow = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] != null ? String(row[i]) : "";
      });
      return obj;
    });
}

// Finds the last row where matchColLower === matchValue and updates updateColLower to updateValue.
export async function findAndUpdateSheetRow(
  sheetName: string,
  matchColLower: string,
  matchValue: string,
  updateColLower: string,
  updateValue: string
): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID not set");

  const auth = getAuth(true);
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const values = res.data.values ?? [];
  if (values.length < 2) return false;

  const headers = (values[0] as string[]).map((h) => String(h ?? "").trim().toLowerCase());
  const matchColIdx = headers.indexOf(matchColLower.toLowerCase());
  const updateColIdx = headers.indexOf(updateColLower.toLowerCase());

  if (matchColIdx === -1 || updateColIdx === -1) return false;

  // Scan from last row backwards to find the most recent match
  let targetRowNum = -1;
  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i] as string[];
    if ((row[matchColIdx] ?? "") === matchValue) {
      targetRowNum = i + 1; // 1-indexed sheet row (values[0] = row 1)
      break;
    }
  }

  if (targetRowNum === -1) return false;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!R${targetRowNum}C${updateColIdx + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[updateValue]] },
  });

  return true;
}

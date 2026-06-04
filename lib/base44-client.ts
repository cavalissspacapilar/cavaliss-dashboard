// Derives the functions base URL from BASE44_API_URL by swapping /entities → /functions
function getFunctionsBaseUrl() {
  const apiUrl = process.env.BASE44_API_URL ?? '';
  return apiUrl.replace(/\/entities$/, '');
}

export async function fetchBase44Function(functionName: string) {
  const base = getFunctionsBaseUrl();
  const url = `${base}/functions/${functionName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.BASE44_FUNCTIONS_KEY ?? process.env.BASE44_API_KEY ?? '',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Base44 function ${functionName} failed: ${res.status}`);
  return res.json();
}

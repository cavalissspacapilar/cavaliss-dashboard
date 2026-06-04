export async function fetchBase44Function(functionName: string) {
  const res = await fetch(
    `https://api.base44.com/api/apps/69bcfa4ccfa83545153ba491/functions/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BASE44_FUNCTIONS_KEY ?? '71cf179e00514bbda1ab089a5729c4b9'
      },
      body: JSON.stringify({})
    }
  );
  if (!res.ok) throw new Error(`Base44 function ${functionName} failed: ${res.status}`);
  return res.json();
}

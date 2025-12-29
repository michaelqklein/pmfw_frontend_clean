// src/app/api/save-mb-level-performance-data/route.js
export async function POST(req) {
  const backendUrl = process.env.SQL_PROXY_URL;

  const body = await req.json();
  const response = await fetch(`${backendUrl}/save-mb-level-performance-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
} 
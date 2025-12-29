// src/app/api/upsert-feature-access/route.js

export async function POST(req) {
    const backendUrl = process.env.SQL_PROXY_URL; // Make sure this is set in your .env file
  
    const body = await req.json();
  
    try {
      const response = await fetch(`${backendUrl}/api/upsert-feature-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Failed to upsert feature access:', error);
      return new Response(JSON.stringify({ error: 'Proxy server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
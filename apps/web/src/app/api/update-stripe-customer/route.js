// src/app/api/update-stripe-customer/route.js

export async function POST(req) {
    const backendUrl = process.env.SQL_PROXY_URL; // e.g., http://localhost:4000
  
    const body = await req.json();
  
    try {
      const response = await fetch(`${backendUrl}/update-stripe-customer`, {
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
      console.error('[Proxy Error] Failed to update Stripe customer:', error);
      return new Response(JSON.stringify({ error: 'Proxy server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
// src/app/api/cancel-subscription-immediatly/route.js

export async function POST(req) {
    const backendUrl = process.env.STRIPE_PROXY_URL;
  
    console.log('[Proxy] /api/cancel-subscription-immediatly accessed');
  
    try {
      const body = await req.json();
  
      console.log('[Proxy] Request body:', body);
  
      const response = await fetch(`${backendUrl}/api/cancel-subscription-immediatly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      console.log('[Proxy] Response from backend:', data);
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Immediate cancellation failed:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy error while cancelling subscription immediately',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
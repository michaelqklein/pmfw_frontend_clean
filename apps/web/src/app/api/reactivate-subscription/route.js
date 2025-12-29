// src/app/api/reactivate-subscription/route.js

export async function POST(req) {
    const backendUrl = process.env.STRIPE_PROXY_URL;
  
    console.log('[Proxy] /api/reactivate-subscription accessed');
  
    try {
      const body = await req.json();
  
      console.log('[Proxy] Request body:', body);
  
      const response = await fetch(`${backendUrl}/api/reactivate-subscription`, {
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
      console.error('[Proxy Error] Reactivation failed:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy error while reactivating subscription',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
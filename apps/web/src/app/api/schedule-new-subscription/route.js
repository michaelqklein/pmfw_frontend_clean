// src/app/api/schedule-new-subscription/route.js

export async function POST(req) {
    const backendUrl = process.env.STRIPE_PROXY_URL;
  
    console.log('[Proxy] /api/schedule-new-subscription accessed');
  
    try {
      const body = await req.json();
  
      console.log('[Proxy] Request body:', body);
  
      const response = await fetch(`${backendUrl}/api/schedule-new-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      console.log('[Proxy] Response from Stripe server:', data);
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Failed to schedule new subscription:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy server error while scheduling subscription',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
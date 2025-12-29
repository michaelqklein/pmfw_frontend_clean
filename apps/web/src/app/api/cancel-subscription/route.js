// src/app/api/cancel-subscription/route.js

export async function POST(req) {
    const backendUrl = process.env.STRIPE_PROXY_URL; // Make sure this is defined in your .env file
  
    const body = await req.json();
    console.log('[Proxy] /api/cancel-subscription accessed with body:', body);
  
    try {
      const response = await fetch(`${backendUrl}/api/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      console.log('[Proxy] Cancel-subscription response:', data);
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Failed to cancel subscription:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy server error when cancelling subscription',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
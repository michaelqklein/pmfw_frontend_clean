// src/app/api/products/route.js

export async function GET() {
    const backendUrl = process.env.STRIPE_PROXY_URL; // Should be set in your .env file
  
    console.log('[Proxy] /api/products accessed');
  
    try {
      const response = await fetch(`${backendUrl}/api/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
      console.log('[Proxy] Products data received:', data);
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Failed to fetch products:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy server error when fetching products',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
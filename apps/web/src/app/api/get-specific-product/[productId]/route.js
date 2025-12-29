// pmfw_next_frontend/src/app/api/get-specific-product/[productId]/route.js

export async function GET(request, context) {
  console.log("STRIPE_PROXY_URL: ", process.env.STRIPE_PROXY_URL);
  const { productId } = context.params;
  
    try {
        const backendUrl = process.env.STRIPE_PROXY_URL;
        if (!backendUrl) {
            throw new Error('STRIPE_PROXY_URL is not defined');
        }
      const response = await fetch(`${backendUrl}/api/get-specific-product/${productId}`, {
        method: 'GET',
      });
  
      const data = await response.json();
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Proxy failed to fetch product' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
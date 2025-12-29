export async function POST(request) {
    console.log('[Proxy] /api/validate-coupon accessed');
    
    try {
      const backendUrl = process.env.STRIPE_PROXY_URL;
      if (!backendUrl) {
        throw new Error('STRIPE_PROXY_URL is not defined');
      }
  
      const body = await request.json();
      console.log('Proxy received body (validate-coupon):', body);
  
      // Forward to backend
      const response = await fetch(`${backendUrl}/api/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Proxy response from backend (validate-coupon):', data);
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Proxy error (validate-coupon):', error.message);
      return new Response(
        JSON.stringify({ error: `Proxy failed: ${error.message}` }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
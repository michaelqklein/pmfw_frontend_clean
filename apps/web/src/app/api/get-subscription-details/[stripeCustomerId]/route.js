// src/app/api/get-subscription-details/[stripeCustomerId]/route.js

export async function GET(req, { params }) {
    const backendUrl = process.env.STRIPE_PROXY_URL;
    const { stripeCustomerId } = params;
  
    console.log(`[Proxy] /api/get-subscription-details/${stripeCustomerId} accessed`);
  
    try {
      const response = await fetch(`${backendUrl}/api/getSubscriptionDetails/${stripeCustomerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
  
      console.log('[Proxy] Subscription data received:', data);
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Proxy Error] Failed to fetch subscription details:', error);
  
      return new Response(
        JSON.stringify({
          error: 'Proxy server error when fetching subscription details',
          details: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
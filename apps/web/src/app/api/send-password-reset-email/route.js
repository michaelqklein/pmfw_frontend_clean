export async function POST(req) {
    try {
      const body = await req.json();
  
      const response = await fetch(`${process.env.EMAIL_PROXY_URL}/send-password-reset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERNAL_API_KEY,
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Proxy error (send-password-reset-email):', error);
      return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
  }
  
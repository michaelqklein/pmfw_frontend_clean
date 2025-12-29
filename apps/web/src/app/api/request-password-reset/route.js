export async function POST(req) {
    try {
      console.log('Proxy API route /request-password-reset has been called and is running.');
      console.log('INTERNAL_API_KEY:', process.env.INTERNAL_API_KEY);
      console.log('SQL_PROXY_URL:', process.env.SQL_PROXY_URL);
      const body = await req.json();
  
      const response = await fetch(`${process.env.SQL_PROXY_URL}/request-password-reset`, {
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
      console.error('Proxy error (request-password-reset):', error);
      return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
  }
  
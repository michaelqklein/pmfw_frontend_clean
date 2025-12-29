// app/api/send-email/route.js
export async function POST(req) {

    // console.log("EMAIL_PROXY_URL: ", process.env.EMAIL_PROXY_URL);
    try {
      const body = await req.json();
  
      const response = await fetch(`${process.env.EMAIL_PROXY_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Email proxy error:', error);
      return new Response(JSON.stringify({ message: 'Server error' }), {
        status: 500,
      });
    }
  }
  
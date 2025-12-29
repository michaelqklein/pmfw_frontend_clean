export async function GET(req, { params }) {
    const backendUrl = process.env.SQL_PROXY_URL;
    const { user_ID } = params;
  
    const response = await fetch(`${backendUrl}/get-performance-data/${user_ID}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
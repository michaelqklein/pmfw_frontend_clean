// src/app/api/add-user/route.js

export async function POST(req) {
    const backendUrl = process.env.SQL_PROXY_URL; 
    
    try {
      const body = await req.json();
  
      console.log('[Proxy] /api/add-user accessed');
      console.log('[Proxy] Request body:', body);
  
      const response = await fetch(`${backendUrl}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('[Proxy] Error from SQL server:', data);
      } else {
        console.log('[Proxy] User added successfully');
      }
  
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error('[Proxy] Network or parsing error:', error);
      return new Response(
        JSON.stringify({ error: 'Proxy error adding user', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  

  // src/app/api/login/route.js
export async function POST(req) {
  const backendUrl = process.env.SQL_PROXY_URL;

  console.log('[Proxy] /api/login accessed');
  console.log('[Proxy] SQL_PROXY_URL:', backendUrl);

  if (!backendUrl) {
    console.error('[Proxy] SQL_PROXY_URL is not defined');
    return new Response(
      JSON.stringify({ error: 'Proxy misconfiguration: SQL_PROXY_URL not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const url = `${backendUrl}/login`;

    // Avoid logging sensitive fields like password
    const { password, ...redactedBody } = body || {};
    console.log('[Proxy] Forwarding to:', url);
    console.log('[Proxy] Request body (redacted):', redactedBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Proxy] Backend error status:', response.status, 'response:', data);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Proxy] Login proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy error during login', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

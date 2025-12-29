export async function POST(request) {
    try {
        const backendUrl = process.env.STRIPE_PROXY_URL;
        if (!backendUrl) {
            throw new Error('STRIPE_PROXY_URL is not defined');
        }
  
        const body = await request.json();
        console.log('Proxy received body:', body); // Log the body received from the frontend
  
        // Send request to backend
        const response = await fetch(`${backendUrl}/api/create-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
  
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`Backend responded with status ${response.status}`);
        }
  
        // Get and log the response data
        const data = await response.json();
        console.log('Proxy received response from backend:', data); // Log the response from the backend
  
        // If the response contains an error, throw it
        if (data.error) {
            throw new Error(data.error);
        }
  
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Proxy error (create-subscription):', error.message);
        return new Response(
            JSON.stringify({ error: `Proxy failed: ${error.message}` }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
  }
  
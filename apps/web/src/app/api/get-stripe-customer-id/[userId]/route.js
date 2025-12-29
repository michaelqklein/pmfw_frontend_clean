// /src/app/api/get-stripe-customer-id/[userId]/route.js

export async function GET(_request, { params }) {
    const { userId } = params;
    console.log("In get-stripe-customer-id: SQL_PROXY_URL: ", process.env.SQL_PROXY_URL);

    try {
        const backendUrl = process.env.SQL_PROXY_URL;
        if (!backendUrl) {
            console.error("SQL_PROXY_URL not defined");
            return new Response(JSON.stringify({ error: "Proxy misconfiguration" }), { status: 500 });
        }

        const url = `${backendUrl}/get-stripe-customer-id/${userId}`;
        console.log("Proxying request to:", url);

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Backend error: ${response.status}`);
            return new Response(JSON.stringify({ error: "Failed to fetch customer ID" }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return new Response(JSON.stringify({ error: "Internal Proxy Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

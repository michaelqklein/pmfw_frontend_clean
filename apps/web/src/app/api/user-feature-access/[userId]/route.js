export async function GET(_request, { params }) {
    const { userId } = params;

    try {
        console.log("SQL_PROXY_URL: ", process.env.SQL_PROXY_URL);
        const backendUrl = process.env.SQL_PROXY_URL; // Adjust as needed
        if (!backendUrl) {
            throw new Error('SQL_PROXY_URL is not defined');
        }
        console.log("Requesting data from:", `${backendUrl}/user-feature-access/${userId}`);

        const response = await fetch(`${backendUrl}/user-feature-access/${userId}`);

        if (!response.ok) {
            console.error(`Backend error: ${response.status}`);
            return new Response(JSON.stringify({ error: "Failed to fetch feature access." }), {
                status: response.status
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new Response(JSON.stringify({ error: "Internal Proxy Error" }), {
            status: 500
        });
    }
}

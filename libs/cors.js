export const cors = (handler) => {
  return async (req) => {
    // Handle OPTIONS requests for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200, // 200 OK for preflight requests
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all domains
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Allowed methods
          "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allowed headers
          "Access-Control-Max-Age": "86400", // Cache preflight response for 1 day
        },
      });
    }

    // Handle other requests (GET, POST, etc.)
    const response = await handler(req);

    // Ensure CORS headers are added to all responses
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*"); // Allow all domains

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
};

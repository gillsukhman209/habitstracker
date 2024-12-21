export const cors = (handler) => {
  return async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://your-frontend-domain.com", // Change to your frontend domain
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const response = await handler(req);

    return new Response(response.body, {
      ...response,
      headers: {
        ...response.headers,
        "Access-Control-Allow-Origin": "https://your-frontend-domain.com", // Change to your frontend domain
      },
    });
  };
};

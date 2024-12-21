import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    const { API_SECRET_TOKEN } = process.env;
    const authHeader = req.headers.get("Authorization");

    if (!API_SECRET_TOKEN) {
      return new Response(JSON.stringify({ error: "No API_SECRET_TOKEN" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (authHeader !== `Bearer ${API_SECRET_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Verify the Authorization header
    // if (!authHeader || authHeader !== `Bearer ${API_SECRET_TOKEN}`) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const sendDailyUrl = `${protocol}://${host}/api/cron/sendDaily`;

    // Execute sendDaily cron job
    const sendDailyRes = await fetch(sendDailyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!sendDailyRes.ok) {
      throw new Error("Failed to execute sendDaily cron job");
    }

    return new Response(
      JSON.stringify({ message: "Cron jobs executed successfully." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error running cron job:", error);
    return new Response(JSON.stringify({ error: "Error running cron job" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

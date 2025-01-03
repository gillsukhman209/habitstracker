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

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const resetAllHabitsUrl = `${protocol}://${host}/api/cron/resetAllHabits`;

    // Execute resetAllHabits cron job with authorization
    const resetAllHabitsRes = await fetch(resetAllHabitsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_SECRET_TOKEN}`, // Sending the authorization token
      },
    });

    if (!resetAllHabitsRes.ok) {
      throw new Error("Failed to execute resetAllHabits cron job");
    }

    return new Response("Habits reset successfully.", { status: 200 });
  } catch (error) {
    console.error("Error runnsing resetAllHabits job: in resetHabits", error);
    return new Response(
      `Error running resetAllHsabits job in resetHabits: ${error.message}`,
      {
        status: 500,
      }
    );
  }
});

import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    console.log("Running cron job");

    // Construct absolute URL using request headers
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const sendDailyUrl = `${protocol}://${host}/api/cron/sendDaily`;
    const resetAllHabitsUrl = `${protocol}://${host}/api/cron/resetAllHabits`;

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

    // Execute resetAllHabits cron job
    const resetAllHabitsRes = await fetch(resetAllHabitsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!resetAllHabitsRes.ok) {
      throw new Error("Failed to execute resetAllHabits cron job");
    }

    return new Response("Cron jobs executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error running cron job:", error);
    return new Response("Error running cron job", { status: 500 });
  }
});

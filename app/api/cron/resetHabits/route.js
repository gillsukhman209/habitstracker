import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const resetAllHabitsUrl = `${protocol}://${host}/api/cron/resetAllHabits`;

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

    return new Response("Habits reset successfully.", { status: 200 });
  } catch (error) {
    console.error("Error running resetAllHabits job:", error);
    return new Response("Error running resetAllHabits job", { status: 500 });
  }
});

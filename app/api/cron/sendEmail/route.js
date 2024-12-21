import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
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

    return new Response("Cron jobs executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error running cron job:", error);
    return new Response("Error running cron job", { status: 500 });
  }
});

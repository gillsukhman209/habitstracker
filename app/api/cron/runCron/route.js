import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    console.log("Running cron job");
    // Server-side POST request to sendDaily
    const res = await fetch("/api/cron/sendDaily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to execute sendDaily cron job");
    }

    return new Response("Cron job executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error running cron job:", error);
    return new Response("Error running cron job", { status: 500 });
  }
});

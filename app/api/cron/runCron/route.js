import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    console.log("Running cron job");

    // Construct absolute URL using request headers
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const url = `${protocol}://${host}/api/cron/sendDaily`;

    const res = await fetch(url, {
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

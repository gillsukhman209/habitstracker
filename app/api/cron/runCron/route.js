import { cors } from "@/libs/cors";

export const GET = cors(async (req) => {
  try {
    console.log("Running cron job");
    // Make post request to sendDaily
    const res = await fetch("https://21habits.co/api/cron/sendDaily", {
      method: "POST",
    });

    return new Response("Cron job executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error running cron job:", error);
    return new Response("Error running cron job", { status: 400 });
  }
});

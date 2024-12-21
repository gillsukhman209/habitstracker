import { cors } from "@/libs/cors";

export async function GET() {
  try {
    console.log("Running cron job");
    // Make post request to sendDaily
    const res = await fetch("https://21habits.co/api/cron/sendDaily", {
      method: "POST",
    });

    return new Response("Default response", { status: 200, res: res });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return new Response("Error running cron job", { status: 400 });
  }
}

export const handler = cors(GET);

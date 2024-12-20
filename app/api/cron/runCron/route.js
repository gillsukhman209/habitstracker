export async function GET() {
  try {
    // Make post request to sendDaily
    await fetch("/api/cron/sendDaily", {
      method: "POST",
    });

    return new Response("Cron job run successfully", { status: 200 });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return new Response("Error running cron job", { status: 500 });
  }
}

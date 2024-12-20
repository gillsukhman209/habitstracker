export async function GET() {
  try {
    console.log("Running cron job");
    // Make post request to sendDaily
    await fetch("https://21habits.co/api/cron/sendDaily", {
      method: "POST",
    }).then((res) => {
      return new Response("Cron job run successfully", {
        status: 200,
        res: res,
      });
    });

    console.log("Cron job run successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return new Response("Error running cron job", { status: 400 });
  }
}

import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // Add headers to prevent caching
    const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };

    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Fetching users...");
    const users = await User.find({}, "email").lean();

    if (users.length === 0) {
      console.log("No users to send emails to.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to send emails to.",
        }),
        { status: 200, headers }
      );
    }

    console.log(`Found ${users.length} users. Sending emails...`);

    const emailPromises = users.map((user) =>
      resend.emails.send({
        from: "21habits <onboarding@21habits.co>",
        to: user.email,
        subject: "21habits Reminder",
        html: `<p>Don't forget to complete your daily habits today!</p>`,
      })
    );

    await Promise.all(emailPromises).then(() => {
      console.log("Emails sent successfully.");
      return new Response(
        JSON.stringify({
          success: true,
          message: `Emails sent to ${users.length} users.`,
        }),
        { status: 200, headers }
      );
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: "Failed to send emails." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

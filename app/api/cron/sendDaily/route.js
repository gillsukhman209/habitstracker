import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { cors } from "@/libs/cors";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = cors(async (req) => {
  try {
    const { API_SECRET_TOKEN } = process.env;
    const authHeader = req.headers.get("Authorization");

    // Verify the Authorization header
    if (!authHeader || authHeader !== `Bearer ${API_SECRET_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Fetching users...");
    const users = await User.find({}, "email");

    if (users.length === 0) {
      console.log("No users to send emails to.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to send emails to.",
        }),
        { status: 200 }
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

    await Promise.all(emailPromises);

    console.log("Emails sent successfully.");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${users.length} users.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: "Failed to send emails." }), {
      status: 500,
    });
  }
});

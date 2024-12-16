import { Resend } from "resend";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import pLimit from "p-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handles POST requests to send an email via Resend.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Response} - The response object with status and message.
 */

export const maxDuration = 1000;
export async function GET() {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Fetching users...");
    const users = await User.find({}, "email").lean();

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users to send emails to.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${users.length} users. Sending emails...`);
    const limit = pLimit(CONCURRENT_LIMIT);

    const emailPromises = users.map((user) =>
      limit(() =>
        resend.emails.send({
          from: "21habits <onboarding@21habits.co>",
          to: user.email,
          subject: "21habits Reminder",
          html: `<p>Don't forget to complete your daily habits!</p>`,
        })
      )
    );

    await Promise.all(emailPromises);

    console.log("All emails sent successfully!");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${users.length} users`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: "Failed to send emails" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
